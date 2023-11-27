import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../db/firebase"; // Adjust the import path accordingly

const AccountCodeSearch = ({ fiscalYearId }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  // Fetch CoA templates/accounts from Firebase
  useEffect(() => {
    const fetchAccounts = async () => {
      // You might want to query only specific documents based on fiscalYearId
      const coaCollection = collection(db, "chartOfAccountsTemplates");
      const snapshot = await getDocs(coaCollection);
      const accountsData: any = [];
      snapshot.forEach((doc) => {
        // Extracting accounts from each template
        const templateAccounts = doc.data().accounts || [];
        accountsData.push(...templateAccounts);
      });
      setAccounts(accountsData);
    };

    fetchAccounts();
  }, [fiscalYearId]);

  // Filter accounts based on searchTerm
  useEffect(() => {
    if (searchTerm) {
      const filtered = accounts.filter((account: any) =>
        account.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts([]);
    }
  }, [searchTerm, accounts]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search Account Codes"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredAccounts.length > 0 && (
        <div>
          {/* Display results in a list or a table */}
          <ul>
            {filteredAccounts.map((account: any, index) => (
              <li key={index}>
                {account.code} - {account.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccountCodeSearch;
