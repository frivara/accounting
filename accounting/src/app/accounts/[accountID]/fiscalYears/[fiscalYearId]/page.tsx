'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";
import { db } from "../../../../db/firebase";
import { useState, useEffect } from "react";
import Link from 'next/link';  
import router from "next/router";


interface FiscalYear {
    id: string;
    name: string;
    startDate: string,
    endDate: string
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
}

const FiscalYearPage: React.FC = () => {
    const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const fiscalYearId: string = pathSegments[pathSegments.length - 1]; 
    const accountId: string = pathSegments[pathSegments.length - 3];
    
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
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedTransactions.push({
                    id: doc.id,
                    description: data.description,
                    amount: data.amount,
                    date: data.date,
                });
            });
            setTransactions(fetchedTransactions);
        });

        return () => unsubscribe();
    }, [fiscalYearId]);


    const handleTransactionClick = (transactionId: string) => {
        const accountId: string = pathname.split('/')[2];
        router.push(`/accounts/${accountId}/fiscalYears/${fiscalYearId}/transactions/${transactionId}`);
    };

    if (!fiscalYear) {
        return <div>Fiscal year not found</div>;
    }

    return (
        <div>
            <h1>Fiscal Year</h1>
            <p>Name: {fiscalYear.name}</p>
            <p>Start date: {fiscalYear.startDate}</p>
            <p>End date: {fiscalYear.endDate}</p>
            <Link href={`/accounts/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}>
                <button>Create New Transaction</button>
            </Link>
            <div className="transactions-list">
                {transactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                        <Link 
                            href={`/accounts/${accountId}/fiscalYears/${fiscalYearId}/transactions/${transaction.id}`} 
                            passHref
                        >
                                {transaction.description} - ${transaction.amount} on {transaction.date}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FiscalYearPage;
