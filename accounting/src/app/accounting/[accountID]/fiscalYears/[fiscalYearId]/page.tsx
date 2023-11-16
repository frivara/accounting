'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc, collection, query, where, updateDoc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../../../../db/firebase";
import { useState, useEffect } from "react";
import Link from 'next/link';  
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from "@mui/material/Icon";

interface Transaction {
    id: string;
    entries: Entry[];
    date: string;
    fiscalYearId: string;
  }
  
  interface Entry {
    accountId: string;
    counterAccountId: string;
    type: 'debit' | 'credit';
    amount: number;
    description: string;
  }

  interface FinalBalances {
    [accountId: string]: number; 
  }
  

const FiscalYearPage: React.FC = () => {
    const [fiscalYear, setFiscalYear] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const fiscalYearId: string = pathSegments[pathSegments.length - 1]; 
    const accountId: string = pathSegments[pathSegments.length - 3];
    const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
    const [isYearClosed, setIsYearClosed] = useState<boolean>(false);
    
    // Fetch the fiscal year data from the database
    useEffect(() => {
    
        if (!fiscalYearId || typeof fiscalYearId !== 'string') {
            return;
        }
    
        const fiscalYearRef = doc(db, "fiscalYears", fiscalYearId);
    
        const unsubscribe = onSnapshot(fiscalYearRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
        
            const fiscalYearData = {
              id: doc.id,
              name: data?.name || '',
              startDate: data?.fiscalYearSpan?.start?.toDate().toLocaleDateString() || '',
              endDate: data?.fiscalYearSpan?.end?.toDate().toLocaleDateString() || '',
              isClosed: data?.isClosed || false // Add this line
            };
        
            setFiscalYear(fiscalYearData);
            setIsYearClosed(data?.isClosed || false); // Add this line
          }
        });
        

        
    
        return () => {
            unsubscribe();
        };
    }, [fiscalYearId]);

    useEffect(() => {
        if (!fiscalYearId || typeof fiscalYearId !== 'string') {
            return;
        }

        const transactionsQuery = query(
            collection(db, "transactions"),
            where("fiscalYearId", "==", fiscalYearId)
          );
        
          const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
            const fetchedTransactions: Transaction[] = [];
            querySnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              fetchedTransactions.push({
                id: docSnapshot.id,
                entries: data.entries,
                date: data.date,
                fiscalYearId: data.fiscalYearId
              });
            });
            
            // Sort transactions by date in descending order
            fetchedTransactions.sort((a, b) => b.date.localeCompare(a.date));
        
            setTransactions(fetchedTransactions);
          });
        
          return () => unsubscribe();
        }, [fiscalYearId]);


        const handleExpandClick = (transactionId: string) => {
            setExpandedTransactionId(prev => (prev === transactionId ? null : transactionId));
          };

    if (!fiscalYear) {
        return <div>Fiscal year not found</div>;
    }

    
    
    async function calculateFinalBalances(fiscalYearId: string): Promise<FinalBalances> {
      const balancesSnapshot = await getDocs(collection(db, 'fiscalYears', fiscalYearId, 'balances'));
      const finalBalances: FinalBalances = {};
      balancesSnapshot.forEach((doc) => {
        const data = doc.data();
        finalBalances[doc.id] = data.balance; // Assuming 'balance' is a number.
      });
      return finalBalances;
    }
    
  

   
    
    

    const closeFiscalYear = async () => {
      // Confirm with the user
      if (!window.confirm('Are you sure you want to close this fiscal year?')) {
        return;
      }
  
      try {
        // Here you would calculate the final balances
        const finalBalances = await calculateFinalBalances(fiscalYearId);
  
        // Create a new fiscal year document with the carried-over balances
        const newFiscalYearData = { /* ... new fiscal year data ... */ };
  
        // Mark the current fiscal year as closed
        await updateDoc(doc(db, 'fiscalYears', fiscalYearId), { isClosed: true });
  
        // Update the state to reflect the closed status
        setIsYearClosed(true);
  
        alert('The fiscal year has been closed and a new year has been created.');
      } catch (error) {
        console.error('Error closing fiscal year:', error);
        alert('Failed to close the fiscal year. Please try again.');
      }
    };

    return (
        <div>
          <h1>Fiscal Year</h1>
          <p>Name: {fiscalYear?.name}</p>
          <p>Start date: {fiscalYear?.startDate}</p>
          <p>End date: {fiscalYear?.endDate}</p>
          {!isYearClosed && (
        <Link href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}>
          <button>Create New Transaction</button>
        </Link>
      )}
          <div className="transactions-list">
        {transactions.map(transaction => (
          <Accordion 
            key={transaction.id} 
            expanded={expandedTransactionId === transaction.id} 
            onChange={() => handleExpandClick(transaction.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div>{transaction.entries[0].description} - {transaction.date}</div>
            </AccordionSummary>
            <AccordionDetails>
              <div>ID: {transaction.id}</div>
              {transaction.entries.map((entry, index) => (
                <div key={index}>
                  <div>{entry.type}: {entry.amount}</div>
                  <div>Account ID: {entry.accountId}</div>
                  <div>Counter Account ID: {entry.counterAccountId}</div>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      {!isYearClosed && (
        <button onClick={closeFiscalYear}>Close Fiscal Year</button>
      )}
    </div>
  );
};

export default FiscalYearPage;
