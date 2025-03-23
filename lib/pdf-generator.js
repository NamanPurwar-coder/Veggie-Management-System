/**
 * PDF Generator Utility
 * Handles the generation of PDF reports for inventory, transactions, and expenses
 * Uses jsPDF and jsPDF-autotable for creating well-formatted PDF documents
 */
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"

/**
 * Generate a PDF report for inventory data
 * @param {Object} data - The report data including items, transactions, expenses, and summary
 * @param {Object} reportSettings - Settings for the report (company name, address, etc.)
 * @param {String} reportType - Type of report to generate ('inventory', 'transactions', 'expenses')
 * @returns {jsPDF} - The generated PDF document
 */
export function generatePDF(data, reportSettings, reportType = "inventory") {
  // Create a new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add report header with company information
  addReportHeader(doc, reportSettings, pageWidth)

  // Add report date and title
  const today = format(new Date(), "dd/MM/yyyy")
  doc.setFontSize(12)
  doc.text(`Date: ${today}`, 14, 40)

  let reportTitle = "Inventory Report"
  if (reportType === "transactions") {
    reportTitle = "Transaction Report"
  } else if (reportType === "expenses") {
    reportTitle = "Expense Report"
  }

  doc.setFontSize(16)
  doc.text(reportTitle, pageWidth / 2, 50, { align: "center" })

  // Add summary section
  addSummarySection(doc, data.summary, 60, pageWidth)

  // Add appropriate table based on report type
  const startY = 100
  if (reportType === "inventory") {
    addInventoryTable(doc, data.items, startY)
  } else if (reportType === "transactions") {
    addTransactionTable(doc, data.transactions, data.items, startY)
  } else if (reportType === "expenses") {
    addExpenseTable(doc, data.expenses, data.items, startY)
  }

  return doc
}

/**
 * Generate a PDF report for a specific vegetable
 * @param {Object} item - The vegetable item data
 * @param {Array} transactions - Transactions related to this vegetable
 * @param {Array} expenses - Expenses related to this vegetable
 * @param {Object} reportSettings - Settings for the report (company name, address, etc.)
 * @returns {jsPDF} - The generated PDF document
 */
export function generateVegetablePDF(item, transactions, expenses, reportSettings) {
  // Create a new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add report header with company information
  addReportHeader(doc, reportSettings, pageWidth)

  // Add report date and title
  const today = format(new Date(), "dd/MM/yyyy")
  doc.setFontSize(12)
  doc.text(`Date: ${today}`, 14, 40)

  doc.setFontSize(16)
  doc.text(`Vegetable Report: ${item.name}`, pageWidth / 2, 50, { align: "center" })

  // Add vegetable details
  doc.setFontSize(12)
  let y = 60
  doc.text(`Name: ${item.name}`, 14, y)
  y += 6
  doc.text(`Category: ${item.category}`, 14, y)
  y += 6
  doc.text(`Current Quantity: ${item.quantity} ${item.unit}`, 14, y)
  y += 6
  doc.text(`Price: ₹${item.price?.toFixed(2)}/${item.unit}`, 14, y)
  y += 6
  doc.text(`Supplier: ${item.supplier || "Not specified"}`, 14, y)
  y += 6
  doc.text(`Storage Location: ${item.godown || "Not specified"}`, 14, y)
  y += 6
  doc.text(`Bag Count: ${item.bagCount || "Not specified"}`, 14, y)
  y += 6
  doc.text(`Last Updated: ${item.lastUpdated}`, 14, y)
  y += 10

  // Add transaction table
  doc.setFontSize(14)
  doc.text("Transaction History", 14, y)
  y += 10

  if (transactions.length === 0) {
    doc.setFontSize(12)
    doc.text("No transactions found for this item.", 14, y)
    y += 10
  } else {
    doc.autoTable({
      startY: y,
      head: [["Date", "Type", "Quantity", "Price (₹)", "Total (₹)"]],
      body: transactions.map((t) => [
        t.date,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `${t.quantity} ${item.unit}`,
        `${t.price?.toFixed(2)}/${item.unit}`,
        t.totalAmount?.toFixed(2),
      ]),
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Add expense table
  doc.setFontSize(14)
  doc.text("Expense History", 14, y)
  y += 10

  if (expenses.length === 0) {
    doc.setFontSize(12)
    doc.text("No expenses found for this item.", 14, y)
  } else {
    doc.autoTable({
      startY: y,
      head: [["Date", "Description", "Amount (₹)"]],
      body: expenses.map((e) => [e.date, e.description, e.amount?.toFixed(2)]),
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80] },
    })
  }

  return doc
}

/**
 * Add the report header with company information
 * @param {jsPDF} doc - The PDF document
 * @param {Object} reportSettings - Company information for the header
 * @param {Number} pageWidth - Width of the PDF page
 */
function addReportHeader(doc, reportSettings, pageWidth) {
  doc.setFontSize(18)
  doc.text(reportSettings.companyName || "Vegetable Inventory Management", pageWidth / 2, 15, { align: "center" })

  doc.setFontSize(10)
  if (reportSettings.address) {
    doc.text(reportSettings.address, pageWidth / 2, 22, { align: "center" })
  }

  if (reportSettings.contact) {
    doc.text(reportSettings.contact, pageWidth / 2, 28, { align: "center" })
  }

  // Add a line separator
  doc.setLineWidth(0.5)
  doc.line(14, 32, pageWidth - 14, 32)
}

/**
 * Add the summary section to the PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Object} summary - Summary data to display
 * @param {Number} startY - Starting Y position
 * @param {Number} pageWidth - Width of the PDF page
 */
function addSummarySection(doc, summary, startY, pageWidth) {
  doc.setFontSize(14)
  doc.text("Summary", 14, startY)

  doc.setFontSize(12)
  let y = startY + 8

  // Create a 2x3 grid for summary information
  const col1X = 14
  const col2X = pageWidth / 2 + 10

  doc.text(`Total Items: ${summary.totalItems}`, col1X, y)
  doc.text(`Total Value: ₹${summary.totalValue.toFixed(2)}`, col2X, y)
  y += 8

  doc.text(`Total Purchases: ₹${summary.totalPurchases.toFixed(2)}`, col1X, y)
  doc.text(`Total Sales: ₹${summary.totalSales.toFixed(2)}`, col2X, y)
  y += 8

  doc.text(`Total Expenses: ₹${summary.totalExpenses.toFixed(2)}`, col1X, y)

  // Add profit/loss with color
  const profitText = `Profit/Loss: ₹${summary.profit.toFixed(2)}`
  if (summary.profit >= 0) {
    doc.setTextColor(0, 128, 0) // Green for profit
  } else {
    doc.setTextColor(255, 0, 0) // Red for loss
  }
  doc.text(profitText, col2X, y)
  doc.setTextColor(0, 0, 0) // Reset text color
}

/**
 * Add the inventory table to the PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Array} items - Inventory items to display
 * @param {Number} startY - Starting Y position
 */
function addInventoryTable(doc, items, startY) {
  doc.autoTable({
    startY: startY,
    head: [["Name", "Category", "Supplier", "Location", "Quantity", "Price (₹)", "Value (₹)"]],
    body: items.map((item) => [
      item.name,
      item.category.charAt(0).toUpperCase() + item.category.slice(1),
      item.supplier || "N/A",
      item.godown || "N/A",
      `${item.quantity} ${item.unit}`,
      `${item.price?.toFixed(2)}/${item.unit}`,
      (item.quantity * item.price).toFixed(2),
    ]),
    theme: "grid",
    headStyles: { fillColor: [76, 175, 80] },
  })
}

/**
 * Add the transaction table to the PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Array} transactions - Transactions to display
 * @param {Array} items - Inventory items for reference
 * @param {Number} startY - Starting Y position
 */
function addTransactionTable(doc, transactions, items, startY) {
  doc.autoTable({
    startY: startY,
    head: [["Date", "Item", "Type", "Quantity", "Price (₹)", "Total (₹)"]],
    body: transactions.map((t) => {
      const item = items.find((i) => i._id === t.itemId)
      return [
        t.date,
        item ? item.name : "Unknown Item",
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `${t.quantity} ${item ? item.unit : ""}`,
        `${t.price?.toFixed(2)}${item ? "/" + item.unit : ""}`,
        t.totalAmount?.toFixed(2),
      ]
    }),
    theme: "grid",
    headStyles: { fillColor: [76, 175, 80] },
  })
}

/**
 * Add the expense table to the PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Array} expenses - Expenses to display
 * @param {Array} items - Inventory items for reference
 * @param {Number} startY - Starting Y position
 */
function addExpenseTable(doc, expenses, items, startY) {
  doc.autoTable({
    startY: startY,
    head: [["Date", "Item", "Description", "Amount (₹)"]],
    body: expenses.map((e) => {
      const item = items.find((i) => i._id === e.itemId)
      return [e.date, item ? item.name : "Unknown Item", e.description, e.amount?.toFixed(2)]
    }),
    theme: "grid",
    headStyles: { fillColor: [76, 175, 80] },
  })
}

