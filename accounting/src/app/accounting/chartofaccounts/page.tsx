"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import {
  Box,
  Button,
  Container,
  TextField,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import Papa from "papaparse";
import { MyContext } from "@/app/helpers/context";
import AccountTable from "../../components/AccountTable";
import TemplateSelection from "../../components/TemplateSelection";
import FileUpload from "../../components/FileUpload";

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
  const [loadMore, setLoadMore] = useState(true);
  const ITEMS_PER_PAGE = 20; // Adjust the number of items per page as needed
  const [currentPage, setCurrentPage] = useState(0);
  const accountsPerPage = 20;

  const fileInputRef: any = useRef(null);

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
    console.log("Clicked the delete button!");
    setAccounts((prev) => prev.filter((_, i) => i !== index));
    setVisibleAccounts((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAccount = async () => {
    // Update the database with the new accounts list
    if (selectedTemplate && !selectedTemplate.isDefault) {
      const updatedTemplate = {
        ...selectedTemplate,
        accounts: accounts,
      };

      console.log("Saving updated template:", updatedTemplate); // add this log

      await updateDoc(
        doc(db, "chartOfAccountsTemplates", selectedTemplate.id),
        updatedTemplate
      );
      alert("Account changes saved successfully!");
    } else {
      alert("You can only modify custom templates.");
    }
  };

  const handleNewAccountChange = (field: any, value: any) => {
    console.log(`Field: ${field}, Value: ${value}`);
    setNewAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    if (newAccount.code.length === 4 && newAccount.name !== "") {
      // Adding the new account to the list of accounts
      const updatedNewAccount = { ...newAccount };
      setAccounts((prev) => [...prev, updatedNewAccount]);

      // Also update visibleAccounts to reflect the new account
      setVisibleAccounts((prev: any) => [...prev, updatedNewAccount]);

      setNewAccount({ code: "", name: "" }); // Reset new account fields
    } else {
      console.log("Invalid account details");
    }
  };

  const handleSaveTemplate = async () => {
    const templateNameLower = templateName.toLowerCase();

    // Check if the template name already exists in default or custom templates
    const nameExistsInTemplates = [
      ...defaultTemplates,
      ...customTemplates,
    ].some(
      (template) => template.templateName.toLowerCase() === templateNameLower
    );

    if (nameExistsInTemplates) {
      alert(
        "A template with this name already exists. Please choose a different name."
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
      alert("Template saved successfully!");

      // Update the global state with the new template
      updateGlobalState(
        (prevState: {
          chartOfAccountsTemplates: { customTemplates: any };
        }) => ({
          ...prevState,
          chartOfAccountsTemplates: {
            ...prevState.chartOfAccountsTemplates,
            customTemplates: [
              ...prevState.chartOfAccountsTemplates.customTemplates,
              userTemplate,
            ],
          },
        })
      );
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
    const selectedTemplate = [...defaultTemplates, ...customTemplates].find(
      (t) => t.id === templateId
    );

    setSelectedTemplate(selectedTemplate);

    // Check if selectedTemplate is valid and has accounts
    if (selectedTemplate && selectedTemplate.accounts) {
      setAccounts(selectedTemplate.accounts); // Update accounts with all accounts from the selected template
      setVisibleAccounts(selectedTemplate.accounts.slice(0, accountsPerPage));
      setCurrentPage(1); // Reset currentPage to 1
      setLoadMore(true);
    } else {
      setAccounts([]); // Clear accounts if no template is selected
      setVisibleAccounts([]);
      setCurrentPage(0);
      setLoadMore(false);
    }
  };

  const loadMoreAccounts = () => {
    if (!selectedTemplate || !selectedTemplate.accounts) return;

    const nextIndex = currentPage * accountsPerPage;
    const newAccounts = selectedTemplate.accounts.slice(
      nextIndex,
      nextIndex + accountsPerPage
    );

    if (newAccounts.length > 0) {
      setVisibleAccounts((prev: any) => [...prev, ...newAccounts]);
      setCurrentPage((prev) => prev + 1);
    } else {
      setLoadMore(false); // No more accounts to load
    }
  };

  const observer: any = useRef();
  const lastAccountElementRef = useCallback(
    (node: any) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && loadMore) {
          loadMoreAccounts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadMore, currentPage] // Add currentPage as a dependency
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

      <TemplateSelection
        defaultTemplates={defaultTemplates}
        customTemplates={customTemplates}
        selectedTemplateId={selectedTemplate ? selectedTemplate.id : ""}
        onTemplateSelection={handleTemplateSelection}
      />

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

        <AccountTable
          accounts={visibleAccounts}
          handleAccountChange={handleAccountChange}
          handleDeleteAccount={handleDeleteAccount}
          newAccount={newAccount}
          handleNewAccountChange={handleNewAccountChange}
          handleAddAccount={handleAddAccount}
          lastAccountElementRef={lastAccountElementRef}
        />
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

      <FileUpload
        onFileButtonClick={handleFileButtonClick}
        fileInputRef={fileInputRef}
        onFileChange={handleFileUpload}
      />
    </StyledContainer>
  );
};

export default ChartOfAccountsPage;
