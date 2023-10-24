'use client'
import { usePathname } from "next/navigation";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../db/firebase";
import { useState, useEffect } from "react";
import Link from "next/link";
import FiscalYearsList from './FiscalYearsList';

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

  const accountRef = doc(db, "accounts", accountId);

  const unsubscribe = onSnapshot(accountRef, (doc) => {
    if (doc.exists()) {
      // Add the name and accountingPlan properties to the object
      const accountData = { name: doc.data().name, accountingPlan: doc.data().accountingPlan, id: doc.id };

      // Set the account state
      setAccount(accountData);
    }
  });

  return () => {
    unsubscribe();
  };
}, []);



    if (!account) {
        return <div>Account not found</div>;
    }

    return (
        <div>
            <h1>Account</h1>

            <p>Name: {account.name}</p>
            <p>Accounting plan: {account.accountingPlan}</p>

            <div>
            <h1>Fiscal years</h1>
            <ul>
                <li>
                <Link href={`/accounts/${account.id}/fiscalYears/new`}>Create a new fiscal year book</Link>


                </li>
                <li>
                    <Link href={`/accounts/${account.id}/fiscalYears/list`}>See the earlier fiscal years</Link>

                </li>
            </ul>

            <FiscalYearsList />

        </div>
        </div>
    );
};

export default AccountPage;
