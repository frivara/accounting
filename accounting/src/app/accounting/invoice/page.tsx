"use client";
"use client";
import React, { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";

import { TextField, Button, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface Item {
  productName: string;
  unit: string;
  quantity: number | "";
  unitPrice: number | "";
  vatRate: string;
}

interface InvoiceData {
  organizationNumber: string;
  vatNumber?: string; // Made optional
  organizationName: string;
  customerName: string;
  customerAddress: {
    street: string;
    postalCode: string;
    postalTown: string;
  };
  customerNumber: string;
  invoiceNumber: string; // Made mandatory
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  items: Item[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
    fontSize: 10,
    left: 300,
    width: "50%",
  },
  invoiceInfo: {
    flexDirection: "row",
    fontSize: 10,
    marginBottom: 20,
  },
  customerInfo: {
    flexDirection: "column",
    fontSize: 10,
    marginBottom: 20,
    border: "1px solid black",
    width: "94%",
    padding: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  details: {
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 25,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopStyle: "solid",
    borderTopColor: "#bfbfbf",
  },
});

const InvoicePage = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    organizationNumber: "555-123456",
    vatNumber: "SE555123456701",
    organizationName: "Example Company AB",
    customerName: "Customer AB",
    customerAddress: {
      street: "Example Street 42",
      postalCode: "123 45",
      postalTown: "Stockholm",
    },
    customerNumber: "100001",
    invoiceNumber: "20230001",
    invoiceDate: "2023-01-15",
    dueDate: "2023-02-15",
    paymentTerms: "30",
    items: [
      {
        productName: "Consulting Services",
        unit: "hours",
        quantity: 10,
        unitPrice: 1000,
        vatRate: "25",
      },
      {
        productName: "Web Development",
        unit: "hours",
        quantity: 8,
        unitPrice: 1200,
        vatRate: "25",
      },
    ],
  });
  const [logo, setLogo] = useState<any>(null);

  const theme = useTheme();

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
        setLogo(e.target.result);
        console.log("Logo uploaded");
      };
      reader.readAsDataURL(file);
      console.log(logo);
    }
  };

  const handleCreateInvoicePDF = async () => {
    if (!invoiceData.invoiceNumber) {
      alert("Fakturanummer är obligatoriskt.");
      return;
    }
    try {
      const doc = <InvoicePDF invoiceData={invoiceData} />; // Creates thr document element
      const asPdf = pdf(); // Initializes the PDF renderer
      asPdf.updateContainer(doc); // Passes the document element directly
      const blob = await asPdf.toBlob(); // Generates the blob
      const pdfUrl = URL.createObjectURL(blob); // Creates a URL for the blob
      window.open(pdfUrl, "_blank"); // Opens the PDF in a new tab
    } catch (error) {
      console.error("Failed to create invoice PDF", error);
    }
  };

  const calculateInvoiceTotals = (items: Item[]) => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + (item.quantity as number) * (item.unitPrice as number),
      0
    );
    const vatTotal = items.reduce(
      (acc, item) =>
        acc +
        (item.quantity as number) *
          (item.unitPrice as number) *
          (parseFloat(item.vatRate) / 100),
      0
    );
    const total = subtotal + vatTotal;
    const rounding = 0.25;
    const deduction = 7500.0;
    const amountToPay = total - deduction + rounding;

    return {
      subtotal: subtotal.toFixed(2),
      vatTotal: vatTotal.toFixed(2),
      rounding: rounding.toFixed(2),
      total: total.toFixed(2),
      deduction: deduction.toFixed(2),
      amountToPay: amountToPay.toFixed(2),
    };
  };

  const InvoicePDF = ({ invoiceData }: { invoiceData: InvoiceData }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo display logic */}
        <View
          style={{
            width: 150,
            height: 75,
            backgroundColor: logo ? "transparent" : "#FFFFFF",
          }}
        >
          {logo && <Image src={logo} style={{ width: 150, height: 75 }} />}
        </View>

        <Text style={styles.title}>{invoiceData.organizationName}</Text>

        <View style={styles.header}>
          <View style={styles.invoiceInfo}>
            <View
              style={{
                textAlign: "left",
                padding: 2,
                marginRight: 10,
                fontSize: 12,
                border: "1px solid black",
                width: "45%",
              }}
            >
              <Text>Faktura</Text>
            </View>
            <View
              style={{
                textAlign: "left",
                padding: 2,
                border: "1px solid black",
                width: "45%",
              }}
            >
              <Text>Datum: {invoiceData.invoiceDate}</Text>
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <View
              style={{
                textAlign: "left",
                padding: 2,
                border: "1px solid black",
                width: "45%",
              }}
            >
              <Text>Nummer: {invoiceData.invoiceNumber}</Text>
            </View>
            <View
              style={{
                textAlign: "left",
                padding: 2,
                border: "1px solid black",
                width: "45%",
                marginLeft: 10,
              }}
            >
              <Text>Förfallodatum: {invoiceData.dueDate}</Text>
            </View>
          </View>
          <View style={styles.customerInfo}>
            <Text>{invoiceData.customerName}</Text>
            <Text>{`${invoiceData.customerAddress.street}`} </Text>
            <Text>
              {""}
              {`${invoiceData.customerAddress.postalCode} ${invoiceData.customerAddress.postalTown}`}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Beskrivning</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Antal</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>À-pris</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Belopp</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Moms</Text>
            </View>
          </View>

          {invoiceData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.productName}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.unitPrice} SEK</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}{" "}
                  SEK
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.vatRate}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flexGrow: 1 }} />
        <View
          style={{
            fontSize: 12,
            top: 100,
          }}
        >
          <Text>Vänligen betala till bankgiro 1234-5678</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginRight: 10,
            alignItems: "flex-end",
          }}
        >
          <View style={{ flexDirection: "column", fontSize: 12, padding: 5 }}>
            {[
              {
                label: "Nettosumma:",
                value: calculateInvoiceTotals(invoiceData.items).subtotal,
              },
              {
                label: "Moms:",
                value: calculateInvoiceTotals(invoiceData.items).vatTotal,
              },
              {
                label: "Avrundning:",
                value: calculateInvoiceTotals(invoiceData.items).rounding,
              },
              {
                label: "Summa totalt:",
                value: calculateInvoiceTotals(invoiceData.items).total,
              },
              {
                label: "Rotavdrag:",
                value:
                  "-" + calculateInvoiceTotals(invoiceData.items).deduction,
              },
              {
                label: "Att betala:",
                value: calculateInvoiceTotals(invoiceData.items).amountToPay,
              },
            ].map((line, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Text style={{ minWidth: 100 }}>{line.label}</Text>{" "}
                <Text>{line.value} SEK</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>
            Org.nr: {invoiceData.organizationNumber} | Momsreg.nr:{" "}
            {invoiceData.vatNumber}
          </Text>
          <Text>Betalningsvillkor: {invoiceData.paymentTerms} dagar</Text>
        </View>
      </Page>
    </Document>
  );

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { productName: "", unit: "", quantity: "", unitPrice: "", vatRate: "" },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const fileInputRef = React.createRef<HTMLInputElement>();
  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: theme.spacing(2),
        marginLeft: "240px",
        marginTop: theme.spacing(2),
        overflow: "hidden",
        maxWidth: `calc(100vw - ${theme.spacing(30)})`,
        height: `calc(95vh - ${theme.spacing(4)})`,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Skapa Ny Faktura
      </Typography>
      <Box component="form" noValidate sx={{ height: "calc(100% - 48px)" }}>
        <Grid item xs={12} container spacing={2}>
          <Grid item xs={4} container direction="column" spacing={1}>
            <Grid item>
              <TextField
                label="Organisationsnamn"
                fullWidth
                value={invoiceData.organizationName}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    organizationName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Organisationsnummer"
                fullWidth
                value={invoiceData.organizationNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    organizationNumber: e.target.value,
                  })
                }
              />
            </Grid>

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
            </Grid>

            {logo && (
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
            )}
          </Grid>

          <Grid item xs={4} container direction="column" spacing={1}>
            <Grid item>
              <TextField
                label="Kundens namn"
                fullWidth
                value={invoiceData.customerName}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Kundadress"
                fullWidth
                value={invoiceData.customerAddress.street}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerAddress: {
                      ...invoiceData.customerAddress,
                      street: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Postnummer"
                fullWidth
                value={invoiceData.customerAddress.postalCode}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerAddress: {
                      ...invoiceData.customerAddress,
                      postalCode: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Postort"
                fullWidth
                value={invoiceData.customerAddress.postalTown}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerAddress: {
                      ...invoiceData.customerAddress,
                      postalTown: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Kundnummer"
                fullWidth
                value={invoiceData.customerNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    customerNumber: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>

          <Grid item xs={4} container direction="column" spacing={1}>
            <Grid item>
              <TextField
                label="Fakturanummer"
                fullWidth
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item>
              <TextField
                label="Fakturadatum"
                type="date"
                fullWidth
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Förfallodatum"
                type="date"
                fullWidth
                value={invoiceData.dueDate}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Momsregistreringsnummer"
                fullWidth
                value={invoiceData.vatNumber}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, vatNumber: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Box
          sx={{
            maxHeight: 150,
            overflowY: "auto",
            border: "1px solid grey",
            padding: 2,
            marginTop: 2,
          }}
        >
          {invoiceData.items.map((item, index) => (
            <Grid key={index} container spacing={2} alignItems="center">
              <Grid item xs={2}>
                <TextField
                  label="Beskrivning"
                  fullWidth
                  value={item.productName}
                  onChange={(e) => {
                    const newItems = [...invoiceData.items];
                    newItems[index].productName = e.target.value;
                    setInvoiceData({ ...invoiceData, items: newItems });
                  }}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  label="Enhet"
                  fullWidth
                  value={item.unit}
                  onChange={(e) => {
                    const newItems = [...invoiceData.items];
                    newItems[index].unit = e.target.value;
                    setInvoiceData({ ...invoiceData, items: newItems });
                  }}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  label="Antal"
                  fullWidth
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => {
                    const newItems = [...invoiceData.items];
                    newItems[index].quantity = e.target.value
                      ? parseInt(e.target.value)
                      : "";
                    setInvoiceData({ ...invoiceData, items: newItems });
                  }}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  label="Á-pris"
                  fullWidth
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(e) => {
                    const newItems = [...invoiceData.items];
                    newItems[index].unitPrice = e.target.value
                      ? parseFloat(e.target.value)
                      : "";
                    setInvoiceData({ ...invoiceData, items: newItems });
                  }}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  label="Belopp"
                  fullWidth
                  type="number"
                  value={(
                    (item.quantity || 0) * (item.unitPrice || 0)
                  ).toString()}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={1}>
                <TextField
                  select
                  label="Moms"
                  fullWidth
                  value={item.vatRate}
                  onChange={(e) => {
                    const newItems = [...invoiceData.items];
                    newItems[index].vatRate = e.target.value;
                    setInvoiceData({ ...invoiceData, items: newItems });
                  }}
                  SelectProps={{ native: true }}
                >
                  {["6%", "12%", "25%"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={1}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                >
                  Ta bort
                </Button>
              </Grid>
            </Grid>
          ))}
        </Box>
        <Button
          variant="contained"
          onClick={handleAddItem}
          sx={{ marginTop: 2 }}
        >
          Lägg till rad
        </Button>

        <Button
          variant="contained"
          onClick={handleCreateInvoicePDF}
          sx={{ marginTop: 3 }}
          style={{ left: "85%", top: "85%", position: "absolute" }}
        >
          Skapa faktura
        </Button>
      </Box>
    </Paper>
  );
};

export default InvoicePage;
