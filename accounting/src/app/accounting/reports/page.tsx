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
import { AccountSummary, BalansRapportData } from "@/app/helpers/interfaces";

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
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    color: "#fff",
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
  isBalanced: {
    marginTop: 10,
  },

  balansPage: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 24,
    fontFamily: "Helvetica",
  },
  balansHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "2 solid #000",
  },
  balansTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  balansOrganizationInfo: {
    fontSize: 12,
    fontWeight: "normal",
    marginBottom: 3,
  },
  balansFiscalYearInfo: {
    fontSize: 11,
    marginBottom: 10,
  },
  balansSection: {
    marginTop: 10,
    padding: 10,
    flexGrow: 1,
  },
  balansSubtitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  balansTable: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    marginTop: 24,
  },
  balansTableRow: {
    flexDirection: "row",
    borderBottomColor: "#000",
    borderBottomWidth: 1,
  },
  balansTableCol: {
    // Style for regular columns
    flex: 1,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  balansTableColRight: {
    // Style for right-aligned columns
    flex: 1,
    padding: 5,
    fontSize: 10,
    textAlign: "right",
    borderRightWidth: 1,
    borderColor: "#000",
  },
  balansTableRowHeader: {
    backgroundColor: "#000",
    color: "#fff",
    borderBottomColor: "#fff",
  },
  balansTableColHeader: {
    // Style for header columns
    flex: 1,
    backgroundColor: "#000",
    color: "#fff",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
  },

  balansFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#000",
    marginTop: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  totalsLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalsValue: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  balansIsBalanced: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
  },
  sumRow: {
    // Style for the summation row
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 5,
    paddingBottom: 5,
  },
  sumLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  sumValue: {
    width: 100,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
    paddingRight: 5,
  },
});

const ReportsPage: React.FC = () => {
  const { globalState }: any = useContext(MyContext);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [incomeAccounts, setIncomeAccounts] = useState<any>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedFiscalYearPeriod, setSelectedFiscalYearPeriod] = useState({
    start: null,
    end: null,
  });

  const [balansrapportData, setBalansrapportData] = useState<any>({
    assets: "",

    liabilitiesAndEquity: "",

    totalAssets: 0,

    totalLiabilitiesAndEquity: 0,

    isBalanced: false,
  });

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
    organizeDataForBalansRapport(fetchedTransactions);
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

  const organizeDataForBalansRapport = (transactions: any[]) => {
    const accountSummaries: any = {};

    transactions.forEach((transaction) => {
      transaction.entries.forEach((entry: any) => {
        const { accountId, debit = 0, credit = 0 }: any = entry;

        if (!accountSummaries[accountId]) {
          accountSummaries[accountId] = {
            openingBalance: 0, // You'll need to set the correct opening balance here
            periodChange: 0,
            closingBalance: 0,
          };
        }

        accountSummaries[accountId].periodChange += debit - credit;
      });
    });

    for (const accountId in accountSummaries) {
      const account = accountSummaries[accountId];
      // Assume `openingBalance` is correctly populated beforehand
      account.closingBalance = account.openingBalance + account.periodChange;
    }

    const filteredAccountSummaries = Object.fromEntries(
      Object.entries(accountSummaries).filter(
        ([accountId]) => accountId.startsWith("1") || accountId.startsWith("2")
      )
    );

    const assets: any = {},
      liabilitiesAndEquity: any = {};
    Object.entries(filteredAccountSummaries).forEach(
      ([accountId, summary]: any) => {
        if (accountId.startsWith("1")) {
          assets[accountId] = summary;
        } else if (accountId.startsWith("2")) {
          liabilitiesAndEquity[accountId] = summary;
        }
      }
    );

    const totalAssets: any = Object.values(assets).reduce(
      (acc: any, { closingBalance }: any) => acc + closingBalance,
      0
    );
    const totalLiabilitiesAndEquity: any = Object.values(
      liabilitiesAndEquity
    ).reduce((acc: any, { closingBalance }: any) => acc + closingBalance, 0);

    // Checking if the report is balanced
    const isBalanced = totalAssets === totalLiabilitiesAndEquity;

    // Setting the state with the organized data
    setBalansrapportData({
      assets,
      liabilitiesAndEquity,
      totalAssets,
      totalLiabilitiesAndEquity,
      isBalanced,
    });
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
            <Text style={styles.fiscalYearContainer}>
              Period:{" "}
              {fiscalYearPeriod.start &&
                format(fiscalYearPeriod.start.toDate(), "yyyy-MM-dd")}{" "}
              -
              {fiscalYearPeriod.end &&
                format(fiscalYearPeriod.end.toDate(), "yyyy-MM-dd")}
            </Text>
          </View>
        </View>

        {Object.entries(huvudbokData).map(([accountId, accountData]: any) => {
          let runningBalance = accountData.openingBalance;

          const sortedTransactions = accountData.transactions.sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          return (
            <View key={accountId} style={styles.accountContainer}>
              <Text style={styles.accountHeader}>
                {accountData.accountDetails.name}
              </Text>

              {/* Ingående balans row */}
              <View style={styles.balanceRow}>
                <Text
                  style={[
                    styles.transactionCell,
                    { flex: 3, textAlign: "left", fontSize: 14 },
                  ]}
                >
                  Ingående balans
                </Text>
                <Text
                  style={[
                    styles.transactionCell,
                    { width: "20%", textAlign: "right" },
                  ]}
                >
                  {accountData.openingBalance.toFixed(2)}
                </Text>
              </View>

              {/* Transactions Table */}
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {/* Table headers */}
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
                {/* Transactions rows */}
                {sortedTransactions.map((transaction: any, index: any) => {
                  runningBalance += transaction.debit - transaction.credit;
                  return (
                    <View key={index} style={styles.transactionRow}>
                      <Text style={[styles.transactionCell, { width: "25%" }]}>
                        {format(new Date(transaction.date), "yyyy-MM-dd")}
                      </Text>
                      <Text style={[styles.transactionCell, { flex: 3 }]}>
                        {transaction.description}
                      </Text>
                      <Text style={[styles.transactionCell, { width: "15%" }]}>
                        {transaction.debit.toFixed(2)}
                      </Text>
                      <Text style={[styles.transactionCell, { width: "15%" }]}>
                        {transaction.credit.toFixed(2)}
                      </Text>
                      <Text style={[styles.transactionCell, { width: "20%" }]}>
                        {runningBalance.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Utgående balans row */}
              <View style={styles.balanceRow}>
                <Text
                  style={[
                    styles.transactionCell,
                    { flex: 3, textAlign: "left", fontSize: 14 },
                  ]}
                >
                  Utgående balans
                </Text>
                <Text
                  style={[
                    styles.transactionCell,
                    { width: "20%", textAlign: "right" },
                  ]}
                >
                  {runningBalance.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text>Footer Content</Text>
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

  const BalansrapportPDF = ({
    balansData,
    orgDetails,
    fiscalYearPeriod,
  }: any) => {
    const renderTableHeader = () => (
      <View style={styles.tableRow}>
        <Text style={[styles.balansTableColHeader, { flex: 2 }]}>Konto</Text>
        <Text style={styles.balansTableColHeader}>Ingående balans</Text>
        <Text style={styles.balansTableColHeader}>Period</Text>
        <Text style={styles.balansTableColHeader}>Utgående balans</Text>
      </View>
    );

    const renderTableRow = (account: any, index: any) => (
      <View style={styles.tableRow} key={index}>
        <Text style={[styles.balansTableCol, { flex: 2 }]}>{account.name}</Text>
        <Text style={styles.balansTableColRight}>
          {account.openingBalance.toFixed(2)}
        </Text>
        <Text style={styles.balansTableColRight}>
          {account.periodChange.toFixed(2)}
        </Text>
        <Text style={styles.balansTableColRight}>
          {account.closingBalance.toFixed(2)}
        </Text>
      </View>
    );

    const calculateSum = (accounts: any) => {
      return accounts.reduce((total: any, account: any) => {
        return total + account.closingBalance;
      }, 0);
    };

    const renderSumRow = (accounts: any) => {
      const sumClosingBalance = accounts.reduce(
        (sum: any, account: any) => sum + account.closingBalance,
        0
      );
      return (
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { flex: 2 }]}>Summa</Text>
          <Text style={styles.sumValue}></Text>{" "}
          <Text style={styles.sumValue}>{sumClosingBalance.toFixed(2)}</Text>
        </View>
      );
    };

    const renderTable = (sectionTitle: any, accounts: any) => (
      <View style={styles.balansSection}>
        <Text style={styles.balansSubtitle}>{sectionTitle}</Text>
        <View style={styles.balansTable}>
          {renderTableHeader()}
          {accounts.map(renderTableRow)}
          {renderSumRow(accounts)}
        </View>
      </View>
    );
    // Helper function to render each account row
    const renderAccountRow = (account: any, isHeader = false) => (
      <View style={isHeader ? styles.tableRowHeader : styles.tableRow}>
        <Text style={[styles.tableCol, { width: "50%" }]}>{account.name}</Text>
        <Text style={[styles.tableCol, { width: "25%", textAlign: "right" }]}>
          {account.openingBalance.toFixed(2)}
        </Text>
        <Text style={[styles.tableCol, { width: "25%", textAlign: "right" }]}>
          {account.closingBalance.toFixed(2)}
        </Text>
      </View>
    );

    return (
      <Document>
        <Page style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Balansrapport</Text>
            <Text style={styles.organizationInfo}>{orgDetails.name}</Text>
            <Text style={styles.organizationInfo}>
              {orgDetails?.number}
            </Text>{" "}
            <Text style={styles.fiscalYearInfo}>
              Räkenskapsår:{" "}
              {format(fiscalYearPeriod.start.toDate(), "yyyy-MM-dd")} till
              {format(fiscalYearPeriod.end.toDate(), "yyyy-MM-dd")}
            </Text>
            <Text style={styles.fiscalYearInfo}>
              Period: {format(fiscalYearPeriod.start.toDate(), "yyyy-MM-dd")}{" "}
              till
              {format(fiscalYearPeriod.end.toDate(), "yyyy-MM-dd")}
            </Text>
          </View>

          {renderTable(
            "Tillgångar",
            Object.entries(balansData.assets).map(([id, account]: any) => ({
              ...account,
              name: account.name || id,
              periodChange: account.totalChange,
            }))
          )}

          {renderTable(
            "Eget kapital och skulder",
            Object.entries(balansData.liabilitiesAndEquity).map(
              ([id, account]: any) => ({
                ...account,
                name: account.name || id, // If account.name is not set, use the account ID
                periodChange: account.totalChange,
              })
            )
          )}

          <View style={styles.balansFooter}>
            <Text>Summa tillgångar: {balansData.totalAssets.toFixed(2)}</Text>
            <Text>
              Summa eget kapital och skulder:{" "}
              {balansData.totalLiabilitiesAndEquity.toFixed(2)}
            </Text>
            <Text style={styles.balansIsBalanced}>
              {balansData.isBalanced ? "Balanserad" : "Obalanserad"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  const generateBalansrapportPDF = async () => {
    try {
      const doc = (
        <BalansrapportPDF
          balansData={balansrapportData}
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
      <Button onClick={() => generateBalansrapportPDF()}>
        Generate Balansrapport PDF
      </Button>
    </Grid>
  );
};

export default ReportsPage;
