'use client'
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDoc, QuerySnapshot, query, onSnapshot } from "firebase/firestore";
import { db } from "../db/firebase";

interface Account {
    id: string;
    name: string;
    accountingPlan: string;
}

const AccountsPage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [accountingPlan, setAccountingPlan] = useState("");
    const [accounts, setAccounts] = useState<Account[]>([]);

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
                itemsArray.push({ ...doc.data(), id: doc.id });
            });
            setAccounts(itemsArray);
        })

    }, [])

    const handleViewAccount = (id: string) => {
        // Redirect to the account details page which is a WIP
        router.push(`/accounts/${id}`);
    };

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
                    <li key={account.id} onClick={() => handleViewAccount(account.id)}>
                        {account.name}
                        <div>{account.accountingPlan}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AccountsPage;
