"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export interface Account {
  id: string;
  firestoreId: string;
  name: string;
  accountingPlan: string;
}

const OrganisationsPage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountingPlans, setAccountingPlans] = useState<any>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

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
    const accountDoc = await getDoc(doc(db, "accounts", id));
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

      await addDoc(collection(db, "accounts"), newAccount);

      setName("");
      setSelectedTemplateId(null); // Reset the selected template ID
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteDialog = (accountId: string) => {
    setAccountToDelete(accountId);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      await deleteDoc(doc(db, "accounts", accountToDelete));
      // Refresh the list or handle the UI update as needed
      closeDeleteDialog();
    }
  };

  // Read items from database

  useEffect(() => {
    const accountQuery = query(collection(db, "accounts"));
    // calling the function below "unsubscribe" refers to disconnecting from the database after fetching the data needed
    const unsubscribe = onSnapshot(accountQuery, (querySnapshot) => {
      let itemsArray: any = [];

      querySnapshot.forEach((doc) => {
        itemsArray.push({ ...doc.data(), firestoreId: doc.id });
        console.log(doc.id);
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
    <div>
      <Typography variant="h4" gutterBottom>
        My organisations
      </Typography>
      <List>
        {accounts.map((account: Account) => (
          <ListItem
            key={account.id}
            onClick={() => handleViewAccount(account)}
            sx={{
              cursor: "pointer", // Change mouse pointer on hover
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent ListItem onClick from firing
                  openDeleteDialog(account.firestoreId);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={account.name}
              secondary={getTemplateNameById(account.accountingPlan)}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h5" gutterBottom>
        Create a new organisation
      </Typography>
      <form onSubmit={handleCreateAccount}>
        <TextField
          label="Enter name of organisation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          fullWidth
        />

        <Select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value as string)}
          displayEmpty
          fullWidth
          margin="none"
        >
          <MenuItem value="">
            <em>Select an accounting plan</em>
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
          Create organisation
        </Button>
      </form>
      <Dialog
        open={openDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Account"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrganisationsPage;
