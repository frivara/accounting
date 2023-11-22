"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, setDoc, collection } from "firebase/firestore";
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
} from "@mui/material";
import { runTransaction, increment } from "firebase/firestore";

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

  const [newEntry, setNewEntry] = useState<Entry>({
    accountId: "",
    type: "debit",
    amount: 0,
    description: "",
  });

  const router = useRouter();

  const handleAddEntry = () => {
    if (!newEntry.accountId || newEntry.amount <= 0) {
      alert(
        "Please fill in all fields and ensure the amount is greater than zero."
      );
      return;
    }
    setEntries((prevEntries) => [...prevEntries, newEntry]);
    setNewEntry({ accountId: "", type: "debit", amount: 0, description: "" });
  };

  const handleNewEntryChange = (field: keyof Entry, value: any) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }));
  };

  const validateAndSaveTransaction = async () => {
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

  const renderEntryRow = (entry: Entry, index: number) => (
    <TableRow key={index}>
      <TableCell>
        <TextField
          value={entry.accountId}
          onChange={(e) => handleNewEntryChange("accountId", e.target.value)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={entry.counterAccountId}
          onChange={(e) =>
            handleNewEntryChange("counterAccountId", e.target.value)
          }
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          select
          value={entry.type}
          onChange={(e) => handleNewEntryChange("type", e.target.value)}
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
            handleNewEntryChange("amount", parseFloat(e.target.value) || 0)
          }
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={entry.description}
          onChange={(e) => handleNewEntryChange("description", e.target.value)}
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

  return (
    <div>
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
    </div>
  );
};

export default NewTransactionPage;
