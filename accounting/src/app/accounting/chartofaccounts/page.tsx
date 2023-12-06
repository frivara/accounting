"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../db/firebase"; // Adjust the import path accordingly
import {
  Box,
  Button,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ListSubheader,
  Typography,
  Paper,
  TableContainer,
} from "@mui/material";
import { styled } from "@mui/system";
import Papa from "papaparse";
import AccountCodeSearch from "@/app/components/AccountCodeSearch";
import DeleteIcon from "@mui/icons-material/Delete";
import { MyContext } from "@/app/helpers/context";

interface CoaAccount {
  code: string;
  name: string;
}

const StyledContainer = styled(Container)({
  padding: "10px",
  marginLeft: "15vw",
});

const ChartOfAccountsPage = () => {
  const { globalState, updateGlobalState } = useContext<any>(MyContext);
  const { defaultTemplates, customTemplates } =
    globalState.chartOfAccountsTemplates || {
      defaultTemplates: [],
      customTemplates: [],
    };
  const [accounts, setAccounts] = useState<CoaAccount[]>([]);
  const [newAccount, setNewAccount] = useState<CoaAccount>({
    code: "",
    name: "",
  });
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [visibleAccounts, setVisibleAccounts] = useState<any>([]);
  const [loadMore, setLoadMore] = useState(false);
  const ITEMS_PER_PAGE = 20; // Adjust the number of items per page as needed

  const fileInputRef: any = useRef(null);

  useEffect(() => {
    console.log(globalState);
  }, []);

  const handleFileButtonClick = () => {
    fileInputRef.current!.click();
  };

  const handleAccountChange = (
    index: number,
    field: keyof CoaAccount,
    value: string
  ) => {
    if (field === "code") {
      setIsCodeValid(value.length === 4);
    }
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setAccounts(updatedAccounts);
  };

  const handleDeleteAccount = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAccount = async () => {
    // Update the database with the new accounts list
    if (selectedTemplate && !selectedTemplate.isDefault) {
      const updatedTemplate = {
        ...selectedTemplate,
        accounts: accounts,
      };

      await updateDoc(
        doc(db, "chartOfAccountsTemplates", selectedTemplate.id),
        updatedTemplate
      );
      alert("Account changes saved successfully!");
    } else {
      alert("You can only modify custom templates.");
    }
  };

  const handleNewAccountChange = (field: keyof CoaAccount, value: string) => {
    setNewAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    if (newAccount.code.length === 4 && newAccount.name !== "") {
      setAccounts((prev) => [...prev, newAccount]);
      setNewAccount({ code: "", name: "" }); // Reset new account fields
    }
  };

  const handleSaveTemplate = async () => {
    // Check if the template name already exists in default templates
    const nameExists = defaultTemplates.some(
      (template: any) =>
        template.templateName.toLowerCase() === templateName.toLowerCase()
    );

    if (nameExists) {
      alert(
        "A default template with this name already exists. Please choose a different name."
      );
      return;
    }

    if (accounts.some((account) => account.code.length !== 4)) {
      alert("Cannot save: Account codes need to be 4 digits long.");
      return;
    }

    // Continue with save operation if the name does not exist
    const userTemplate = {
      templateName,
      accounts,
      isDefault: false, // User templates are not default
    };

    try {
      const docRef = await addDoc(
        collection(db, "chartOfAccountsTemplates"),
        userTemplate
      );
      console.log("User template saved with ID: ", docRef.id);
      alert("Template saved successfully!");

      // Update the global state with the new template
      updateGlobalState({
        chartOfAccountsTemplates: {
          defaultTemplates: [...defaultTemplates], // Update accordingly
          customTemplates: [...customTemplates, userTemplate], // Add the new user template
        },
      });
    } catch (error) {
      console.error("Error saving user template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];

      // Extract file name without extension
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setTemplateName(fileName); // Set the file name as template name

      Papa.parse(file, {
        header: true,
        complete: (result) => {
          processCsvData(result.data, fileName); // Pass fileName here
        },
      });
    }
  };

  const processCsvData = (data: any[], fileName: string) => {
    // Add fileName parameter here
    const accountsFromCsv = data
      .filter((row) => row["Account Code"] && row["Account Name"])
      .map((row) => ({
        code: row["Account Code"],
        name: row["Account Name"],
      }));

    // Use the fileName parameter when setting the templateToSave
    const templateToSave = {
      templateName: fileName, // Use fileName directly
      accounts: accountsFromCsv,
      isDefault: true,
    };

    // Call a function to save this object to the database
    saveTemplateToDatabase(templateToSave);
  };

  const saveTemplateToDatabase = async (template: any) => {
    try {
      const docRef = await addDoc(
        collection(db, "chartOfAccountsTemplates"),
        template
      );
      console.log("Template saved with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding template: ", error);
    }
  };

  const handleTemplateSelection = (templateId: string) => {
    let template = defaultTemplates.find((t: any) => t.id === templateId);
    if (!template) {
      template = customTemplates.find((t: any) => t.id === templateId);
    }

    setSelectedTemplate(template);

    if (template) {
      setVisibleAccounts(template.accounts.slice(0, ITEMS_PER_PAGE));
      setLoadMore(template.accounts.length > ITEMS_PER_PAGE);
      const accountsClone = template.accounts.map((account: any) => ({
        ...account,
      }));
      setAccounts(accountsClone);
      setTemplateName(template.templateName);
    } else {
      setAccounts([]);
      setTemplateName("");
    }
  };

  const handleLoadMore = () => {
    const currentLength = visibleAccounts.length;
    const isMore = currentLength < accounts.length;
    const nextResults = isMore
      ? accounts.slice(currentLength, currentLength + ITEMS_PER_PAGE)
      : [];
    setVisibleAccounts((prevAccounts: any) => [
      ...prevAccounts,
      ...nextResults,
    ]);
    setLoadMore(accounts.length > currentLength + nextResults.length);
  };

  const observer: any = useRef();
  const lastAccountElementRef = useCallback(
    (node: any) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && loadMore) {
          handleLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadMore]
  );

  useEffect(() => {
    // Cleanup observer on component unmount
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return (
    <StyledContainer>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Kontoplaner
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Välj en kontoplanmall
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="default-template-select-label">
            Välj en mall
          </InputLabel>
          <Select
            labelId="default-template-select-label"
            value={selectedTemplate ? selectedTemplate.id : ""}
            label="Välj en mall"
            onChange={(e) => handleTemplateSelection(e.target.value)}
          >
            <ListSubheader>Låsta kontoplaner</ListSubheader>
            {defaultTemplates.map((template: any) => (
              <MenuItem key={template.id} value={template.id}>
                {template.templateName}
              </MenuItem>
            ))}
            <ListSubheader>Mina kontoplaner</ListSubheader>
            {customTemplates.map((template: any) => (
              <MenuItem key={template.id} value={template.id}>
                {template.templateName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Skapa eller redigera kontoplan
        </Typography>
        <TextField
          label="Namn på mallen"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "30%" }}>Kontonummer</TableCell>
                <TableCell style={{ width: "39%" }}>Kontonamn</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableBody>
              {visibleAccounts.map((account: any, index: any) => (
                <TableRow
                  key={index}
                  ref={
                    index === visibleAccounts.length - 1
                      ? lastAccountElementRef
                      : null
                  }
                >
                  <TableCell>
                    <TextField
                      value={account.code}
                      onChange={(e) =>
                        handleAccountChange(index, "code", e.target.value)
                      }
                      error={!isCodeValid && account.code.length > 0}
                      helperText={
                        !isCodeValid && account.code.length > 0
                          ? "Koden måste vara exakt 4 tecken lång"
                          : ""
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={account.name}
                      onChange={(e) =>
                        handleAccountChange(index, "name", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteAccount(index)}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <AccountCodeSearch
                    currentAccountId={newAccount.code}
                    onSelectAccount={(selectedAccount: {
                      code: string;
                      name: string;
                    }) => {
                      if (selectedAccount) {
                        setNewAccount({
                          ...newAccount,
                          code: selectedAccount.code,
                          name: selectedAccount.name,
                        });
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    placeholder="Kontonamn"
                    value={newAccount.name}
                    onChange={(e) =>
                      handleNewAccountChange("name", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={handleAddAccount}>Lägg till konto</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 4, mb: 4 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveTemplate}
        >
          Spara som ny mall
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveAccount}>
          Spara ändringar
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileButtonClick}
        >
          Ladda upp CSV
        </Button>
      </Box>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </StyledContainer>
  );
};

export default ChartOfAccountsPage;
