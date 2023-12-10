"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, collection, getDoc } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import {
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  styled,
  Autocomplete,
} from "@mui/material";
import { runTransaction } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../../db/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Entry {
  accountId: string;
  debit: number | null;
  credit: number | null;
}

interface AccountOption {
  code: number;
  name: string;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  fiscalYearId: string;
  proofFileURL: string;
  description: string;
}

const Input = styled("input")({
  display: "none",
});

const drawerWidth = 240;

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  marginLeft: `${drawerWidth}px`, // Drawer width
  marginRight: "auto", // Automatically adjust the right margin
  width: `calc(100% - ${drawerWidth}px)`, // Adjust the width of the container
  display: "flex",
  flexDirection: "column", // Stack children vertically
  alignItems: "center", // Center children horizontally
}));

const NewTransactionPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [description, setDescription] = useState("");
  const [isBalanced, setIsBalanced] = useState(false);
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const accountId = pathSegments[pathSegments.length - 5];
  const fiscalYearId = pathSegments[pathSegments.length - 3];
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [accountCodes, setAccountCodes] = useState([]);
  const [transactionDate, setTransactionDate] = useState("");

  const [newEntry, setNewEntry] = useState<Entry>({
    accountId: "",
    debit: null,
    credit: null,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAccountCodes = async () => {
      // Ensure that accountId is the correct ID from the "accounts" collection
      const accountDoc = await getDoc(doc(db, "organisations", accountId));
      const accountData = accountDoc.data();
      if (accountData) {
        const accountingPlanId = accountData.accountingPlan;

        // Fetch account codes based on the accounting plan ID
        const planDoc = await getDoc(
          doc(db, "chartOfAccountsTemplates", accountingPlanId)
        );
        const planData = planDoc.data();
        if (planData && planData.accounts) {
          setAccountCodes(planData.accounts);
        }
      }
    };

    fetchAccountCodes();
  }, [accountId]);

  const updateTotals = (entries: Entry[], newEntry: Entry) => {
    const debits =
      entries.reduce((acc, entry) => acc + (entry.debit || 0), 0) +
      (newEntry.debit || 0);
    const credits =
      entries.reduce((acc, entry) => acc + (entry.credit || 0), 0) +
      (newEntry.credit || 0);
    setTotalDebits(debits);
    setTotalCredits(credits);
    setIsBalanced(debits === credits);
  };

  const handleDeleteEntry = (index: number) => {
    setEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (
    index: number,
    field: keyof Entry,
    newValue: any
  ) => {
    console.log(entries.length);
    setEntries((prevEntries) => {
      const updatedEntries = [...prevEntries];
      if (field === "accountId") {
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: newValue,
        };
      } else {
        const valueToUpdate = Number(newValue); // Convert to number for debit and credit
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: valueToUpdate,
        };
      }
      // Update totals after state has been set
      updateTotals(updatedEntries, newEntry);
      return updatedEntries;
    });
  };

  const handleAddEntry = () => {
    if (!newEntry.accountId || (newEntry.debit && newEntry.credit)) {
      alert("Each entry must have either a debit or a credit, not both.");
      return;
    }
    if (newEntry.debit === null && newEntry.credit === null) {
      alert("You must enter a value for debit or credit.");
      return;
    }
    const entryToAdd = {
      ...newEntry,
      debit: newEntry.debit || 0,
      credit: newEntry.credit || 0,
    };
    setEntries((prevEntries) => [...prevEntries, newEntry]);
    setNewEntry({ accountId: "", debit: null, credit: null });
  };

  const handleNewEntryChange = (field: keyof Entry, value: any) => {
    setNewEntry((prevNewEntry) => {
      const updatedNewEntry = {
        ...prevNewEntry,
        [field]: field === "accountId" ? value : Number(value),
      };
      // Update totals after state has been set
      updateTotals(entries, updatedNewEntry);
      return updatedNewEntry;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      console.log("File found!");
      setProofFile(file);
      setProofFileName(file.name); // Update the state with the file name
    } else {
      setProofFileName(null); // Reset the file name if no file is selected
    }
  };

  const uploadFileAndGetURL = async (file: File | null): Promise<string> => {
    if (!file) {
      throw new Error("No file selected.");
    }

    // Create a storage reference
    const fileRef = ref(storage, `proofs/${file.name}`);

    // Continue with file upload
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const validateAndSaveTransaction = async () => {
    // Calculate the total debits and credits
    const totalDebits = entries.reduce(
      (acc, entry) => acc + (entry.debit || 0),
      0
    );
    const totalCredits = entries.reduce(
      (acc, entry) => acc + (entry.credit || 0),
      0
    );

    // Check if the transaction is balanced
    if (totalDebits !== totalCredits) {
      alert(
        "The transaction is not balanced. The total debits and credits must be equal."
      );
      return;
    }

    // If the transaction is balanced, proceed to save the transaction
    try {
      await runTransaction(db, async (transaction) => {
        let proofFileURL = "";
        if (proofFile) {
          proofFileURL = await uploadFileAndGetURL(proofFile);
        }
        const newTransactionRef = doc(collection(db, "transactions"));

        // Construct the new transaction object
        const newTransaction: Transaction = {
          id: newTransactionRef.id,
          entries,
          date: transactionDate || new Date().toISOString(),
          fiscalYearId,
          proofFileURL: proofFileURL,
          description,
        };

        // Set the new transaction in the database
        transaction.set(newTransactionRef, newTransaction);

        // Update account balances if necessary
        // You might need to adjust this logic based on how your application is supposed to work
      });

      alert("Transaction saved successfully!");
      router.push(`/accounting/${accountId}/fiscalYears/${fiscalYearId}/`);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  useEffect(() => {
    const debits = entries.reduce((acc, entry) => acc + (entry.debit || 0), 0);
    const credits = entries.reduce(
      (acc, entry) => acc + (entry.credit || 0),
      0
    );
    setTotalDebits(debits);
    setTotalCredits(credits);
    setIsBalanced(debits === credits);
  }, [entries]);

  const renderEntryRow = (entry: Entry, index: number) => (
    <TableRow key={index}>
      <TableCell>
        <Autocomplete
          freeSolo
          options={accountCodes}
          getOptionLabel={(option: any) => {
            // Check if option is an object and has properties 'code' and 'name'
            if (option && typeof option === "object") {
              return `${option.code} - ${option.name}`;
            }
            // Return the string as is if it's not an object
            return option;
          }}
          value={entry.accountId}
          onChange={(event, newValue: any) => {
            if (typeof newValue === "object" && newValue !== null) {
              handleEntryChange(
                index,
                "accountId",
                `${newValue.code} - ${newValue.name}`
              );
            } else {
              handleEntryChange(index, "accountId", newValue);
            }
          }}
          renderOption={(props, option) => {
            // This is used to render the options in the dropdown menu

            return (
              <li {...props}>
                {option.code} - {option.name}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Account Code" />
          )}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={entry.debit}
          onChange={(e) => handleEntryChange(index, "debit", e.target.value)}
          size="small"
          inputProps={{ min: 0 }} // Ensure that the user can only enter positive numbers
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={entry.credit}
          onChange={(e) => handleEntryChange(index, "credit", e.target.value)}
          size="small"
          inputProps={{ min: 0 }} // Ensure that the user can only enter positive numbers
        />
      </TableCell>
      <TableCell>
        <Button
          onClick={() => handleDeleteEntry(index)}
          variant="contained"
          color="secondary"
        >
          Ta bort
        </Button>
      </TableCell>
    </TableRow>
  );

  useEffect(() => {
    console.log(entries.length);
  }, [entries]);

  return (
    <StyledContainer>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          router.push(`/accounting/${accountId}/fiscalYears/${fiscalYearId}/`)
        }
        sx={{ position: "absolute", top: 16, left: `calc(240px + 16px)` }}
      >
        Tillbaka
      </Button>
      <Typography variant="h4" gutterBottom>
        Ny transaktion
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          width: "100%",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">
            Totalt debiterat: {totalDebits}
          </Typography>
          <Typography variant="body1">
            Totalt krediterat: {totalCredits}
          </Typography>
          <Typography variant="body1">
            Saldo: {totalDebits - totalCredits}
          </Typography>
        </Box>
        <TextField
          label="Beskrivning"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />

        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <label htmlFor="contained-button-file">
            <Input
              accept=".pdf,image/*"
              id="contained-button-file"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              component="span"
              sx={{ width: "auto", height: 36 }}
            >
              Ladda upp fil
            </Button>
          </label>
          {proofFileName && (
            <Typography sx={{ ml: 2 }}>{proofFileName}</Typography>
          )}
        </Box>
      </Box>
      <TextField
        type="date"
        label="Date"
        InputLabelProps={{
          shrink: true,
        }}
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
      />
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kontonummer</TableCell>
              <TableCell>Debet</TableCell>
              <TableCell>Kredit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(renderEntryRow)}
            {/* Render the new entry row separately */}
            {renderEntryRow(newEntry, entries.length)}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button onClick={handleAddEntry} variant="contained" color="primary">
          Lägg till rad
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button
          onClick={validateAndSaveTransaction}
          variant="contained"
          color="primary"
          disabled={entries.length === 0} // Disable button if no entries
        >
          Spara transaktion
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default NewTransactionPage;
