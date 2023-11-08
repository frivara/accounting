'use client'
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Entry {
  accountId: string;
  counterAccountId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
}

const NewTransactionPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<Entry, 'counterAccountId'> & { counterAccountId?: string }>({
    accountId: '',
    counterAccountId: '',
    type: 'debit',
    amount: 0,
    description: ''
  });
  const router = useRouter();
  
  const handleAddEntry = () => {
    if (!newEntry.accountId || !newEntry.counterAccountId || newEntry.amount <= 0) {
      alert('Please fill in all fields and ensure the amount is greater than zero.');
      return;
    }
    // Create a balanced pair of debit and credit entries
    const debitEntry: Entry = {
      ...newEntry,
      type: 'debit',
      counterAccountId: newEntry.counterAccountId!
    };
    const creditEntry: Entry = {
      accountId: newEntry.counterAccountId!,
      counterAccountId: newEntry.accountId,
      type: 'credit',
      amount: newEntry.amount,
      description: newEntry.description
    };
    
    setEntries(prevEntries => [...prevEntries, debitEntry, creditEntry]);
    setNewEntry({ accountId: '', counterAccountId: '', type: 'debit', amount: 0, description: '' });
  };

  const validateAndSaveTransaction = async () => {
    // Ensure transaction is balanced
    const totalDebits = entries.filter(e => e.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredits = entries.filter(e => e.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0);
    
    if (totalDebits !== totalCredits) {
      alert('The sum of debits and credits must be equal.');
      return;
    }
    
    // Save the transaction to Firestore
    try {
      const newTransactionRef = doc(collection(db, 'transactions'));
      const newTransaction: Transaction = {
        id: newTransactionRef.id,
        entries,
        date: new Date().toISOString()
      };
      await setDoc(newTransactionRef, newTransaction);
      alert('Transaction saved successfully!');
      router.push(`/path/to/success/page`); // Redirect to a success page or transaction list
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  // Function to handle input changes for new entry
  const handleNewEntryChange = (field: keyof Entry, value: any) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  // Function to render a single entry row
  const renderEntryRow = (entry: Entry, index: number) => (
    <TableRow key={index}>
      <TableCell>
        <TextField
          value={entry.accountId}
          onChange={(e) => handleNewEntryChange('accountId', e.target.value)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={entry.counterAccountId}
          onChange={(e) => handleNewEntryChange('counterAccountId', e.target.value)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          select
          value={entry.type}
          onChange={(e) => handleNewEntryChange('type', e.target.value)}
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
          onChange={(e) => handleNewEntryChange('amount', parseFloat(e.target.value) || 0)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={entry.description}
          onChange={(e) => handleNewEntryChange('description', e.target.value)}
          size="small"
        />
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <h1>New Transaction</h1>
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
            {/* Row for adding new entry */}
            {renderEntryRow(newEntry as Entry, entries.length)}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleAddEntry} variant="contained" color="primary">
        Add Entry
      </Button>
      <Button onClick={validateAndSaveTransaction} variant="contained" color="primary">
        Save Transaction
      </Button>
    </div>
  );
};


export default NewTransactionPage;