'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import { Button } from '@mui/material';
import Link from 'next/link';

interface Transaction {
    description: string;
    amount: number;
    date: string;
    id: string;
}

const TransactionPage: React.FC = () => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const transactionId = pathSegments[pathSegments.length - 1];
    const fiscalYearId = pathSegments[pathSegments.length - 3];
    const accountId = pathSegments[pathSegments.length - 5];

    useEffect(() => {
        if (!transactionId || typeof transactionId !== 'string') {
            return;
        }

        const transactionRef = doc(db, "transactions", transactionId);

        const unsubscribe = onSnapshot(transactionRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const transactionData = {
                    id: doc.id,
                    description: data?.description || '',
                    amount: data?.amount || 0,
                    date: data?.date || ''
                };
                setTransaction(transactionData);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [transactionId]);

    return (
        <div>
            <h1>Transaction Details</h1>
            {transaction ? (
                <div>
                    <p>Description: {transaction.description}</p>
                    <p>Amount: {transaction.amount}</p>
                    <p>Date: {transaction.date}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <Link href={`/accounts/${accountId}/fiscalYears/${fiscalYearId}`} passHref>
                <Button variant="contained" color="primary">
                    Back to Fiscal Year
                </Button>
            </Link>
        </div>
    );
};

export default TransactionPage;
