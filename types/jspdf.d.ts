import { jsPDF } from "jspdf"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      startY?: number
      head?: string[][]
      body?: string[][]
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
      }
      columnStyles?: {
        [key: number]: {
          cellWidth?: string
          halign?: 'left' | 'center' | 'right'
        }
      }
    }) => void
    lastAutoTable: {
      finalY: number
    }
  }
} 