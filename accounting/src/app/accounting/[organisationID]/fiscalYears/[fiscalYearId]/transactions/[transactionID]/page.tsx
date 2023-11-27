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
} from "@mui/material";
import Link from "next/link";

interface Entry {
  accountId: string;
  counterAccountId?: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

interface Transaction {
  id: string;
  entries: Entry[];
  date: string;
  proofFileURL?: string; // Optional since it might not exist for all transactions
}

const TransactionPage: React.FC = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const transactionId = pathSegments[pathSegments.length - 1];
  const fiscalYearId = pathSegments[pathSegments.length - 3];
  const accountId = pathSegments[pathSegments.length - 5];

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
      return <img src={url} alt="Uploaded File" style={{ maxWidth: "100%" }} />;
    } else if (isPDF) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View PDF
        </a>
      );
    }
  };

  return (
    <div>
      <h1>Transaction Details</h1>
      {transaction ? (
        <div>
          <p>ID: {transaction.id}</p>
          <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>

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
            <div
              style={{
                position: "relative",
                width: "20vw",
                height: "desiredHeight",
              }}
            >
              <h2>Proof of Transaction</h2>
              <img
                src={transaction.proofFileURL}
                alt="Uploaded File"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
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
