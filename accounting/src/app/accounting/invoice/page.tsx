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

    // This sets the font for consistency
    doc.setFont("helvetica");

    doc.setFontSize(18);
    doc.text(invoiceData.organizationName, 40, 50);
    doc.setFontSize(11);
    doc.text("Faktura", 40, 70);
    doc.setFontSize(10);
    doc.text(`Fakturadatum: ${invoiceData.invoiceDate}`, 40, 85);
    doc.text(`Förfallodatum: ${invoiceData.dueDate}`, 40, 100);
    doc.text(`Fakturanummer: ${invoiceData.invoiceNumber}`, 40, 115);

    doc.text(`Kundens namn: ${invoiceData.customerName}`, 300, 85);
    doc.text(`Kundens adress: ${invoiceData.customerAddress}`, 300, 100);
    doc.text(
      `Organisationsnummer: ${invoiceData.organizationNumber}`,
      300,
      115
    );

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

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 130,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [200, 200, 200] },
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    // Footer
    let finalY = doc.lastAutoTable.finalY || 130; // Get the final Y coordinate of the autoTable
    doc.setFontSize(10);
    doc.text(
      "Vänligen betala beloppet till bankgironummer 1234-5678",
      40,
      finalY + 30
    );

    // Total Sum
    const total = invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    doc.setFontSize(11);
    doc.text(`Total summa: ${total.toFixed(2)} SEK`, 40, finalY + 45);

    console.log("Items:", invoiceData.items);
    console.log("Table Rows:", tableRows);
    // Output the PDF for preview
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
        padding: theme.spacing(2),
        marginLeft: "240px", // Adjust based on the navbar width
        marginTop: theme.spacing(2),
        overflow: "hidden",
        maxWidth: "calc(100vw - ${theme.spacing(30)}px)", // Subtract navbar width from the viewport width
        height: "calc(100vh - ${theme.spacing(4)}px)", // Adjust for the top margin
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
          height: "calc(100% - 48px)", // Subtract the height of the header
          overflow: "auto",
        }}
      >
        <Grid container spacing={2} sx={{ paddingRight: theme.spacing(30) }}>
          <Grid container item spacing={2}>
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
                <Grid container spacing={2} key={index}>
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
                </Grid>
              ))}
            </Box>
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
