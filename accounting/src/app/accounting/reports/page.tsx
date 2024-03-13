"use client";
import React, { useState, useEffect, useContext } from "react";
import { db } from "../../db/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MyContext } from "@/app/helpers/context";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

import { format } from "date-fns";

import {
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 24,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1 solid #ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  section: {
    marginTop: 10,
    padding: 10,
    flexGrow: 1,
  },

  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f6f6f6",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e4e4e4",
    fontWeight: "bold",
    fontSize: 12,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
  closingBalance: {
    marginTop: 10,
    padding: 5,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopStyle: "solid",
    borderTopColor: "#ccc",
    textAlign: "center",
    fontSize: 10,
  },
  organizationInfo: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  fiscalYearInfo: {
    fontSize: 11,
    marginBottom: 10,
  },
  fiscalYearContainer: {
    marginTop: 10,
    fontSize: 11,
    marginBottom: 10,
    textAlign: "right",
  },
  accountContainer: {
    marginBottom: 15,
  },
  accountHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  transactionRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
    minHeight: 25,
    fontSize: 10,
  },
  transactionCell: {
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 5,
    fontSize: 10,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  balanceValue: {
    fontSize: 11,
    width: 100,
    textAlign: "right",
  },
});

const ReportsPage: React.FC = () => {
  const { globalState }: any = useContext(MyContext); // Accessing context
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [selectedFiscalYearPeriod, setSelectedFiscalYearPeriod] = useState({
    start: null,
    end: null,
  });

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

  const selectedOrgDetails = globalState.organizations?.find(
    (org: any) => org.id === selectedOrganization
  );

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
        start: data.fiscalYearSpan?.start,
        end: data.fiscalYearSpan?.end,
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
            accountDetails: {
              name: accountId,
            },
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

    for (const accountId in newHuvudbokData) {
      newHuvudbokData[accountId].closingBalance +=
        newHuvudbokData[accountId].openingBalance;
    }

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
    const fiscalYearId = event.target.value as string;
    setSelectedFiscalYear(fiscalYearId);
    const selectedYearData = fiscalYears.find((fy) => fy.id === fiscalYearId);
    if (selectedYearData) {
      setSelectedFiscalYearPeriod({
        start: selectedYearData.start,
        end: selectedYearData.end,
      });
    }
  };

  const HuvudbokPDF = ({ huvudbokData, orgDetails, fiscalYearPeriod }: any) => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Huvudbok</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.organizationInfo}>{orgDetails?.name}</Text>
            <Text style={styles.organizationInfo}>
              Org. Number: {orgDetails?.number}
            </Text>
            {fiscalYearPeriod.start && fiscalYearPeriod.end && (
              <Text style={styles.fiscalYearContainer}>
                Period: {format(fiscalYearPeriod.start.toDate(), "yyyy-MM-dd")}{" "}
                -{format(fiscalYearPeriod.end.toDate(), "yyyy-MM-dd")}
              </Text>
            )}
          </View>
        </View>

        {Object.entries(huvudbokData).map(([accountId, accountData]: any) => {
          let runningBalance = accountData.openingBalance;

          return (
            <View key={accountId} style={styles.accountContainer}>
              <Text style={styles.accountHeader}>
                {accountData.accountDetails.name}
              </Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColHeader, { width: "25%" }]}>
                    Datum
                  </Text>
                  <Text style={[styles.tableColHeader, { flex: 3 }]}>
                    Beskrivning
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "15%" }]}>
                    Debet
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "15%" }]}>
                    Kredit
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "20%" }]}>
                    Saldo
                  </Text>
                </View>
                {accountData.transactions.map(
                  (transaction: any, index: any) => {
                    runningBalance += transaction.debit - transaction.credit;
                    return (
                      <View key={index} style={styles.transactionRow}>
                        <Text
                          style={[styles.transactionCell, { width: "25%" }]}
                        >
                          {transaction.date}
                        </Text>
                        <Text style={[styles.transactionCell, { flex: 3 }]}>
                          {transaction.description}
                        </Text>
                        <Text
                          style={[styles.transactionCell, { width: "15%" }]}
                        >
                          {transaction.debit.toFixed(2)}
                        </Text>
                        <Text
                          style={[styles.transactionCell, { width: "15%" }]}
                        >
                          {transaction.credit.toFixed(2)}
                        </Text>
                        <Text
                          style={[styles.transactionCell, { width: "20%" }]}
                        >
                          {runningBalance.toFixed(2)}
                        </Text>
                      </View>
                    );
                  }
                )}
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Closing Balance:</Text>
                  <Text style={styles.balanceValue}>
                    {runningBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          {/* Unsure if we need a footer but keeping this temporarily */}
        </View>
      </Page>
    </Document>
  );

  const generateHuvudbokPDF = async (
    huvudbokData: Record<
      string,
      {
        accountDetails: { name: string; code: string };
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
  ) => {
    try {
      const doc = (
        <HuvudbokPDF
          huvudbokData={huvudbokData}
          orgDetails={selectedOrgDetails}
          fiscalYearPeriod={selectedFiscalYearPeriod}
        />
      );
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Failed to create the Huvudbok PDF", error);
    }
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
      <Button onClick={() => generateHuvudbokPDF(huvudbokData)}>
        Generate Huvudbok PDF
      </Button>
    </Grid>
  );
};

export default ReportsPage;
