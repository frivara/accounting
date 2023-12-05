/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../db/firebase";
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

interface Entry {
  accountId: string;
  accountName?: string;
  counterAccountId?: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  proofFileURL?: string; // Optional since an uploaded file might not exist for all transactions
}

interface CoaAccount {
  code: string; // Unique identifier for the account, usually a numerical code
  name: string; // Descriptive name of the account
}

const TransactionPage: React.FC = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  // You may want to fetch the account details similar to transaction details for better account information display.
  // For now, I've commented out the COA fetching logic as it's not being used.
  // const [coa, setCoa] = useState<CoaAccount[]>([]);

  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const transactionId = pathSegments[pathSegments.length - 1];
  const fiscalYearId = pathSegments[pathSegments.length - 3];
  const accountId = pathSegments[pathSegments.length - 5];
  const router = useRouter();

  useEffect(() => {
    if (!transactionId) {
      return;
    }

    const transactionRef = doc(db, "transactions", transactionId);

    const unsubscribe = onSnapshot(transactionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setTransaction({
          id: docSnapshot.id,
          entries: docSnapshot.data().entries || [],
          date: docSnapshot.data().date || "",
          proofFileURL: docSnapshot.data().proofFileURL || "",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [transactionId]);

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/accounting/${accountId}/`)}
        sx={{ position: "absolute", top: 16, left: `calc(240px + 16px)` }}
      >
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Transaktionsdetaljer
      </Typography>
      {transaction ? (
        <>
          <Typography>ID: {transaction.id}</Typography>
          <Typography>
            Datum: {new Date(transaction.date).toLocaleDateString()}
          </Typography>

          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Typ</TableCell>
                  <TableCell>Kontonummer</TableCell>
                  <TableCell>Motkonto</TableCell>
                  <TableCell>Belopp</TableCell>
                  <TableCell>Beskrivning</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {entry.type === "debit" ? "Debet" : "Kredit"}
                    </TableCell>
                    <TableCell>{entry.accountId}</TableCell>
                    <TableCell>{entry.counterAccountId}</TableCell>
                    <TableCell>{entry.amount}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {transaction.proofFileURL && (
            <Box
              sx={{
                position: "relative",
                width: "20vw",
                height: "desiredHeight",
              }}
            >
              <Typography variant="h6">Transaktionsbevis</Typography>
              <Box
                component="img"
                src={transaction.proofFileURL}
                alt="Uploaded File"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          )}
        </>
      ) : (
        <Typography>Laddar...</Typography>
      )}
    </Box>
  );
};

export default TransactionPage;
