'use client'
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../db/firebase';  // Adjust the import path accordingly
import { usePathname } from "next/navigation";
import { Button, Container, TextField, CircularProgress, Typography, FormControl, InputLabel, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/system';

const StyledContainer = styled(Container)({
    padding: '32px',
});

const StyledDatePicker = styled('div')({
    margin: '16px 0',
});

const StyledButton = styled(Button)({
    margin: '16px 0',
});


const exampleStartBalanceData = [
    { accountCode: '1910', balance: 1050 },
];

const NewFiscalYear: React.FC = () => {
    const [fiscalYearSpan, setFiscalYearSpan] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    // Here we are using pathname to get the id of the account for which we are creating a new fiscal year
    const pathSegments = pathname.split('/');
    const accountId = pathSegments[pathSegments.length - 2];  // This gets us the second to last segment of the url which is the account id we want

    
    const handleCreateFiscalYear = async () => {
        if (fiscalYearSpan.start && fiscalYearSpan.end && accountId) {
            const newFiscalYearData = {
                accountId,
                fiscalYearSpan,
            };
            
            setLoading(true);
            try {
                const fiscalYearRef = await addDoc(collection(db, "fiscalYears"), newFiscalYearData);
                console.log("Document written with ID: ", fiscalYearRef.id);
            } catch (error) {
                setError("Error creating fiscal year: " + (error as Error).message);
            } finally {
                setLoading(false);
            }
        }
    };


    return (
        <StyledContainer>
            <Typography variant="h4">Create New Fiscal Year</Typography>
            
            <StyledDatePicker>
                <FormControl fullWidth margin="normal" variant="outlined">
                    Start Date
                    <TextField
                        id="start-date"
                        type="date"
                        value={fiscalYearSpan.start ? fiscalYearSpan.start.toISOString().split('T')[0] : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiscalYearSpan(prev => ({...prev, start: new Date(e.target.value)}))}
                        
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" variant="outlined">
                    End Date
                    <TextField
                        id="end-date"
                        type="date"
                        value={fiscalYearSpan.end ? fiscalYearSpan.end.toISOString().split('T')[0] : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiscalYearSpan(prev => ({...prev, end: new Date(e.target.value)}))}
                        
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
                    {exampleStartBalanceData.map((data, index) => (
                        <TableRow key={index}>
                            <TableCell>{data.accountCode}</TableCell>
                            <TableCell>{data.balance}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <StyledButton variant="contained" color="primary" onClick={handleCreateFiscalYear} disabled={loading}>
                Create Fiscal Year
            </StyledButton>
        </StyledContainer>
    );
};

export default NewFiscalYear;