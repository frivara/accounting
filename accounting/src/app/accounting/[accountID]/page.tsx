"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../db/firebase";
import Link from "next/link";
import FiscalYearsList from "./FiscalYearsList";
import { Container, Button, Typography, Paper, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface Account {
  id: string;
  name: string;
  accountingPlan: string;
}

const AccountPage: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const accountId = pathname.split("/").pop();

    if (!accountId) {
      return;
    }

    const accountRef = doc(db, "accounts", accountId);

    const unsubscribe = onSnapshot(accountRef, (doc) => {
      if (doc.exists()) {
        const accountData = {
          name: doc.data().name,
          accountingPlan: doc.data().accountingPlan,
          id: doc.id,
        };
        setAccount(accountData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname]);

  if (!account) {
    return (
      <Container>
        <Typography>Account not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Account
        </Typography>
      </Box>
      <Paper elevation={3} style={{ padding: 16, marginBottom: 24 }}>
        <Typography variant="h6" component="h2">
          {account.name}
        </Typography>
        <Typography variant="body1">
          Accounting plan: {account.accountingPlan}
        </Typography>
      </Paper>

      <Box mt={4} mb={2}>
        <Typography variant="h5" component="h2">
          Fiscal years
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          component={Link}
          href={`/accounting/${account.id}/fiscalYears/new`}
          style={{ marginTop: 16 }}
        >
          Create a new fiscal year book
        </Button>
      </Box>
      <FiscalYearsList />
    </Container>
  );
};

export default AccountPage;
