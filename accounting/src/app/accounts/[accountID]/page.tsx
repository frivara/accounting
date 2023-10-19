'use client'
import { usePathname } from "next/navigation";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../db/firebase";
import { useState, useEffect } from "react";

interface Account {
    id: string;
    name: string;
    accountingPlan: string;
}

const AccountPage: React.FC = () => {
    const [account, setAccount] = useState<Account | null>(null);

    const pathname = usePathname();

    // Fetch the account data from the database
    useEffect(() => {
        const accountId = pathname.split('/').pop();

        if (!accountId) {
            return;
        }

        const accountQuery = query(collection(db, "accounts"), where("id", "==", accountId));
        const unsubscribe = onSnapshot(accountQuery, (querySnapshot) => {
            const account = querySnapshot.docs[0];
            if (account) {
                setAccount({ ...account.data(), id: account.id, name: "", accountingPlan: "" });
            }
        });

        return () => unsubscribe();
    }, []);

    if (!account) {
        return <div>Account not found</div>;
    }

    return (
        <div>
            <h1>Account</h1>

            <p>Name: {account.name}</p>
            <p>Accounting plan: {account.accountingPlan}</p>
        </div>
    );
};

export default AccountPage;
