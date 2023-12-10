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
  debit: number | null;
  credit: number | null;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  fiscalYearId: string;
  proofFileURL?: string;
  description: string;
}

const TransactionPage: React.FC = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const transactionId = pathSegments[pathSegments.length - 1];
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
          fiscalYearId: docSnapshot.data().fiscalYearId || "",
          proofFileURL: docSnapshot.data().proofFileURL || "",
          description: docSnapshot.data().description || "",
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
        onClick={() => router.back()} // Update the route as needed
        sx={{ position: "absolute", top: 16, left: `calc(240px + 16px)` }}
      >
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Transaktionsdetaljer
      </Typography>
      {transaction ? (
        <>
          <Typography>Beskrivning: {transaction.description}</Typography>
          <Typography>
            Datum: {new Date(transaction.date).toLocaleDateString()}
          </Typography>

          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kontonummer</TableCell>
                  <TableCell>Debet</TableCell>
                  <TableCell>Kredit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.accountId}</TableCell>
                    <TableCell>{entry.debit}</TableCell>
                    <TableCell>{entry.credit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {transaction.proofFileURL && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "300px",
                maxHeight: "400px",
                my: 2,
              }}
            >
              <Typography variant="h6">Transaktionsbevis</Typography>
              <img
                src={transaction.proofFileURL}
                alt="Uploaded File"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
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
