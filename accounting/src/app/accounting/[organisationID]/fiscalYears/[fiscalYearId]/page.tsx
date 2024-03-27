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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Grid,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
  Card,
  CardContent,
  CardActions,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  fiscalYearId: string;
  description: string; // Add this if you want to display the description
}

interface Entry {
  accountId: string;
  debit: number | null;
  credit: number | null;
}

interface FinalBalances {
  [accountId: string]: number;
}

const drawerWidth = 240;

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
          description: data.description,
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
      finalBalances[doc.id] = data.balance;
    });
    return finalBalances;
  }

  const closeFiscalYear = async () => {

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

      alert("The fiscal year has been closed.");
    } catch (error) {
      console.error("Error closing fiscal year:", error);
      alert("Failed to close the fiscal year. Please try again.");
    }
  };

  return (
    <Container
      style={{ paddingLeft: drawerWidth + 20, paddingRight: 20, marginTop: 20 }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/accounting/${accountId}/`)}
        sx={{ position: "absolute", top: 16, left: `calc(240px + 16px)` }}
      >
        Back
      </Button>
      <Typography variant="h4" gutterBottom>
        Räkenskapsår
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            Startdatum: {fiscalYear?.startDate}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Slutdatum: {fiscalYear?.endDate}
          </Typography>
        </CardContent>
      </Card>
      <Box
        sx={{
          maxHeight: "50vh",
          overflowY: "auto",
          mb: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          border: "1px solid #e0e0e0",
          padding: 2,
        }}
      >
        <Grid container spacing={2}>
          {transactions.map((transaction) => (
            <Grid item xs={12} key={transaction.id}>
              <Accordion
                expanded={expandedTransactionId === transaction.id}
                onChange={() => handleExpandClick(transaction.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {transaction.description} - {transaction.date}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Beskrivning: {transaction.description}
                  </Typography>
                  <Typography>Datum: {transaction.date}</Typography>
                  {transaction.entries.map((entry, index) => (
                    <Box key={index} sx={{ my: 1 }}>
                      <Typography>Kontonummer: {entry.accountId}</Typography>
                      <Typography>Debet: {entry.debit}</Typography>
                      <Typography>Kredit: {entry.credit}</Typography>
                    </Box>
                  ))}
                  <Link
                    href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/${transaction.id}`}
                    passHref
                  >
                    <Button variant="contained" color="primary">
                      Transaktionsdetaljer
                    </Button>
                  </Link>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Box>
      {!isYearClosed && (
        <MuiLink
          href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}/transactions/new`}
          underline="hover"
        >
          <Button variant="contained" color="primary">
            Lägg till ny transaktion
          </Button>
        </MuiLink>
      )}
      {!isYearClosed && (
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={closeFiscalYear}
            sx={{ mt: 2 }}
          >
            Stäng räkenskapsåret
          </Button>
        </Grid>
      )}
    </Container>
  );
};

export default FiscalYearPage;
