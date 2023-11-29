"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import {
  Button,
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
import { runTransaction, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../../db/firebase"; // Adjust this import path to where your Firebase storage is initialized
import AccountCodeSearch from "@/app/components/AccountCodeSearch";

interface Entry {
  accountId: string;
  counterAccountId?: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  fiscalYearId: string;
  proofFileURL: string;
}

const NewTransactionPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
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

  const [newEntry, setNewEntry] = useState<Entry>({
    accountId: "", // Ensure that this is an empty string
    type: "debit",
    amount: 0,
    description: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAccountCodes = async () => {
      // Ensure that accountId is the correct ID from the "accounts" collection
      const accountDoc = await getDoc(doc(db, "accounts", accountId));
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

  useEffect(() => {
    console.log(accountCodes);
  }, [accountCodes]);

  const handleAddEntry = () => {
    if (!newEntry.accountId || newEntry.amount <= 0) {
      alert(
        "Please fill in all fields and ensure the amount is greater than zero."
      );
      return;
    }
    setEntries((prevEntries) => [...prevEntries, newEntry]);
    setNewEntry({
      accountId: "",
      counterAccountId: "",
      type: "debit",
      amount: 0,
      description: "",
    });
  };

  const handleNewEntryChange = (
    index: number,
    field: keyof Entry,
    value: any
  ) => {
    if (index >= 0 && index < entries.length) {
      // Update existing entry
      const updatedEntries = [...entries];
      updatedEntries[index] = { ...updatedEntries[index], [field]: value };
      setEntries(updatedEntries);
    } else {
      // Update new entry
      setNewEntry((prev) => ({ ...prev, [field]: value }));
    }
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
    let proofFileURL = "";

    // If a file has been selected, upload it and get the URL
    if (proofFile) {
      try {
        proofFileURL = await uploadFileAndGetURL(proofFile);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
        return; // Stop the transaction from saving if file upload fails
      }
    } else {
      // If no file is selected, you might want to warn the user but still allow the transaction to be saved.
      if (
        !confirm(
          "Are you sure you want to save the transaction without a proof file?"
        )
      ) {
        return; // Stop the transaction if the user does not confirm
      }
    }

    const totalDebits = entries.reduce(
      (acc, entry) => (entry.type === "debit" ? acc + entry.amount : acc),
      0
    );
    const totalCredits = entries.reduce(
      (acc, entry) => (entry.type === "credit" ? acc + entry.amount : acc),
      0
    );

    if (totalDebits !== totalCredits) {
      alert("The sum of debits and credits must be equal.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const newTransactionRef = doc(collection(db, "transactions"));

        // Construct the new transaction object
        const newTransaction: Transaction = {
          id: newTransactionRef.id,
          entries,
          date: new Date().toISOString(),
          fiscalYearId,
          proofFileURL, // Use the proofFileURL here, it will be an empty string if no file was uploaded
        };

        // Set the new transaction in the database
        transaction.set(newTransactionRef, newTransaction);

        // Update each account balance involved in the new transaction
        entries.forEach((entry) => {
          const accountRef = doc(
            db,
            "fiscalYears",
            fiscalYearId,
            "balances",
            entry.accountId
          );
          transaction.set(
            accountRef,
            {
              balance: increment(
                entry.type === "debit" ? entry.amount : -entry.amount
              ),
            },
            { merge: true }
          );
        });
      });

      alert("Transaction saved successfully!");
      router.push(`/accounting/${accountId}/fiscalYears/${fiscalYearId}/`);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  useEffect(() => {
    const debits = entries
      .filter((e) => e.type === "debit")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const credits = entries
      .filter((e) => e.type === "credit")
      .reduce((acc, curr) => acc + curr.amount, 0);
    setTotalDebits(debits);
    setTotalCredits(credits);
  }, [entries]);

  const handleBalanceEntry = () => {
    // First, add the current new entry if it's valid
    if (
      !newEntry.accountId ||
      !newEntry.counterAccountId ||
      newEntry.amount <= 0
    ) {
      alert(
        "Please fill in all fields and ensure the amount is greater than zero."
      );
      return;
    }

    // Create the original entry based on the newEntry state
    const originalEntry: Entry = {
      ...newEntry,
      counterAccountId: newEntry.counterAccountId!,
    };

    // Then create the mirrored entry
    const mirroredEntry: Entry = {
      accountId: newEntry.counterAccountId!,
      counterAccountId: newEntry.accountId!,
      type: newEntry.type === "debit" ? "credit" : "debit", // Switch the type for the mirrored entry
      amount: newEntry.amount, // Same amount for the mirrored entry
      description: newEntry.description, // Same description for the mirrored entry
    };

    // Add both entries to the entries array
    setEntries((prevEntries) => [...prevEntries, originalEntry, mirroredEntry]);

    setIsBalanced(true);

    // Reset the newEntry state to be ready for a new entry
    setNewEntry({
      accountId: "",
      counterAccountId: "",
      type: "debit",
      amount: 0,
      description: "",
    });
  };

  const renderEntryRow = (entry: any, index: any) => (
    <TableRow key={index}>
      <TableCell>
        <Autocomplete
          freeSolo
          options={accountCodes}
          getOptionLabel={(option) =>
            typeof option === "string"
              ? option
              : `${option.code} - ${option.name}`
          }
          value={entry.accountId}
          onChange={(event, newValue) => {
            if (typeof newValue === "string") {
              handleNewEntryChange(index, "accountId", newValue);
            } else if (newValue) {
              handleNewEntryChange(index, "accountId", newValue.code);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Account Code" />
          )}
        />
      </TableCell>
      <TableCell>
        <Autocomplete
          freeSolo
          options={accountCodes}
          getOptionLabel={(option) =>
            typeof option === "string"
              ? option
              : `${option.code} - ${option.name}`
          }
          value={entry.counterAccountId}
          onChange={(event, newValue) => {
            if (typeof newValue === "string") {
              handleNewEntryChange(index, "counterAccountId", newValue);
            } else if (newValue) {
              handleNewEntryChange(index, "counterAccountId", newValue.code);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Counter Account Code" />
          )}
        />
      </TableCell>
      <TableCell>
        <TextField
          select
          value={entry.type}
          onChange={(e) => handleNewEntryChange(index, "type", e.target.value)}
          SelectProps={{ native: true }}
          size="small"
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={entry.amount}
          onChange={(e) =>
            handleNewEntryChange(
              index,
              "amount",
              parseFloat(e.target.value) || 0
            )
          }
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={entry.description}
          onChange={(e) =>
            handleNewEntryChange(index, "description", e.target.value)
          }
          size="small"
        />
      </TableCell>
      <TableCell>
        {!isBalanced && (
          <Button
            onClick={handleBalanceEntry}
            variant="contained"
            color="primary"
            disabled={entries.length > 0 && isTransactionBalanced()}
          >
            Balance Entry
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  const isTransactionBalanced = () => {
    const totalDebits = entries
      .filter((e) => e.type === "debit")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredits = entries
      .filter((e) => e.type === "credit")
      .reduce((acc, curr) => acc + curr.amount, 0);
    return totalDebits === totalCredits;
  };

  const StyledContainer = styled(Container)({
    padding: "32px",
    marginLeft: "14vw", // Adjust this value to match your navbar's height
  });

  return (
    <StyledContainer>
      <h1>New Transaction</h1>
      <div>
        <p>Total Debits: {totalDebits}</p>
        <p>Total Credits: {totalCredits}</p>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account ID</TableCell>
              <TableCell>Counter Account ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, index) => renderEntryRow(entry, index))}
            {renderEntryRow(newEntry, entries.length)}
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,image/*" // Accept only images and PDF
              />
              {proofFileName ? (
                <p>File selected: {proofFileName}</p>
              ) : (
                <p>No file selected</p>
              )}
            </div>
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleAddEntry} variant="contained" color="primary">
        Add Entry
      </Button>
      <Button
        onClick={validateAndSaveTransaction}
        variant="contained"
        color="primary"
      >
        Save Transaction
      </Button>
    </StyledContainer>
  );
};

export default NewTransactionPage;
