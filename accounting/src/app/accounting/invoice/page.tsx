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
import DeleteIcon from "@mui/icons-material/Delete";
import { Item, InvoiceData } from "@/app/helpers/interfaces";
import { NAVBAR_WIDTH } from "@/app/helpers/layoutConstants";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
    organizationName: "Schnauzer AB",
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
        productName: "Konsultarbete",
        unit: "timmar",
        quantity: 10,
        unitPrice: 1000,
        vatRate: "25%",
      },
      {
        productName: "Webutveckling",
        unit: "timmar",
        quantity: 8,
        unitPrice: 1200,
        vatRate: "25%",
      },
    ],
  });
  const [logo, setLogo] = useState<any>(null);
  const [additionalText, setAdditionalText] = useState("");
  const inputFieldWidth = "50%";
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

  const handleCreateInvoicePDF = async () => {
    if (!invoiceData.invoiceNumber) {
      alert("Fakturanummer är obligatoriskt.");
      return;
    }

    const completeItems = invoiceData.items.filter(isItemComplete);

    try {
      const doc = (
        <InvoicePDF invoiceData={{ ...invoiceData, items: completeItems }} />
      );
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");
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
    const amountToPay = total;

    return {
      subtotal: subtotal.toFixed(2),
      vatTotal: vatTotal.toFixed(2),
      total: total.toFixed(2),
      amountToPay: amountToPay.toFixed(2),
    };
  };

  const InvoicePDF = ({ invoiceData }: { invoiceData: InvoiceData }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo display logic */}
        <View
          style={{
            maxWidth: 300,
            maxHeight: 150,
            backgroundColor: logo ? "transparent" : "#FFFFFF",
          }}
        >
          {logo ? (
            <Image src={logo} style={{ maxWidth: 200, maxHeight: 100 }} />
          ) : (
            <View
              style={{ width: 150, height: 75, backgroundColor: "#FFFFFF" }}
            />
          )}
        </View>

        <Text style={styles.title}>{invoiceData.organizationName}</Text>
        <View
          style={{
            maxWidth: "40%",
            maxHeight: "18vh%",
            marginTop: "10mm",
            marginBottom: "-52mm",
            padding: "5mm",
            borderWidth: 1,
            borderColor: "#000",
            borderStyle: "solid",
          }}
        >
          <Text style={{ fontSize: 9, overflow: "hidden" }}>
            {additionalText}
          </Text>
        </View>

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
                <Text style={styles.tableCell}>{item.vatRate}</Text>
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
                label: "Summa totalt:",
                value: calculateInvoiceTotals(invoiceData.items).total,
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
        { productName: "", unit: "", quantity: 0, unitPrice: 0, vatRate: "" },
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

  const isItemComplete = (item: Item) => {
    return (
      item.productName &&
      item.unit &&
      item.quantity &&
      item.unitPrice &&
      item.vatRate
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: theme.spacing(2),
        marginLeft: NAVBAR_WIDTH,
        marginTop: theme.spacing(2),
        maxWidth: `calc(100vw - ${NAVBAR_WIDTH})`,
        height: `auto`,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Skapa Ny Faktura
      </Typography>
      <Box component="form" noValidate sx={{ height: "calc(100% - 48px)" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} container direction="column" spacing={1}>
            {/* Organization Name */}
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
                sx={{ maxWidth: "100%" }}
              />
            </Grid>
            {/* Organization Number */}
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
                sx={{ maxWidth: "100%" }}
              />
            </Grid>
            {/* VAT Number */}
            <Grid item>
              <TextField
                label="Momsregistreringsnummer"
                fullWidth
                value={invoiceData.vatNumber}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, vatNumber: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: "100%" }}
              />
            </Grid>
            {/* Logo Upload */}
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

            {/* Display Uploaded Logo */}
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
                    fontSize: "1em", // You can adjust the font size to your preference
                  }}
                >
                  <span>Ingen logotyp uppladdad</span>{" "}
                  {/* This text is optional */}
                </div>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Ytterligare text"
                fullWidth
                multiline // Enables multiline input
                rows={4} // Sets the number of lines
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                sx={{
                  maxWidth: "100%",
                  "& .MuiInputBase-root": {
                    height: "auto",
                  },
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} container direction="column" spacing={1}>
            {/* Invoice Number */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
            {/* Invoice Date */}
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
                sx={{ maxWidth: inputFieldWidth }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Due Date */}
            <Grid item>
              <TextField
                label="Förfallodatum"
                type="date"
                fullWidth
                value={invoiceData.dueDate}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, dueDate: e.target.value })
                }
                sx={{ maxWidth: inputFieldWidth }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Customer Info */}
          <Grid item xs={12} md={4} container direction="column" spacing={1}>
            {/* Customer Name */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
            {/* Customer Address */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
            {/* Customer Postal Code */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
            {/* Customer Postal Town */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
            {/* Customer Number */}
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
                sx={{ maxWidth: inputFieldWidth }}
              />
            </Grid>
          </Grid>
          {/* Invoice Items */}
          <Box
            sx={{
              border: "1px solid grey",
              padding: 2,
              marginTop: 2,
              minWidth: "80vw",
            }}
          >
            {invoiceData.items.map((item, index) => (
              <Grid key={index} container spacing={2} alignItems="center">
                {/* Item Description */}
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
                {/* Item Unit */}
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
                {/* Item Quantity */}
                <Grid item xs={2}>
                  <TextField
                    label="Antal"
                    fullWidth
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      newItems[index].quantity =
                        parseFloat(e.target.value) || 0;
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </Grid>
                {/* Item Unit Price */}
                <Grid item xs={2}>
                  <TextField
                    label="Á-pris"
                    fullWidth
                    type="number"
                    value={item.unitPrice.toString()}
                    onChange={(e) => {
                      const newItems = [...invoiceData.items];
                      newItems[index].unitPrice =
                        parseFloat(e.target.value) || 0;
                      setInvoiceData({ ...invoiceData, items: newItems });
                    }}
                  />
                </Grid>
                {/* Item Amount */}
                <Grid item xs={2}>
                  <TextField
                    label="Belopp"
                    fullWidth
                    type="number"
                    value={(
                      (item.quantity || 0) * (item.unitPrice || 0)
                    ).toFixed(2)}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                {/* Item VAT Rate */}
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
                    InputLabelProps={{ shrink: true }}
                  >
                    {["0%", "6%", "12%", "25%"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                {/* Remove Item Button */}
                <Grid item xs={1}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <DeleteIcon />
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Box>
          {/* Add Item Button */}
          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{ marginTop: 2 }}
          >
            Lägg till rad
          </Button>
          {/* Create Invoice Button */}
          <Button
            variant="contained"
            onClick={handleCreateInvoicePDF}
            sx={{ marginTop: 3 }}
            style={{ position: "relative", left: "67vw", bottom: "10px" }}
          >
            Skapa faktura
          </Button>
        </Grid>
      </Box>
    </Paper>
  );
};

export default InvoicePage;
