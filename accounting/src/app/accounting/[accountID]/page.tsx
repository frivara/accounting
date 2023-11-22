"use client";
import React, { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../db/firebase";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Grid,
  Card,
  Button,
  Typography,
  Box,
  Drawer,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { usePathname, useRouter } from "next/navigation";
import FiscalYearPage from "./fiscalYears/[fiscalYearId]/page";
import FiscalYearsList from "./FiscalYearsList";

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
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: "",
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: "",
            boxSizing: "border-box",
          },
        }}
      >
        Navigation items
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
              Back
            </Button>
            <Typography variant="h6" noWrap component="div">
              Account
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5">{account?.name}</Typography>
              <Typography variant="body1">
                Accounting plan: {account?.accountingPlan}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" component="h2">
                Fiscal years
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                component={Link}
                href={`/accounting/${account?.id}/fiscalYears/new`}
                sx={{ mt: 2 }}
              >
                Create a new fiscal year book
              </Button>
            </Card>
            <FiscalYearsList />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AccountPage;
