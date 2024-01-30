"use client";
import React, { useState, useEffect, useContext } from "react";
import { onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import Link from "next/link";
import {
  Grid,
  Card,
  Button,
  Typography,
  Box,
  Drawer,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { usePathname, useRouter } from "next/navigation";
import FiscalYearsList from "../../components/FiscalYearsList";
import { AccountDetails } from "@/app/helpers/interfaces";
import { MyContext } from "@/app/helpers/context";

const OrganisationId: React.FC = () => {
  const [organisation, setOrganisation] = useState<AccountDetails | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { globalState } = useContext<any>(MyContext);
  const templates = globalState.chartOfAccountsTemplates;

  const pathname = usePathname();
  const router = useRouter();

  const getTemplateNameById = (templateId: any) => {
    const allTemplates = [
      ...templates.defaultTemplates,
      ...templates.customTemplates,
    ];
    const foundTemplate = allTemplates.find(
      (template) => template.id === templateId
    );
    return foundTemplate ? foundTemplate.templateName : "Unknown Template";
  };

  useEffect(() => {
    const organisationId = pathname.split("/").pop();

    if (!organisationId) {
      return;
    }

    const accountRef = doc(db, "organisations", organisationId);

    const unsubscribe = onSnapshot(accountRef, (doc) => {
      if (doc.exists()) {
        const accountData = {
          name: doc.data().name,
          accountingPlan: doc.data().accountingPlan,
          id: doc.id,
        };
        setOrganisation(accountData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname]);

  if (!organisation) {
    return (
      <Container>
        <Typography>Konto hittades inte</Typography>
      </Container>
    );
  }

  const openDeleteDialog = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteAccount = async () => {
    if (organisation) {
      await deleteDoc(doc(db, "organisations", organisation.id));
      router.push(`/accounting/`);
      closeDeleteDialog();
    }
  };

  const DeleteConfirmationDialog = ({ open, onClose, onConfirm }: any) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Organization</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Är du säker på att du vill radera denna organisation?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Avbryt
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Radera
        </Button>
      </DialogActions>
    </Dialog>
  );

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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/accounting/`)}
        sx={{ position: "absolute", top: 16, left: `calc(240px + 16px)` }}
      >
        Back
      </Button>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h4"
          noWrap
          component="div"
          sx={{ textAlign: "center", mb: 2, mt: 1 }}
        >
          {organisation ? organisation.name : "Laddar..."}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5">{organisation?.name}</Typography>
              <Typography variant="body1">
                Bokföringsplan:{" "}
                {getTemplateNameById(organisation?.accountingPlan)}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => openDeleteDialog()}
                sx={{ mt: 2 }}
              >
                Radera organisation
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" component="h2">
                Räkenskapsår
              </Typography>
              <FiscalYearsList />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                component={Link}
                href={`/accounting/${organisation?.id}/fiscalYears/new`}
                sx={{ mt: 2 }}
              >
                Skapa nytt räkenskapsår
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <DeleteConfirmationDialog
        open={openDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteAccount}
      />
    </Box>
  );
};

export default OrganisationId;
