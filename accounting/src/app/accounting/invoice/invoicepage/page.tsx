"use client";

// InvoicePage.tsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@mui/material";

interface Item {
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: string;
}

const InvoicePage: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState({
    // ... other invoice data fields
    items: [
      { productName: "", unit: "", quantity: 0, unitPrice: 0, vatRate: "25" },
      // ... add more items as needed
    ],
  });

  const generatePDF = () => {
    const doc = new jsPDF();

    // Set up the columns and title
    const tableColumns = [
      "Product Name",
      "Unit",
      "Quantity",
      "Unit Price",
      "VAT Rate",
    ];
    const tableRows: string[][] = [];

    // Fill in the rows with the invoiceData items
    invoiceData.items.forEach((item: Item) => {
      const itemData = [
        item.productName,
        item.unit,
        item.quantity.toString(),
        item.unitPrice.toString(),
        `${item.vatRate}%`,
      ];
      tableRows.push(itemData);
    });

    // Add content to the PDF
    doc.text("Invoice", 14, 15);
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 20,
    });

    // Open PDF in a new window
    window.open(doc.output("bloburl"), "_blank");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generatePDF();
  };

  // ... rest of the component, including form inputs and JSX
  return (
    <div>
      {/* Your form and inputs go here */}
      <Button onClick={handleSubmit}>Generate Invoice</Button>
    </div>
  );
};

export default InvoicePage;
