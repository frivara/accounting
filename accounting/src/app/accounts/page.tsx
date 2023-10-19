'use client'
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDoc, QuerySnapshot, query, onSnapshot, where, doc } from "firebase/firestore";
import { db } from "../db/firebase";

export interface Account {
    id: string;
    firestoreId: string;
    name: string;
    accountingPlan: string;
}

const AccountsPage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [accountingPlan, setAccountingPlan] = useState("");
    const [accounts, setAccounts] = useState<Account[]>([]);

    const handleViewAccount = async (account: Account) => {
        // Get the ID of the account
        const id = account.id;

        // Redirect to the account page
        router.push(`/accounts/${id}`);
    };


    const handleCreateAccount = async (e: FormEvent<HTMLFormElement>) => {
        // Prevent the form from reloading
        e.preventDefault();

        if (!name || !accountingPlan) {
            console.log("You need to type in a name and choose an accounting plan");
            return;
        }

        try {
            const newAccount: Account = {
                id: Math.random().toString(36).substring(7),
                firestoreId: Math.random().toString(36).substring(7),
                name,
                accountingPlan,
            };

            await addDoc(collection(db, "accounts"), newAccount);

            // setAccounts([...accounts, newAccount]);

            setName("");
            setAccountingPlan("");
        } catch (error) {
            console.error(error);
        }
    };

    // Read items from database

    useEffect(() => {
        const accountQuery = query(collection(db, "accounts"));
        // calling the function below "unsubscribe" refers to disconnecting from the database after fetching the data needed
        const unsubscribe = onSnapshot(accountQuery, (querySnapshot) => {
            let itemsArray: any = [];

            querySnapshot.forEach((doc) => {
                itemsArray.push({ ...doc.data(), firestoreId: doc.id });
            });
            setAccounts(itemsArray);
        });

        return () => unsubscribe();
    }, []);





    return (
        <div>
            <h1>Accounts</h1>

            <form onSubmit={handleCreateAccount}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                />
                <select
                    value={accountingPlan}
                    id="accountingPlan"
                    onChange={(e) => setAccountingPlan(e.target.value)}
                >
                    <option value="">Select an accounting plan</option>
                    <option value="cashAccounting">Cash accounting</option>
                    <option value="accrualAccounting">Accrual accounting</option>
                </select>
                <button type="submit" id="createAccountButton">
                    Create account
                </button>
            </form>

            <ul className="account-list">
                {accounts.map((account: Account) => (
                    <li key={account.id} onClick={() => handleViewAccount(account)}>
                        {account.name}
                        <div>{account.accountingPlan}</div>
                        <div>{account.id}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AccountsPage;
