'use client'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../db/firebase'; // Adjust the import path accordingly
import {
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
interface CoaAccount {
    code: string;
    name: string;
}

const ChartOfAccountsPage = () => {
    const [accounts, setAccounts] = useState<CoaAccount[]>([]);
    const [newAccount, setNewAccount] = useState<CoaAccount>({ code: '', name: '' });
    const [templateName, setTemplateName] = useState<string>('');

  useEffect(() => {
    // Fetch existing CoA templates/accounts from Firebase on page load
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, 'chartOfAccountsTemplates'));
      // For simplicity, load the first template found for the WIP
      const firstDoc = querySnapshot.docs[0];
      if (firstDoc) {
        setAccounts(firstDoc.data().accounts);
        setTemplateName(firstDoc.data().templateName);
      }
    };
    fetchAccounts();
  }, []);

  const handleAccountChange = (index: number, field: string, value: string) => {
    const updatedAccounts: any = [...accounts];
    updatedAccounts[index][field] = value;
    setAccounts(updatedAccounts);
  };

  const handleNewAccountChange = (field: string, value: string) => {
    setNewAccount(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    setAccounts(prev => [...prev, newAccount]);
    setNewAccount({ code: '', name: '' });
  };

  const handleSaveTemplate = async () => {
    try {
      await addDoc(collection(db, 'chartOfAccountsTemplates'), {
        templateName,
        accounts,
      });
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  return (
    <Container>
      <TextField
        label="Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Account Code</TableCell>
            <TableCell>Account Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  value={account.code}
                  onChange={(e) => handleAccountChange(index, 'code', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={account.name}
                  onChange={(e) => handleAccountChange(index, 'name', e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <TextField
                placeholder="New Account Code"
                value={newAccount.code}
                onChange={(e) => handleNewAccountChange('code', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <TextField
                placeholder="New Account Name"
                value={newAccount.name}
                onChange={(e) => handleNewAccountChange('name', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Button onClick={handleAddAccount}>Add Account</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button variant="contained" color="primary" onClick={handleSaveTemplate}>
        Save Template
      </Button>
    </Container>
  );
};

export default ChartOfAccountsPage;
