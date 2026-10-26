import * as XLSX from 'xlsx';
import { SheetRowRecord } from '../types';

export function exportToExcel(records: SheetRowRecord[], fileNamePrefix = 'OCR_INV_คลังยา_รพ_สบปราบ') {
  const formattedRows = records.map((r, index) => ({
    'ลำดับ': index + 1,
    'Timestamp (A)': r.timestamp,
    'Invoice No (B)': r.invoiceNo,
    'Company Name (C)': r.companyName,
    'Tax ID (D)': r.taxId,
    'Invoice Date (E)': r.invoiceDate,
    'Salesperson (F)': r.salesperson,
    'GPU Code (G)': r.gpuCode,
    'TPU Code (H)': r.tpuCode,
    'Product Name (I)': r.productName,
    'Quantity (J)': r.quantity,
    'Unit Price (K)': r.unitPrice,
    'Total Price (L)': r.totalPrice,
    'Grand Total (M)': r.grandTotal,
    'Image URL (N)': r.imageUrl,
    'ชื่อยาสามัญ (O)': r.genericName,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 20 }, // Timestamp
    { wch: 16 }, // Invoice No
    { wch: 28 }, // Company Name
    { wch: 16 }, // Tax ID
    { wch: 12 }, // Invoice Date
    { wch: 18 }, // Salesperson
    { wch: 12 }, // GPU Code
    { wch: 12 }, // TPU Code
    { wch: 32 }, // Product Name
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit Price
    { wch: 14 }, // Total Price
    { wch: 14 }, // Grand Total
    { wch: 40 }, // Image URL
    { wch: 24 }, // ชื่อยาสามัญ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'บิล Invoice');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${todayStr}.xlsx`);
}

export function exportToCsv(records: SheetRowRecord[], fileNamePrefix = 'OCR_INV_คลังยา_รพ_สบปราบ') {
  const headers = [
    'Timestamp',
    'Invoice No',
    'Company Name',
    'Tax ID',
    'Invoice Date',
    'Salesperson',
    'GPU Code',
    'TPU Code',
    'Product Name',
    'Quantity',
    'Unit Price',
    'Total Price',
    'Grand Total',
    'Image URL',
    'ชื่อยาสามัญ'
  ];

  const csvRows = records.map(r => [
    `"${(r.timestamp || '').replace(/"/g, '""')}"`,
    `"${(r.invoiceNo || '').replace(/"/g, '""')}"`,
    `"${(r.companyName || '').replace(/"/g, '""')}"`,
    `"${(r.taxId || '').replace(/"/g, '""')}"`,
    `"${(r.invoiceDate || '').replace(/"/g, '""')}"`,
    `"${(r.salesperson || '').replace(/"/g, '""')}"`,
    `"${(r.gpuCode || '').replace(/"/g, '""')}"`,
    `"${(r.tpuCode || '').replace(/"/g, '""')}"`,
    `"${(r.productName || '').replace(/"/g, '""')}"`,
    r.quantity || 0,
    r.unitPrice || 0,
    r.totalPrice || 0,
    r.grandTotal || 0,
    `"${(r.imageUrl || '').replace(/"/g, '""')}"`,
    `"${(r.genericName || '').replace(/"/g, '""')}"`
  ].join(','));

  // Prepend UTF-8 BOM (\uFEFF) so Excel displays Thai characters properly without corrupting encoding
  const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson(data: any, fileNamePrefix = 'OCR_INV_คลังยา_รพ_สบปราบ_backup') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${todayStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
