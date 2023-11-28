import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../db/firebase"; // Adjust the import path accordingly
import { Autocomplete, TextField } from "@mui/material";

const AccountCodeSearch = ({
  fiscalYearId,
  currentAccountId,
  onSelectAccount,
  entryIndex, // Receive the entryIndex
}: any) => {
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

  const selectedAccount: any =
    accounts.find((account: any) => account.code === currentAccountId) || null;

  return (
    <Autocomplete
      value={selectedAccount}
      options={filteredAccounts}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      style={{ width: 300 }}
      renderInput={(params) => (
        <TextField {...params} label="Account Code" variant="outlined" />
      )}
      onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      onChange={(event, newValue) => {
        console.log("Autocomplete onChange:", newValue);
        if (newValue) {
          onSelectAccount({
            code: newValue.code,
            name: newValue.name,
          });
        } else {
          onSelectAccount({ code: "", name: "" });
        }
      }}
    />
  );
};

export default AccountCodeSearch;
