import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../db/firebase";
import { Autocomplete, TextField } from "@mui/material";

const AccountCodeSearch = ({
  fiscalYearId,
  currentAccountId,
  onSelectAccount,
}: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const isDefault = true; // Replace with actual logic
      const coaCollection = collection(db, "chartOfAccountsTemplates");
      const queryCondition = isDefault
        ? where("isDefault", "==", true)
        : where("isDefault", "==", false);
      const querySnapshot = await getDocs(query(coaCollection, queryCondition));

      const accountsData = querySnapshot.docs.flatMap((doc) => {
        return doc
          .data()
          .accounts.map((account: { code: string; name: string }) => ({
            ...account,
            uniqueId: `${doc.id}-${account.code}-${account.name}`,
          }));
      });
      setAccounts(accountsData);
    };

    fetchAccounts();
  }, [fiscalYearId]);

  useEffect(() => {
    const filtered = searchTerm
      ? accounts.filter((account: any) =>
          account.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts]);

  const selectedAccount =
    accounts.find(
      (account: { code: string }) => account.code === currentAccountId
    ) || null;

  return (
    <Autocomplete
      freeSolo
      value={selectedAccount}
      options={filteredAccounts}
      getOptionLabel={(option) =>
        option ? `${option.code} - ${option.name}` : ""
      }
      style={{ width: 300 }}
      renderInput={(params) => (
        <TextField {...params} label="Account Code" variant="outlined" />
      )}
      onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
        // If the input value is not from the selections, update the parent state
        if (
          !filteredAccounts.find((account) => account.code === newInputValue)
        ) {
          onSelectAccount({ code: newInputValue, name: "" });
        }
      }}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          onSelectAccount({ code: newValue, name: "" });
        } else if (newValue && newValue.inputValue) {
          onSelectAccount({ code: newValue.inputValue, name: "" });
        } else if (newValue) {
          onSelectAccount({ code: newValue.code, name: newValue.name });
        } else {
          onSelectAccount({ code: "", name: "" });
        }
      }}
    />
  );
};

export default AccountCodeSearch;
