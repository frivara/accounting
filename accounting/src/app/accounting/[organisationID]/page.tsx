"use client";
import React, { useState, useEffect, useContext } from "react";
import { onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
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
  TextField,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { usePathname, useRouter } from "next/navigation";
import FiscalYearsList from "../../components/FiscalYearsList";
import { AccountDetails } from "@/app/helpers/interfaces";
import { MyContext } from "@/app/helpers/context";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon from "@mui/icons-material/Edit";

const OrganisationId: React.FC = () => {
  const [organisation, setOrganisation] = useState<AccountDetails | null>(null);
  const [name, setName] = useState(organisation ? organisation.name : "");
  const [number, setNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [isOrgNameEditable, setIsOrgNameEditable] = useState(false);
  const [isOrgNumEditable, setIsOrgNumEditable] = useState(false);
  const [isVatNumEditable, setIsVatNumEditable] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { globalState } = useContext<any>(MyContext);
  const templates = globalState.chartOfAccountsTemplates;

  const pathname = usePathname();
  const router = useRouter();
  const organisationId = pathname.split("/").pop();

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
    console.log("Organisations-id: " + organisationId);

    if (!organisationId) {
      return;
    }
    const accountRef = doc(db, "organisations", organisationId);
    const unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const accountData: any = docSnapshot.data();
        setOrganisation(accountData);
        setName(accountData.name);
        setNumber(accountData.number);
        setVatNumber(accountData.vatNumber);
        setLogo(accountData.logo);
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

  const handleSaveDetails = async () => {
    const orgRef = doc(db, "organisations", organisationId!);
    await updateDoc(orgRef, {
      name: name,
      number: number,
      vatNumber: vatNumber,
      logo: logo,
    });
  };

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

  const fileInputRef = React.createRef<HTMLInputElement>();
  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const fileType = file.type;
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        alert("Please upload an image of type JPG or PNG.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result;
        // Check if result is a string and starts with 'data:image/png' or 'data:image/jpeg'
        if (
          typeof result === "string" &&
          /^data:image\/(png|jpeg);base64,/.test(result)
        ) {
          setLogo(result);
          console.log("Logo uploaded");
        } else {
          console.error("Failed to load logo as a base64 string");
        }
      };
      reader.onerror = (e) => {
        console.error("Error reading file", e.target!.error);
      };
      reader.readAsDataURL(file);
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
    <Box sx={{ display: "flex", marginTop: "5%" }}>
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
              <Box display="flex" alignItems="center" marginBottom="8px">
                <TextField
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: !isOrgNameEditable,
                    disableUnderline: !isOrgNameEditable,
                    style: {
                      fontSize: "1.25rem", // h5 font size
                      fontWeight: "bold",
                      cursor: isOrgNameEditable ? "text" : "default",
                      border: isOrgNameEditable ? "1px solid grey" : "none",
                      borderRadius: "4px",
                      backgroundColor: isOrgNameEditable ? "transparent" : "",
                    },
                  }}
                  variant="standard" // Use "standard" to get rid of the background color and make it look more like the original Typography
                  InputLabelProps={{
                    shrink: true,
                  }}
                  hiddenLabel
                />
                <Button
                  onClick={() => setIsOrgNameEditable(!isOrgNameEditable)}
                  sx={{ ml: 1 }} // Adds some left margin (margin left = ml) to the button
                >
                  <EditIcon />
                </Button>
              </Box>

              <Typography variant="body1">
                Bokföringsplan:{" "}
                {getTemplateNameById(organisation?.accountingPlan)}
                <Box display="flex" alignItems="center" marginBottom="8px">
                  <TextField
                    label="Organisationsnummer"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      readOnly: !isOrgNumEditable,
                      disableUnderline: !isOrgNumEditable,
                      style: {
                        cursor: isOrgNumEditable ? "text" : "default",
                        border: isOrgNumEditable ? "1px solid grey" : "none",
                        borderRadius: "4px",
                      },
                    }}
                    variant="standard"
                  />
                  <Button
                    onClick={() => setIsOrgNumEditable(!isOrgNumEditable)}
                  >
                    <EditIcon />
                  </Button>
                </Box>
                <Box display="flex" alignItems="center" marginBottom="8px">
                  <TextField
                    label="Momsregistreringsnummer"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      readOnly: !isVatNumEditable,
                      disableUnderline: !isVatNumEditable,
                      style: {
                        cursor: isVatNumEditable ? "text" : "default",
                        border: isVatNumEditable ? "1px solid grey" : "none",
                        borderRadius: "4px",
                      },
                    }}
                    variant="standard"
                  />
                  <Button
                    onClick={() => setIsVatNumEditable(!isVatNumEditable)}
                  >
                    <EditIcon />
                  </Button>
                </Box>
                <Grid item>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Button variant="contained" onClick={handleLogoButtonClick}>
                    Ladda upp logotyp
                  </Button>
                  <Tooltip
                    title="Logotypen kan max vara 200px bred och 100px hög"
                    placement="right"
                  >
                    <HelpOutlineIcon
                      style={{ marginLeft: "8px", cursor: "help" }}
                    />
                  </Tooltip>
                </Grid>
                {logo ? (
                  <Grid item>
                    <img
                      src={logo}
                      alt="Uploaded Logo"
                      style={{
                        maxHeight: 100,
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Grid>
                ) : (
                  <Grid item>
                    <div
                      style={{
                        height: 100,
                        maxWidth: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "30%",
                        fontSize: "1em",
                      }}
                    >
                      <span>Ingen logotyp uppladdad</span>{" "}
                    </div>
                  </Grid>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveDetails}
                  sx={{ mt: 2 }}
                >
                  Spara detaljer
                </Button>
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
                href={`/accounting/${organisationId}/fiscalYears/new`}
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
