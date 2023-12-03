"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  onSnapshot,
  doc,
  collection,
  query,
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../db/firebase";
import { useState, useEffect } from "react";
import Link from "next/link";

import ExpandMoreIcon from "@mui/material/Icon";
import {
  Box,
  Grid,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  fiscalYearId: string;
}

interface Entry {
  accountId: string;
  counterAccountId: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

interface FinalBalances {
  [accountId: string]: number;
}

const FiscalYearPage: React.FC = () => {
  const [fiscalYear, setFiscalYear] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
  const [isYearClosed, setIsYearClosed] = useState<boolean>(false);

  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const fiscalYearId: string = pathSegments[pathSegments.length - 1];
  const accountId: string = pathSegments[pathSegments.length - 3];
  const router = useRouter();

  // Fetch the fiscal year data from the database
  useEffect(() => {
    if (!fiscalYearId || typeof fiscalYearId !== "string") {
      return;
    }

    const fiscalYearRef = doc(db, "fiscalYears", fiscalYearId);

    const unsubscribe = onSnapshot(fiscalYearRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        const fiscalYearData = {
          id: doc.id,
          name: data?.name || "",
          startDate:
            data?.fiscalYearSpan?.start?.toDate().toLocaleDateString() || "",
          endDate:
            data?.fiscalYearSpan?.end?.toDate().toLocaleDateString() || "",
          isClosed: data?.isClosed || false, // Add this line
        };

        setFiscalYear(fiscalYearData);
        setIsYearClosed(data?.isClosed || false); // Add this line
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fiscalYearId]);

  useEffect(() => {
    if (!fiscalYearId || typeof fiscalYearId !== "string") {
      return;
    }

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("fiscalYearId", "==", fiscalYearId)
    );

    const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
      const fetchedTransactions: Transaction[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        fetchedTransactions.push({
          id: docSnapshot.id,
          entries: data.entries,
          date: data.date,
          fiscalYearId: data.fiscalYearId,
        });
      });

      // Sort transactions by date in descending order
      fetchedTransactions.sort((a, b) => b.date.localeCompare(a.date));

      setTransactions(fetchedTransactions);
    });

    return () => unsubscribe();
  }, [fiscalYearId]);

  const handleExpandClick = (transactionId: string) => {
    setExpandedTransactionId((prev) =>
      prev === transactionId ? null : transactionId
    );
  };

  if (!fiscalYear) {
    return <div>Fiscal year not found</div>;
  }

  async function calculateFinalBalances(
    fiscalYearId: string
  ): Promise<FinalBalances> {
    const balancesSnapshot = await getDocs(
      collection(db, "fiscalYears", fiscalYearId, "balances")
    );
    const finalBalances: FinalBalances = {};
    balancesSnapshot.forEach((doc) => {
      const data = doc.data();
      finalBalances[doc.id] = data.balance; // Assuming 'balance' is a number.
    });
    return finalBalances;
  }

  const closeFiscalYear = async () => {
    // Confirm with the user
    if (!window.confirm("Are you sure you want to close this fiscal year?")) {
      return;
    }

    try {
      // Here you would calculate the final balances
      const finalBalances = await calculateFinalBalances(fiscalYearId);

      // Create a new fiscal year document with the carried-over balances
      const newFiscalYearData = {
        /* ... new fiscal year data ... */
      };

      // Mark the current fiscal year as closed
      await updateDoc(doc(db, "fiscalYears", fiscalYearId), { isClosed: true });

      // Update the state to reflect the closed status
      setIsYearClosed(true);

      alert("The fiscal year has been closed and a new year has been created.");
    } catch (error) {
      console.error("Error closing fiscal year:", error);
      alert("Failed to close the fiscal year. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {" "}
      <Grid container spacing={2}>
        {" "}
        <Grid item xs={12}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(`/accounting/${accountId}/`)}
            sx={{ mb: 2 }} // Add mb (margin bottom)
          >
            Back
          </Button>
          <Typography variant="h4" gutterBottom>
            {" "}
            Fiscal Year
          </Typography>
          <Typography variant="body1" gutterBottom>
            Start date: {fiscalYear?.startDate}
          </Typography>
          <Typography variant="body1" gutterBottom>
            End date: {fiscalYear?.endDate}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {!isYearClosed && (
            <MuiLink
              href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}
              underline="hover"
            >
              <Button variant="contained" color="primary" sx={{ mb: 2 }}>
                {" "}
                Create New Transaction
              </Button>
            </MuiLink>
          )}
        </Grid>
        <Grid item xs={12}>
          {transactions.map((transaction) => (
            <Accordion
              key={transaction.id}
              expanded={expandedTransactionId === transaction.id}
              onChange={() => handleExpandClick(transaction.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {transaction.entries[0].description} - {transaction.date}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>ID: {transaction.id}</Typography>
                {transaction.entries.map((entry, index) => (
                  <Box key={index} sx={{ my: 1 }}>
                    {" "}
                    <Typography>
                      {entry.type}: {entry.amount}
                    </Typography>
                    <Typography>Account ID: {entry.accountId}</Typography>
                    <Typography>
                      Counter Account ID: {entry.counterAccountId}
                    </Typography>
                  </Box>
                ))}
                <Link
                  href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/${transaction.id}`}
                  passHref
                >
                  <Button variant="contained" color="primary">
                    View Transaction
                  </Button>
                </Link>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
        <Grid item xs={12}>
          {!isYearClosed && (
            <Button
              variant="contained"
              color="primary"
              onClick={closeFiscalYear}
              sx={{ mt: 2 }}
            >
              Close Fiscal Year
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FiscalYearPage;
