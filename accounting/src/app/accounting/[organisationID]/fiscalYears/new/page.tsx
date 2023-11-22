"use client";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../db/firebase"; // Adjust the import path accordingly
import { useRouter, usePathname } from "next/navigation";
import {
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledContainer = styled(Container)({
  padding: "32px",
  marginLeft: "15vw", // Adjust this value to match your navbar's height
});

const StyledDatePicker = styled("div")({
  margin: "16px 0",
});

const StyledButton = styled(Button)({
  margin: "16px 0",
});

interface BalanceData {
  accountCode: string;
  balance: number;
}

const NewFiscalYear: React.FC = () => {
  const [fiscalYearSpan, setFiscalYearSpan] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [error, setError] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    accountCode: "",
    accountName: "",
    balance: 0,
  });
  const [startBalances, setStartBalances] = useState<any[]>([]); // New state for fetched start balances
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Here we are using pathname to get the id of the account for which we are creating a new fiscal year
  const pathSegments = pathname.split("/");
  const organisationId = pathSegments[pathSegments.length - 3]; // This gets us the second to last segment of the url which is the account id we want

  const handleNewAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount((prevAccount) => ({
      ...prevAccount,
      [name]: name === "balance" ? parseFloat(value) : value,
    }));
  };

  useEffect(() => {
    console.log("Startbalances: " + startBalances);
  }, [startBalances]);

  const handleAddAccount = () => {
    // Create a new balance entry with a nested structure
    const balanceToAdd = {
      balance: {
        accountCode: newAccount.accountCode,
        balance: newAccount.balance, // This should be a number
      },
    };

    // Add the new balance entry to the startBalances array
    setStartBalances((prevBalances) => [...prevBalances, balanceToAdd]);

    // Reset the new account input form
    setNewAccount({ accountCode: "", accountName: "", balance: 0 });
  };

  useEffect(() => {
    // Function to fetch data.
    const fetchData = async () => {
      setLoading(true);
      try {
        // Here we fetch the last closed fiscal year's balances
        const startingBalances = await fetchLastClosedYearBalances();

        // Log the object to see what you're receiving
        console.log("Starting balances object:", startingBalances);

        // Transform the object into an array of objects with accountCode and balance properties
        const balancesArray = Object.entries(startingBalances).map(
          ([accountCode, balance]) => ({
            accountCode,
            balance: balance as unknown as number, // Assuming balance is a number
          })
        );

        // Log the array to verify its structure before updating the state
        console.log("Balances array for state:", balancesArray);

        // Update the state with this new array
        setStartBalances(balancesArray);
      } catch (error: any) {
        setError("Error fetching last year's balances: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (organisationId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationId]);

  const handleCreateFiscalYear = async () => {
    if (fiscalYearSpan.start && fiscalYearSpan.end && organisationId) {
      setLoading(true);
      try {
        // Fetch the final balances from the last closed fiscal year
        const fetchedBalances = await fetchLastClosedYearBalances();

        // Combine fetched balances with manually added balances
        const combinedBalances = [...fetchedBalances, ...startBalances];

        // Log combined balances to see if they're correct
        console.log("Combined balances: ", combinedBalances);

        // Prepare the new fiscal year data
        const newFiscalYearData = {
          accountId: organisationId,
          fiscalYearSpan,
          balances: combinedBalances,
          isClosed: false, // Initialize as not closed
        };

        // Create the new fiscal year
        const fiscalYearRef = await addDoc(
          collection(db, "fiscalYears"),
          newFiscalYearData
        );
        console.log("Document written with ID: ", fiscalYearRef.id);

        // Navigate to the next page or show success message
        router.push(`/accounting/${organisationId}/`);
      } catch (error) {
        setError("Error creating fiscal year: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  async function fetchLastClosedYearBalances() {
    try {
      // Query to get the last closed fiscal year
      const fiscalYearsQuery = query(
        collection(db, "fiscalYears"),
        where("accountId", "==", organisationId), // Make sure to filter by accountId
        where("isClosed", "==", true),
        orderBy("fiscalYearSpan.end", "desc"), // Adjust to the correct field
        limit(1)
      );
      const fiscalYearsSnapshot = await getDocs(fiscalYearsQuery);

      if (!fiscalYearsSnapshot.empty) {
        const lastFiscalYearDoc = fiscalYearsSnapshot.docs[0];

        // Now we get the balances subcollection from the last fiscal year document
        const balancesCollectionRef = collection(
          lastFiscalYearDoc.ref,
          "balances"
        );
        const balancesSnapshot = await getDocs(balancesCollectionRef);

        if (!balancesSnapshot.empty) {
          return balancesSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              accountCode: doc.id, // Make sure this is correct
              balance: data.balance, // Make sure data.balance is correct
            };
          });
        } else {
          console.log("No balances found in the subcollection");
          return [];
        }
      } else {
        console.log("No documents found with 'isClosed' set to true");
        return [];
      }
    } catch (error) {
      console.error("Error fetching last closed year balances:", error);
      throw error;
    }
  }

  const refreshBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const balances = await fetchLastClosedYearBalances();
      setStartBalances(balances);
    } catch (error: any) {
      setError("Failed to fetch balances: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("Start Balances:", startBalances);

  return (
    <StyledContainer>
      <Typography variant="h4">Create New Fiscal Year</Typography>

      <StyledDatePicker>
        <FormControl fullWidth margin="normal" variant="outlined">
          Start Date
          <TextField
            id="start-date"
            type="date"
            value={
              fiscalYearSpan.start
                ? fiscalYearSpan.start.toISOString().split("T")[0]
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFiscalYearSpan((prev) => ({
                ...prev,
                start: new Date(e.target.value),
              }))
            }
          />
        </FormControl>
        <FormControl fullWidth margin="normal" variant="outlined">
          End Date
          <TextField
            id="end-date"
            type="date"
            value={
              fiscalYearSpan.end
                ? fiscalYearSpan.end.toISOString().split("T")[0]
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFiscalYearSpan((prev) => ({
                ...prev,
                end: new Date(e.target.value),
              }))
            }
          />
        </FormControl>
      </StyledDatePicker>

      <Typography variant="h6">Input/view start balance of accounts</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Account Code</TableCell>
            <TableCell>Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {startBalances.map((balanceEntry, index) => (
            <TableRow key={index}>
              <TableCell>{balanceEntry.balance.accountCode}</TableCell>
              <TableCell>{balanceEntry.balance.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h6">Input new account details</Typography>
      <TextField
        label="Account Code"
        name="accountCode"
        value={newAccount.accountCode}
        onChange={handleNewAccountChange}
      />
      <TextField
        label="Account Name"
        name="accountName"
        value={newAccount.accountName}
        onChange={handleNewAccountChange}
      />
      <TextField
        label="Balance"
        name="balance"
        type="number"
        value={newAccount.balance}
        onChange={handleNewAccountChange}
      />
      <Button onClick={handleAddAccount}>Add Account</Button>
      <Button onClick={refreshBalances} disabled={loading}>
        Refresh Balances
      </Button>

      <StyledButton
        variant="contained"
        color="primary"
        onClick={handleCreateFiscalYear}
        disabled={loading}
      >
        Create Fiscal Year
      </StyledButton>
    </StyledContainer>
  );
};

export default NewFiscalYear;
