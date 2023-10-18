'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDoc, QuerySnapshot, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../db/firebase";
import { useState, FormEvent, useEffect } from "react";

interface Account {
    id: string;
    name: string;
    accountingPlan: string;
}

const AccountPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [account, setAccount] = useState<Account | null>(null);

    // Fetch the account data from the database
    useEffect(() => {
        const accountId = searchParams.get("id");
        console.log("AccountId: " + accountId);
        console.log("Searchparams: " + searchParams);

        if (!accountId) {
            return;
        }

        const accountQuery = query(collection(db, "accounts"), where("firestoreId", "==", accountId));
        const unsubscribe = onSnapshot(accountQuery, (querySnapshot) => {
            const account = querySnapshot.docs[0];
            if (account) {
                setAccount({ ...account.data(), id: account.id, name: "", accountingPlan: "" });
            }
        });

        return () => unsubscribe();
    }, [searchParams]);

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
