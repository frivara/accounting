'use client'
import { FormEvent, useState } from "react";
import router from "next/router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import { usePathname } from "next/navigation";

interface Transaction {
    description: string;
    amount: number;
    date: string;
}

const NewTransactionPage: React.FC = () => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const fiscalYearId: string = pathSegments[pathSegments.length - 3]; 
    const accountId: string = pathSegments[pathSegments.length - 5];

    const handleCreateTransaction = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!description || !amount || !date) {
            console.log("All fields are required");
            return;
        }

        const newTransaction: Transaction = {
            description,
            amount: parseFloat(amount),
            date,
        };

        try {
            await addDoc(collection(db, "transactions"), {
                ...newTransaction,
                accountId,
                fiscalYearId,
            });

            
            router.push(`/accounting/${accountId}/fiscalYears/${fiscalYearId}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Create New Transaction</h1>

            <form onSubmit={handleCreateTransaction}>
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button type="submit">Create Transaction</button>
            </form>
        </div>
    );
};

export default NewTransactionPage;
