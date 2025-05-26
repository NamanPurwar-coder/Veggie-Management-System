import { ReportData } from "@/types";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

export async function generatePDF(
  reportData: ReportData,
  startDate: string,
  endDate: string
) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add report header
    doc.setFontSize(24);
    doc.text("📊 Inventory Report", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, 25, { align: "center" });

    // Summary Section
    doc.setFontSize(14);
    doc.text("Summary", pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(12);
    let y = 45;
    const summary = reportData.summary;
    doc.text(`Total Value: ₹${summary.totalValue.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total Purchases: ₹${summary.totalPurchases.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total Sales: ₹${summary.totalSales.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Profit/Loss: ₹${summary.profit.toFixed(2)}`, 14, y);
    y += 15;

    // Inventory Table
    doc.setFontSize(14);
    doc.text("Inventory Items", pageWidth / 2, y, { align: "center" });
    y += 10;

    autoTable(doc,{
      startY: y,
      head: [["Name", "Category", "Quantity", "Price", "Value"]],
      body: reportData.items.map((item) => [
        item.name,
        item.category,
        `${item.quantity} ${item.unit}`,
        `₹${item.price.toFixed(2)}/${item.unit}`,
        `₹${(item.quantity * item.price).toFixed(2)}`,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto", halign: "right" },
      },
    });

    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : y + 10;

    // Transactions Table
    doc.setFontSize(14);
    doc.text("Transactions", pageWidth / 2, y, { align: "center" });
    y += 10;

    if (reportData.transactions.length === 0) {
      doc.setFontSize(12);
      doc.text("No transactions found in this period", pageWidth / 2, y, { align: "center" });
      y += 10;
    } else {
      doc.autoTable({
        startY: y,
        head: [["Date", "Item", "Type", "Quantity", "Price", "Total"]],
        body: reportData.transactions.map((transaction) => {
          const item = reportData.items.find((i) => i._id === transaction.itemId);
          return [
            transaction.date,
            item?.name || "Unknown Item",
            transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            `${transaction.quantity} ${item?.unit || "units"}`,
            `₹${transaction.price.toFixed(2)}/${item?.unit || "unit"}`,
            `₹${transaction.totalAmount.toFixed(2)}`,
          ];
        }),
        theme: "grid",
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
      });

      y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : y + 10;
    }

    // Expenses Table
    doc.setFontSize(14);
    doc.text("Expenses", pageWidth / 2, y, { align: "center" });
    y += 10;

    if (reportData.expenses.length === 0) {
      doc.setFontSize(12);
      doc.text("No expenses found in this period", pageWidth / 2, y, { align: "center" });
    } else {
      doc.autoTable({
        startY: y,
        head: [["Date", "Item", "Description", "Amount"]],
        body: reportData.expenses.map((expense) => {
          const item = reportData.items.find((i) => i._id === expense.itemId);
          return [
            expense.date,
            item?.name || "Unknown Item",
            expense.description,
            `₹${expense.amount.toFixed(2)}`,
          ];
        }),
        theme: "grid",
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
      });
    }

    // Add footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.text("Generated on: " + new Date().toLocaleString(), pageWidth / 2, footerY, {
      align: "center",
    });

    // Save the PDF
    doc.save(`inventory-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
