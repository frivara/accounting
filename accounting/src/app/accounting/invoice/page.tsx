"use client";
import React, { useState } from "react";
import { TextField, Button, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Item {
  productName: string;
  unit: string;
  quantity: number | "";
  unitPrice: number | "";
  vatRate: string;
}

interface InvoiceData {
  organizationNumber: string;
  vatNumber: string;
  organizationName: string;
  address: string;
  customerName: string;
  customerAddress: string;
  customerNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  items: Item[];
}

const InvoicePage = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    organizationNumber: "",
    vatNumber: "",
    organizationName: "",
    address: "",
    customerName: "",
    customerAddress: "",
    customerNumber: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    paymentTerms: "",
    items: [
      { productName: "", unit: "", quantity: 0, unitPrice: 0, vatRate: "25" },
    ],
  });

  const theme = useTheme();

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { productName: "", unit: "", quantity: 0, unitPrice: 0, vatRate: "25" },
      ],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const tableColumns = [
      "Product Name",
      "Unit",
      "Quantity",
      "Unit Price",
      "VAT Rate",
    ];
    const tableRows: (string | number)[][] = [];

    invoiceData.items.forEach((item) => {
      const itemData = [
        item.productName,
        item.unit,
        item.quantity,
        item.unitPrice,
        `${item.vatRate}%`,
      ];
      tableRows.push(itemData);
    });

    doc.text("Invoice", 14, 15);
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 20,
    });

    doc.output("dataurlnewwindow");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generatePDF();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        marginLeft: "240px",
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
          marginLeft: "240px",
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Skapa Ny Faktura
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Organisationsnummer"
              value={invoiceData.organizationNumber}
              onChange={(e) =>
                handleInputChange("organizationNumber", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Momsregistreringsnummer"
              value={invoiceData.vatNumber}
              onChange={(e) => handleInputChange("vatNumber", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Organisationsnamn"
              value={invoiceData.organizationName}
              onChange={(e) =>
                handleInputChange("organizationName", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Organisationens adress"
              value={invoiceData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Kundens namn"
              value={invoiceData.customerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Kundens adress"
              value={invoiceData.customerAddress}
              onChange={(e) =>
                handleInputChange("customerAddress", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Kundnummer"
              value={invoiceData.customerNumber}
              onChange={(e) =>
                handleInputChange("customerNumber", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Fakturanummer"
              value={invoiceData.invoiceNumber}
              onChange={(e) =>
                handleInputChange("invoiceNumber", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Fakturadatum"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={invoiceData.invoiceDate}
              onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Förfallodatum"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={invoiceData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Betalningsvillkor"
              value={invoiceData.paymentTerms}
              onChange={(e) =>
                handleInputChange("paymentTerms", e.target.value)
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Fakturaposter</Typography>
          </Grid>
          {invoiceData.items.map((item, index) => (
            <React.Fragment key={index}>
              <Grid item xs={3}>
                <TextField
                  label="Produktnamn"
                  value={item.productName}
                  onChange={(e) =>
                    updateItem(index, "productName", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Enhet"
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Antal"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Enhetspris"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(index, "unitPrice", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  label="Momssats"
                  select
                  SelectProps={{ native: true }}
                  value={item.vatRate}
                  onChange={(e) => updateItem(index, "vatRate", e.target.value)}
                  fullWidth
                >
                  <option value="25">25%</option>
                  <option value="12">12%</option>
                  <option value="6">6%</option>
                </TextField>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button onClick={addItem} variant="outlined">
              Lägg till artikel
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained">
              Generera faktura
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default InvoicePage;
