'use client'
import { usePathname } from "next/navigation";
import { collection, query, onSnapshot, where, doc } from "firebase/firestore";
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
  console.log(accountId);

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
        </div>
    );
};

export default AccountPage;
