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
import Link from "next/link";

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
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const transactionId = pathSegments[pathSegments.length - 1];
  const fiscalYearId = pathSegments[pathSegments.length - 3];
  const accountId = pathSegments[pathSegments.length - 5];
  const [coa, setCoa] = useState<CoaAccount[]>([]);

  useEffect(() => {
    if (!transactionId || typeof transactionId !== "string") {
      return;
    }

    const transactionRef = doc(db, "transactions", transactionId);

    const unsubscribe = onSnapshot(transactionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTransaction(data as Transaction); // Assuming data is correctly structured
      }
    });

    return () => {
      unsubscribe();
    };
  }, [transactionId]);

  const renderFile = (url: string) => {
    if (!url) return null;

    const isImage = /\.(jpeg|jpg|gif|png)$/.test(url);
    const isPDF = /\.pdf$/.test(url);

    if (isImage) {
      return (
        <Box
          component="img"
          src={url}
          alt="Uploaded File"
          sx={{ maxWidth: "100%" }}
        />
      );
    } else if (isPDF) {
      return (
        <Link href={url} target="_blank" rel="noopener noreferrer">
          View PDF
        </Link>
      );
    }
  };

  return (
    <div>
      <Typography variant="h5">Transaction Details</Typography>
      {transaction ? (
        <div>
          <Typography>ID: {transaction.id}</Typography>
          <Typography>
            Date: {new Date(transaction.date).toLocaleDateString()}
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Account ID</TableCell>
                  <TableCell>Counter Account ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.type}</TableCell>
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
              <Typography variant="h6">Proof of Transaction</Typography>
              <Box
                component="img"
                src={transaction.proofFileURL}
                alt="Uploaded File"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          )}
        </div>
      ) : (
        <Typography>Loading...</Typography>
      )}
      <Link
        href={`/accounting/${accountId}/fiscalYears/${fiscalYearId}`}
        passHref
      >
        <Button variant="contained" color="primary">
          Back to Fiscal Year
        </Button>
      </Link>
    </div>
  );
};

export default TransactionPage;
