'use client'
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Entry {
  accountId: string;
  counterAccountId?: string;
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
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [newEntry, setNewEntry] = useState<Entry>({
    accountId: '',
    type: 'debit',
    amount: 0,
    description: ''
  });

  const router = useRouter();

  const handleAddEntry = () => {
    if (!newEntry.accountId || newEntry.amount <= 0) {
      alert('Please fill in all fields and ensure the amount is greater than zero.');
      return;
    }
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setNewEntry({ accountId: '', type: 'debit', amount: 0, description: '' });
  };

  const validateAndSaveTransaction = async () => {
    const totalDebits = entries.filter(e => e.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredits = entries.filter(e => e.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0);
    
    if (totalDebits !== totalCredits) {
      alert('The sum of debits and credits must be equal.');
      return;
    }
    
    try {
      const newTransactionRef = doc(collection(db, 'transactions'));
      const newTransaction: Transaction = {
        id: newTransactionRef.id,
        entries,
        date: new Date().toISOString()
      };
      await setDoc(newTransactionRef, newTransaction);
      alert('Transaction saved successfully!');
      router.push(`/path/to/success/page`);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleNewEntryChange = (field: keyof Entry, value: any) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const debits = entries.filter(e => e.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0);
    const credits = entries.filter(e => e.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0);
    setTotalDebits(debits);
    setTotalCredits(credits);
  }, [entries]);

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
      <Button onClick={validateAndSaveTransaction} variant="contained" color="primary">
        Save Transaction
      </Button>
    </div>
  );
};

export default NewTransactionPage;
