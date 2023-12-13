"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDoc,
  onSnapshot,
  doc,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../db/firebase";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

export interface Account {
  id: string;
  firestoreId: string;
  name: string;
  accountingPlan: string;
}

const drawerWidth = 240;

const OrganisationsPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountingPlans, setAccountingPlans] = useState<any>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const [accounts, setAccounts] = useState<Account[]>([]);

  const handleViewAccount = async (account: Account) => {
    // Get the ID of the account
    const id = account.firestoreId;

    // Get the account data
    const accountData = await getAccountById(id);

    // If the account data is null, the account does not exist
    if (!accountData) {
      return;
    }

    // Redirect to the account page
    router.push(`/accounting/${id}`);
  };

  const getAccountById = async (id: string) => {
    const accountDoc = await getDoc(doc(db, "organisations", id));
    const account = accountDoc.data();

    return account;
  };

  const handleCreateAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !selectedTemplateId) {
      console.log("You need to type in a name and choose an accounting plan");
      return;
    }

    try {
      const newAccount: Account = {
        id: Math.random().toString(36).substring(7),
        firestoreId: "",
        name,
        accountingPlan: selectedTemplateId, // Use the selected template ID here
      };

      await addDoc(collection(db, "organisations"), newAccount);

      setName("");
      setSelectedTemplateId(null); // Reset the selected template ID
    } catch (error) {
      console.error(error);
    }
  };

  // Read items from database

  useEffect(() => {
    const accountQuery = query(collection(db, "organisations"));
    // calling the function below "unsubscribe" refers to disconnecting from the database after fetching the data needed
    const unsubscribe = onSnapshot(accountQuery, (querySnapshot) => {
      let itemsArray: any = [];

      querySnapshot.forEach((doc) => {
        itemsArray.push({ ...doc.data(), firestoreId: doc.id });
      });
      setAccounts(itemsArray);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch Chart of Accounts Templates
    const fetchAccountingPlans = async () => {
      const querySnapshot = await getDocs(
        collection(db, "chartOfAccountsTemplates")
      );
      const plans = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccountingPlans(plans);
    };

    fetchAccountingPlans();
  }, []);

  const getTemplateNameById = (templateId: string) => {
    const template = accountingPlans.find(
      (plan: { id: string }) => plan.id === templateId
    );
    return template ? template.templateName : "Unknown";
  };

  return (
    <Grid
      container
      spacing={2}
      style={{ paddingLeft: drawerWidth + 20, paddingRight: 20, marginTop: 20 }}
    >
      {" "}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Mina organisationer
            </Typography>
            <List>
              {accounts.map((account) => (
                <ListItem
                  key={account.id}
                  button
                  onClick={() => handleViewAccount(account)}
                >
                  <ListItemText
                    primary={account.name}
                    secondary={getTemplateNameById(account.accountingPlan)}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Skapa en ny organisation
            </Typography>
            <form onSubmit={handleCreateAccount}>
              <TextField
                label="Namnge din organisation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                fullWidth
              />
              <Select
                value={selectedTemplateId || ""}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                displayEmpty
                fullWidth
                margin="dense"
              >
                <MenuItem value="">
                  <em>Välj en kontoplan</em>
                </MenuItem>
                {accountingPlans.map((plan: any) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.templateName}
                  </MenuItem>
                ))}
              </Select>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: 20 }}
              >
                Skapa organisation
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrganisationsPage;
