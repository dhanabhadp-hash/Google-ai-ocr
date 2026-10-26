export interface InvoiceItem {
  id: string;
  gpuCode: string; // รหัส GPU (5-8 หลัก)
  tpuCode: string; // รหัส TPU (5-8 หลัก)
  productName: string; // ชื่อสินค้า (ชื่อยาการค้า)
  genericName: string; // ชื่อยาสามัญ (AI วิเคราะห์)
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type VatStatus = 'INCLUDED_7_PERCENT' | 'EXCLUDED_BEFORE_VAT' | 'ZERO_OR_EXEMPT' | 'MISMATCH';

export interface VatAnalysis {
  status: VatStatus;
  rate: number;
  note: string;
  isCompliant: boolean;
}

export interface ExtractedInvoice {
  id: string;
  fileId?: string;
  fileName: string;
  fileDataUrl?: string; // Base64 thumbnail/preview
  fileType: string;
  invoiceNo: string;
  companyName: string;
  taxId: string;
  invoiceDate: string;
  salesperson: string;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  vatAnalysis: VatAnalysis;
  items: InvoiceItem[];
  rawNotes?: string;
  authNotice?: string;
  driveUrl?: string;
  status: 'PENDING_REVIEW' | 'SAVED' | 'ERROR';
  savedTimestamp?: string;
}

// Exactly matches Columns A-O of the Google Sheet "บิล Invoice"
export interface SheetRowRecord {
  id: string; // Internal unique row ID
  timestamp: string;      // A: Timestamp เวลาที่บันทึก
  invoiceNo: string;      // B: Invoice No เลขที่บิล
  companyName: string;    // C: Company Name ชื่อบริษัท/ร้านค้า
  taxId: string;          // D: Tax ID เลขประจำตัวผู้เสียภาษี (13 หลัก)
  invoiceDate: string;    // E: Invoice Date วันที่ในบิล
  salesperson: string;    // F: Salesperson พนักงานขาย
  gpuCode: string;        // G: GPU Code รหัส GPU (5-8 หลัก)
  tpuCode: string;        // H: TPU Code รหัส TPU (5-8 หลัก)
  productName: string;    // I: Product Name ชื่อสินค้า(ชื่อยาการค้า)
  quantity: number;       // J: Quantity จำนวน
  unitPrice: number;      // K: Unit Price ราคาต่อหน่วย
  totalPrice: number;     // L: Total Price ราคารวม
  grandTotal: number;     // M: Grand Total ยอดรวมทั้งบิล
  imageUrl: string;       // N: Image URL ลิงก์รูปภาพบน Google Drive
  genericName: string;    // O: ชื่อยาสามัญ (AI วิเคราะห์)
  // Additional frontend metadata
  thumbnailUrl?: string;
  vatStatus?: VatStatus;
}

export interface UploadBatchRecord {
  id: string;
  timestamp: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  invoiceNo: string;
  companyName: string;
  itemCount: number;
  grandTotal: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  driveUrl?: string;
  thumbnailUrl?: string;
}

export interface AppSettings {
  googleSheetId: string;
  sheetName: string;
  googleDriveFolderId: string;
  googleDriveFolderUrl: string;
  gasWebAppUrl: string;
  lineChannelAccessToken: string;
  lineDestinationUserId: string;
  enableLineNotify: boolean;
  maxSheetRows: number;
}
