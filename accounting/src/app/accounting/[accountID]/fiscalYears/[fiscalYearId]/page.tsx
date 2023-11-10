'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";
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
  

const FiscalYearPage: React.FC = () => {
    const [fiscalYear, setFiscalYear] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const fiscalYearId: string = pathSegments[pathSegments.length - 1]; 
    const accountId: string = pathSegments[pathSegments.length - 3];
    const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
    
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
                    endDate: data?.fiscalYearSpan?.end?.toDate().toLocaleDateString() || ''
                };
        
                setFiscalYear(fiscalYearData);
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

    return (
        <div>
          <h1>Fiscal Year</h1>
          <p>Name: {fiscalYear?.name}</p>
          <p>Start date: {fiscalYear?.startDate}</p>
          <p>End date: {fiscalYear?.endDate}</p>
          <Link href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}>
            <button>Create New Transaction</button>
          </Link>
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
    </div>
  );
};

export default FiscalYearPage;
