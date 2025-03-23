/**
 * PDF Generator Utility
 * Handles the generation of PDF reports for inventory, transactions, and expenses
 * Uses jsPDF and jsPDF-autotable for creating well-formatted PDF documents
 */
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"

// Add type declarations for jsPDF autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      startY: number
      head: string[][]
      body: string[][]
      theme?: string
      headStyles?: {
        fillColor?: number[]
        textColor?: number[]
        fontSize?: number
        fontStyle?: string
      }
      styles?: {
        fontSize?: number
        cellPadding?: number
        cellWidth?: string
      }
      columnStyles?: {
        [key: string]: {
          cellWidth?: string
          halign?: string
        }
      }
    }) => void
    lastAutoTable: {
      finalY: number
    }
  }
}

interface Item {
  _id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  supplier: string
  godown: string
  bagCount: number
  lastUpdated: string
}

interface Transaction {
  _id: string
  type: string
  quantity: number
  price: number
  totalAmount: number
  date: string
  description: string
}

interface Expense {
  _id: string
  description: string
  amount: number
  date: string
}

interface ReportSettings {
  companyName: string
  address: string
  contact: string
}

/**
 * Generate a PDF report for a specific vegetable
 * @param item - The vegetable item data
 * @param transactions - Transactions related to this vegetable
 * @param expenses - Expenses related to this vegetable
 * @param reportSettings - Settings for the report (company name, address, etc.)
 * @returns The generated PDF document
 */
export function generateVegetablePDF(item: Item, transactions: Transaction[], expenses: Expense[], reportSettings: ReportSettings): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Add report header with company information
  addReportHeader(doc, reportSettings, pageWidth)

  // Add report date and title
  const today = format(new Date(), "dd/MM/yyyy")
  doc.setFontSize(12)
  doc.text(`Date: ${today}`, 14, 40)

  // Add company logo or icon
  doc.setFontSize(20)
  doc.text("🥔", pageWidth / 2, 45, { align: "center" })
  
  doc.setFontSize(16)
  doc.text(`Vegetable Report: ${item.name || 'Unnamed Item'}`, pageWidth / 2, 55, { align: "center" })

  // Add vegetable details in a grid layout
  doc.setFontSize(12)
  let y = 65
  const col1X = 14
  const col2X = pageWidth / 2 + 10

  // Left column
  doc.text(`Name: ${item.name || 'Not specified'}`, col1X, y)
  doc.text(`Category: ${item.category || 'Not specified'}`, col1X, y + 6)
  doc.text(`Current Quantity: ${item.quantity || 0} ${item.unit || 'units'}`, col1X, y + 12)
  doc.text(`Price: ₹${(item.price || 0).toFixed(2)}/${item.unit || 'unit'}`, col1X, y + 18)

  // Right column
  doc.text(`Supplier: ${item.supplier || "Not specified"}`, col2X, y)
  doc.text(`Storage Location: ${item.godown || "Not specified"}`, col2X, y + 6)
  doc.text(`Bag Count: ${item.bagCount || "Not specified"}`, col2X, y + 12)
  doc.text(`Last Updated: ${item.lastUpdated || 'Not available'}`, col2X, y + 18)

  y += 30

  // Add transaction table with improved styling
  doc.setFontSize(14)
  doc.text("Transaction History", pageWidth / 2, y, { align: "center" })
  y += 10

  if (!transactions || transactions.length === 0) {
    doc.setFontSize(12)
    doc.text("No transactions found for this item.", pageWidth / 2, y, { align: "center" })
    y += 10
  } else {
    doc.autoTable({
      startY: y,
      head: [["Date", "Type", "Quantity", "Price (₹)", "Total (₹)"]],
      body: transactions.map((t) => [
        t.date || 'N/A',
        (t.type || 'Unknown').charAt(0).toUpperCase() + (t.type || 'Unknown').slice(1),
        `${t.quantity || 0} ${item.unit || 'units'}`,
        `${(t.price || 0).toFixed(2)}/${item.unit || 'unit'}`,
        (t.totalAmount || 0).toFixed(2),
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Date
        1: { cellWidth: 'auto' }, // Type
        2: { cellWidth: 'auto' }, // Quantity
        3: { cellWidth: 'auto' }, // Price
        4: { cellWidth: 'auto', halign: 'right' }, // Total
      },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Add expense table with improved styling
  doc.setFontSize(14)
  doc.text("Expense History", pageWidth / 2, y, { align: "center" })
  y += 10

  if (!expenses || expenses.length === 0) {
    doc.setFontSize(12)
    doc.text("No expenses found for this item.", pageWidth / 2, y, { align: "center" })
  } else {
    doc.autoTable({
      startY: y,
      head: [["Date", "Description", "Amount (₹)"]],
      body: expenses.map((e) => [
        e.date || 'N/A',
        e.description || 'No description',
        (e.amount || 0).toFixed(2),
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Date
        1: { cellWidth: 'auto' }, // Description
        2: { cellWidth: 'auto', halign: 'right' }, // Amount
      },
    })
  }

  // Add footer with contact information
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.text("For any queries, please contact:", pageWidth / 2, footerY, { align: "center" })
  doc.text(reportSettings.contact || "Contact information not available", pageWidth / 2, footerY + 4, { align: "center" })
  doc.text(reportSettings.address || "Address not available", pageWidth / 2, footerY + 8, { align: "center" })

  return doc
}

/**
 * Add the report header with company information
 */
function addReportHeader(doc: jsPDF, reportSettings: ReportSettings, pageWidth: number): void {
  // Add company logo or icon
  doc.setFontSize(24)
  doc.text("🥔", pageWidth / 2, 15, { align: "center" })

  doc.setFontSize(18)
  doc.text(reportSettings.companyName || "Vegetable Inventory Management", pageWidth / 2, 25, { align: "center" })

  doc.setFontSize(10)
  if (reportSettings.address) {
    doc.text(reportSettings.address, pageWidth / 2, 32, { align: "center" })
  }

  if (reportSettings.contact) {
    doc.text(reportSettings.contact, pageWidth / 2, 38, { align: "center" })
  }

  // Add a line separator
  doc.setLineWidth(0.5)
  doc.line(14, 42, pageWidth - 14, 42)
} 