'use client'
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import app from "../db/firebase";


// Disclaimer - I'm using the <any>-tag temporarily since the accounts have not been given a type/interface yet

const AccountsPage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [accountingPlan, setAccountingPlan] = useState("");
    const [accounts, setAccounts] = useState<any>([]);



    const handleCreateAccount = (e: FormEvent<HTMLFormElement>) => {
        // Prevent the form from reloading
        e.preventDefault();

        // Create a new account
        const newAccount = {
            // Giving the account a random id using 7 random alphanumerical characters
            id: Math.random().toString(36).substring(7),
            name,
            accountingPlan,
        };

        // Add the new account to the list of accounts
        setAccounts([...accounts, newAccount]);

        // Clear the form
        setName("");
        setAccountingPlan("");
    };


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
                <button type="submit" id="createAccountButton">Create account</button>
            </form>

            <ul className="account-list">
                {accounts.map((account: any) => (
                    <li key={account.id} onClick={() => handleViewAccount(account.id)}>
                        {account.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AccountsPage;
