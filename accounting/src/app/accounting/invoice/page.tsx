"use client";
import React, { useState } from "react";
import { TextField, Button, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/globals.css";

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
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

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

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems: any = [...invoiceData.items];
    const newValue =
      field === "quantity" || field === "unitPrice" ? Number(value) : value;
    newItems[index] = { ...newItems[index], [field]: newValue };

    // If quantity or unitPrice fields are updated, recalculate the amount
    if (field === "quantity" || field === "unitPrice") {
      const quantity = newItems[index].quantity || 0;
      const unitPrice = newItems[index].unitPrice || 0;
      newItems[index].amount = quantity * unitPrice; // Calculate amount here
    }

    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const generatePDF = () => {
    const doc: any = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });

    // Set the font for consistency
    doc.setFont("helvetica");

    // Optionally, add a logo
    if (logoPreview) {
      doc.addImage(logoPreview, "JPEG", 40, 30, 120, 60); // Adjust the position and size as needed
    }

    // Title and company info
    doc.setFontSize(18);
    doc.text(invoiceData.organizationName, 40, 150);
    doc.setFontSize(11);
    doc.text("Faktura", 300, 30);
    doc.setFontSize(10);
    doc.text(`Fakturadatum: ${invoiceData.invoiceDate}`, 300, 45);
    doc.text(`Förfallodatum: ${invoiceData.dueDate}`, 300, 60);
    doc.text(`Fakturanummer: ${invoiceData.invoiceNumber}`, 300, 75);

    // Customer info
    doc.text(`Kundens namn: ${invoiceData.customerName}`, 40, 200);
    doc.text(`Kundens adress: ${invoiceData.customerAddress}`, 40, 215);
    doc.text(`Organisationsnummer: ${invoiceData.organizationNumber}`, 40, 230);

    // Table of invoice items
    const tableColumns = [
      { title: "Beskrivning", dataKey: "productName" },
      { title: "Antal", dataKey: "quantity" },
      { title: "À-pris", dataKey: "unitPrice" },
      { title: "Belopp", dataKey: "amount" },
      { title: "Moms", dataKey: "vatRate" },
    ];

    const tableRows = invoiceData.items.map((item) => [
      item.productName,
      item.quantity.toString(),
      item.unitPrice.toString(),
      item.quantity && item.unitPrice
        ? (item.quantity * item.unitPrice).toFixed(2)
        : "0.00", // Calculates amount
      item.vatRate + "%",
    ]);

    // Generate the table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 250,
      margin: { horizontal: 40 },
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 40, halign: "right" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
    });

    // Calculate totals
    let subtotal = 0;
    let vat = 0;
    invoiceData.items.forEach((item: any) => {
      let amount: any = item.quantity * item.unitPrice;
      let vatAmount = amount * (parseFloat(item.vatRate) / 100);
      subtotal += amount;
      vat += vatAmount;
    });
    let total = subtotal + vat;

    // Footer with totals
    let finalY = doc.lastAutoTable.finalY || 250;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${subtotal.toFixed(2)} SEK`, 400, finalY + 20);
    doc.text(`Moms: ${vat.toFixed(2)} SEK`, 400, finalY + 35);
    doc.text(`Total summa: ${total.toFixed(2)} SEK`, 400, finalY + 50);

    // Payment instructions
    doc.text(
      "Vänligen betala beloppet till bankgironummer 1234-5678",
      40,
      finalY + 20
    );

    // Output the PDF for preview
    doc.output("dataurlnewwindow");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generatePDF();
  };

  const deleteItem = (index: number) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : "");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: theme.spacing(2),
        marginLeft: "240px",
        marginTop: theme.spacing(2),
        overflowX: "hidden",
        maxWidth: `calc(100vw - ${theme.spacing(30)})`,
        height: `calc(100vh - ${theme.spacing(4)})`,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Skapa Ny Faktura
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          height: "calc(100% - 48px)",
          overflow: "auto",
        }}
      >
        {/* Upload Logo Button */}
        <Grid
          container
          item
          xs={4}
          justifyContent="flex-end"
          alignItems="center"
          id="upload-logo"
        >
          <Box>
            <input
              accept="image/*"
              id="logo-upload"
              type="file"
              onChange={handleLogoUpload}
              style={{ display: "none" }}
            />
            <label htmlFor="logo-upload">
              <Button variant="contained" component="span">
                Ladda upp logotyp
              </Button>
            </label>
          </Box>
          {logoPreview && (
            <Typography id="logo-uploaded">Logotyp uppladdad</Typography>
          )}
        </Grid>
        <Grid container spacing={2} sx={{ paddingRight: theme.spacing(30) }}>
          <Grid container item spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Organisationsnamn"
                value={invoiceData.organizationName}
                onChange={(e) =>
                  handleInputChange("organizationName", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Organisationsnummer"
                value={invoiceData.organizationNumber}
                onChange={(e) =>
                  handleInputChange("organizationNumber", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Momsregistreringsnummer"
                value={invoiceData.vatNumber}
                onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container item spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Kundens namn"
                value={invoiceData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Kundens adress"
                value={invoiceData.customerAddress}
                onChange={(e) =>
                  handleInputChange("customerAddress", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Kundnummer"
                value={invoiceData.customerNumber}
                onChange={(e) =>
                  handleInputChange("customerNumber", e.target.value)
                }
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container item spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Fakturanummer"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  handleInputChange("invoiceNumber", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Fakturadatum"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  handleInputChange("invoiceDate", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Förfallodatum"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container item spacing={2}>
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
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Fakturaposter</Typography>
            <Box sx={{ overflowY: "auto", maxHeight: "200px" }}>
              {invoiceData.items.map((item, index) => (
                <Grid container spacing={2} key={index} alignItems="center">
                  <Grid item xs={3}>
                    <TextField
                      label="Produktnamn"
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(index, "productName", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Enhet"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(index, "unit", e.target.value)
                      }
                      fullWidth
                      margin="normal"
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
                      margin="normal"
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
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Momssats"
                      select
                      SelectProps={{ native: true }}
                      value={item.vatRate}
                      onChange={(e) =>
                        updateItem(index, "vatRate", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                    >
                      <option value="25">25%</option>
                      <option value="12">12%</option>
                      <option value="6">6%</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <Button
                      onClick={() => deleteItem(index)}
                      variant="contained"
                      color="error"
                    >
                      Ta bort
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Box>{" "}
            <Button onClick={addItem} variant="outlined" sx={{ mt: 2 }}>
              Lägg till artikel
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Generera faktura
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default InvoicePage;
