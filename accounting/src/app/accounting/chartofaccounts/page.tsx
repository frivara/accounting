"use client";
import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../db/firebase"; // Adjust the import path accordingly
import {
  Button,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/system";
import Papa from "papaparse";

interface CoaAccount {
  code: string;
  name: string;
}

const StyledContainer = styled(Container)({
  padding: "32px",
  marginLeft: "15vw",
});

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState<CoaAccount[]>([]);
  const [newAccount, setNewAccount] = useState<CoaAccount>({
    code: "",
    name: "",
  });
  const [templateName, setTemplateName] = useState<string>("");

  const fileInputRef: any = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current!.click();
  };

  useEffect(() => {
    // Fetch existing CoA templates/accounts from Firebase on page load
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(
        collection(db, "chartOfAccountsTemplates")
      );
      // For simplicity, load the first template found for the WIP
      const firstDoc = querySnapshot.docs[0];
      if (firstDoc) {
        setAccounts(firstDoc.data().accounts);
        setTemplateName(firstDoc.data().templateName);
      }
    };
    fetchAccounts();
  }, []);

  const handleAccountChange = (index: number, field: string, value: string) => {
    const updatedAccounts: any = [...accounts];
    updatedAccounts[index][field] = value;
    setAccounts(updatedAccounts);
  };

  const handleNewAccountChange = (field: string, value: string) => {
    setNewAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    setAccounts((prev) => [...prev, newAccount]);
    setNewAccount({ code: "", name: "" });
  };

  const handleSaveTemplate = async () => {
    try {
      await addDoc(collection(db, "chartOfAccountsTemplates"), {
        templateName,
        accounts,
      });
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      Papa.parse(files[0], {
        header: true,
        complete: (result) => {
          console.log("Parsed CSV:", result.data);
          processCsvData(result.data);
        },
      });
    }
  };

  const processCsvData = (data: any[]) => {
    const accountsFromCsv = data.map((row: { [x: string]: any }) => ({
      code: row["Account Code"], // Adjust based on our CSV column names, these might be changed later
      name: row["Account Name"],
    }));

    setAccounts(accountsFromCsv);
  };

  return (
    <StyledContainer>
      <TextField
        label="Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Account Code</TableCell>
            <TableCell>Account Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  value={account.code}
                  onChange={(e) =>
                    handleAccountChange(index, "code", e.target.value)
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
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <TextField
                placeholder="New Account Code"
                value={newAccount.code}
                onChange={(e) => handleNewAccountChange("code", e.target.value)}
              />
            </TableCell>
            <TableCell>
              <TextField
                placeholder="New Account Name"
                value={newAccount.name}
                onChange={(e) => handleNewAccountChange("name", e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Button onClick={handleAddAccount}>Add Account</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button variant="contained" color="primary" onClick={handleSaveTemplate}>
        Save Template
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileButtonClick}
        style={{ margin: "20px 0" }}
      >
        Upload CSV
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }} // Hide the actual file input
      />
    </StyledContainer>
  );
};

export default ChartOfAccountsPage;
