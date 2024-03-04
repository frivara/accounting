"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../db/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MyContext } from "@/app/helpers/context";

import {
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";

const ReportsPage: React.FC = () => {
  const { globalState }: any = useContext(MyContext); // Accessing context
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [huvudbokData, setHuvudbokData] = useState<
    Record<
      string,
      {
        accountDetails: {
          name: string;
          code: string;
        };
        transactions: {
          date: string;
          description: string;
          debit: number;
          credit: number;
        }[];
        openingBalance: number;
        closingBalance: number;
      }
    >
  >({});

  const [accountBalances, setAccountBalances] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (selectedOrganization) {
      fetchFiscalYears(selectedOrganization);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    if (selectedFiscalYear) {
      fetchTransactions(selectedFiscalYear);
    }
  }, [selectedFiscalYear]);

  const fetchFiscalYears = async (firestoreId: string) => {
    const fyQuery = query(
      collection(db, "fiscalYears"),
      where("accountId", "==", firestoreId)
    );
    const querySnapshot = await getDocs(fyQuery);
    const fys = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      const startDate = data.fiscalYearSpan?.start.toDate();

      const year = startDate ? startDate.getFullYear() : "Unknown Year";

      return {
        id: doc.id,
        year,
        ...data,
      };
    });
    setFiscalYears(fys);
  };

  const fetchTransactions = async (fiscalYearId: string) => {
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("fiscalYearId", "==", fiscalYearId)
    );
    const querySnapshot = await getDocs(transactionsQuery);
    const fetchedTransactions: any = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const newHuvudbokData: Record<string, any> = {};
    const newAccountBalances: Record<string, number> = {};

    for (const transaction of fetchedTransactions) {
      for (const entry of transaction.entries) {
        const { accountId, debit = 0, credit = 0 } = entry;

        if (!newHuvudbokData[accountId]) {
          newHuvudbokData[accountId] = {
            accountDetails: {},
            transactions: [],
            openingBalance: 0,
            closingBalance: 0,
          };
        }

        newHuvudbokData[accountId].transactions.push({
          date: transaction.date,
          description: transaction.description,
          debit,
          credit,
        });

        newHuvudbokData[accountId].closingBalance += debit - credit;

        if (!newAccountBalances[accountId]) {
          newAccountBalances[accountId] = 0;
        }
        newAccountBalances[accountId] += debit - credit;
      }
    }

    // After all transactions have been processed, you should calculate the final closing balances
    for (const accountId in newHuvudbokData) {
      newHuvudbokData[accountId].closingBalance +=
        newHuvudbokData[accountId].openingBalance;
    }

    // Update states
    setTransactions(fetchedTransactions);
    setAccountBalances(newAccountBalances);
    setHuvudbokData(newHuvudbokData);
  };

  useEffect(() => {
    console.log("Transactions State Updated:", transactions);
  }, [transactions]);

  useEffect(() => {
    console.log("Account Balances State Updated:", accountBalances);
  }, [accountBalances]);

  useEffect(() => {
    console.log("Huvudbok State Updated:", huvudbokData);
  }, [huvudbokData]);

  const handleOrganizationChange: any = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedOrganization(event.target.value as string);
  };

  const handleFiscalYearChange: any = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedFiscalYear(event.target.value as string);
  };

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "100vh" }}
    >
      <Grid item>
        <Typography variant="h6">Select an Organization</Typography>
        <Select
          value={selectedOrganization}
          onChange={handleOrganizationChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          fullWidth
        >
          <MenuItem value="" disabled>
            Choose an Organization
          </MenuItem>
          {globalState.organizations?.map((org: any) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {selectedOrganization && (
        <Grid item>
          <Typography variant="h6">Select a Fiscal Year</Typography>
          <Select
            value={selectedFiscalYear}
            onChange={handleFiscalYearChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            fullWidth
          >
            <MenuItem value="" disabled>
              Choose a Fiscal Year
            </MenuItem>
            {fiscalYears.map((fiscalYear) => (
              <MenuItem key={fiscalYear.id} value={fiscalYear.id}>
                {fiscalYear.year}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}
    </Grid>
  );
};

export default ReportsPage;
