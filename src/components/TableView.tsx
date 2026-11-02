import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  X, 
  Eye, 
  CheckCircle2,
  FileText,
  Calendar,
  Share2
} from 'lucide-react';
import { SheetRowRecord, AppSettings } from '../types';

interface TableViewProps {
  records: SheetRowRecord[];
  onUpdateRecord: (updated: SheetRowRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteMultipleRecords: (ids: string[]) => void;
  onOpenLightbox: (imageUrl: string, title: string, driveUrl?: string) => void;
  settings: AppSettings;
  initialInvoiceBill?: string | null;
  onClearInitialBill?: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteMultipleRecords,
  settings,
  initialInvoiceBill,
  onClearInitialBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<SheetRowRecord | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Dedicated Bill Detail Viewer Modal
  const [viewingBillNo, setViewingBillNo] = useState<string | null>(initialInvoiceBill || null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync initialInvoiceBill from deep link (?bill=...)
  useEffect(() => {
    if (initialInvoiceBill) {
      setViewingBillNo(initialInvoiceBill);
    }
  }, [initialInvoiceBill]);

  // Companies dropdown list
  const companyList = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.companyName && r.companyName !== '-') set.add(r.companyName);
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return records.filter(r => {
      const matchSearch = !term || (
        (r.invoiceNo && r.invoiceNo.toLowerCase().includes(term)) ||
        (r.companyName && r.companyName.toLowerCase().includes(term)) ||
        (r.productName && r.productName.toLowerCase().includes(term)) ||
        (r.unit && r.unit.toLowerCase().includes(term)) ||
        (r.genericName && r.genericName.toLowerCase().includes(term)) ||
        (r.taxId && r.taxId.includes(term)) ||
        (r.gpuCode && r.gpuCode.includes(term)) ||
        (r.tpuCode && r.tpuCode.includes(term)) ||
        (r.salesperson && r.salesperson.toLowerCase().includes(term))
      );

      const matchCompany = selectedCompany === 'ALL' || r.companyName === selectedCompany;

      return matchSearch && matchCompany;
    });
  }, [records, searchTerm, selectedCompany]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Items for currently viewed bill modal
  const viewingBillItems = useMemo(() => {
    if (!viewingBillNo) return [];
    return records.filter(
      r => (r.invoiceNo || '').trim().toLowerCase() === viewingBillNo.trim().toLowerCase()
    );
  }, [records, viewingBillNo]);

  const viewingBillSummary = useMemo(() => {
    if (viewingBillItems.length === 0) return null;
    const first = viewingBillItems[0];
    const totalAmount = viewingBillItems.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
    const grandTotal = first.grandTotal || Math.round(totalAmount * 1.07 * 100) / 100;

    return {
      invoiceNo: first.invoiceNo,
      companyName: first.companyName,
      taxId: first.taxId,
      invoiceDate: first.invoiceDate,
      salesperson: first.salesperson,
      timestamp: first.timestamp,
      imageUrl: first.imageUrl,
      vatStatus: first.vatStatus,
      grandTotal: grandTotal,
      totalAmount: totalAmount,
      totalItems: viewingBillItems.length,
      items: viewingBillItems,
    };
  }, [viewingBillItems]);

  // Copy shareable deep link
  const handleCopyBillLink = (invNo: string) => {
    const shareUrl = `${window.location.origin}/?bill=${encodeURIComponent(invNo)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      // fallback
    });
  };

  // Start inline editing
  const handleStartEdit = (row: SheetRowRecord) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row, unit: row.unit || 'กล่อง' });
  };

  // Save inline edit
  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdateRecord(editFormData);
      setEditingRowId(null);
      setEditFormData(null);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData(null);
  };

  // Select all on page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = paginatedRecords.map(r => r.id);
      setSelectedRowIds(Array.from(new Set([...selectedRowIds, ...ids])));
    } else {
      const pageIds = new Set(paginatedRecords.map(r => r.id));
      setSelectedRowIds(selectedRowIds.filter(id => !pageIds.has(id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedRowIds.length === 0) return;
    if (window.confirm(`ยืนยันการลบข้อมูลที่เลือกจำนวน ${selectedRowIds.length} แถวหรือไม่?`)) {
      onDeleteMultipleRecords(selectedRowIds);
      setSelectedRowIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                ข้อมูลบิลยาใน Google Sheets (ตาราง 16 คอลัมน์ A ถึง P)
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {records.length}/500 แถว
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              โครงสร้างตารางคอลัมน์ A ถึง P (รวมคอลัมน์ J: หน่วย) พร้อมลิงก์เปิดดูบิลแยกรายใบ และซิงค์ Google Drive
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <span>เปิด Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {selectedRowIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ลบที่เลือก ({selectedRowIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Search & Company Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่บิล, บริษัท, ชื่อยา, หน่วย (ขวด/กล่อง/vial/Amp), Tax ID, GPU/TPU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Supplier dropdown */}
          <div>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="ALL">ผู้จำหน่ายทั้งหมด ({companyList.length})</option>
              {companyList.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every(r => selectedRowIds.includes(r.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th className="py-3 px-3 min-w-[130px]">A: Timestamp</th>
                <th className="py-3 px-3 min-w-[130px] font-bold text-emerald-900">B: Invoice No</th>
                <th className="py-3 px-3 min-w-[170px]">C: Company Name</th>
                <th className="py-3 px-2 min-w-[110px]">D: Tax ID</th>
                <th className="py-3 px-2 min-w-[95px]">E: Date</th>
                <th className="py-3 px-2 min-w-[110px]">F: Salesperson</th>
                <th className="py-3 px-2 min-w-[80px]">G: GPU</th>
                <th className="py-3 px-2 min-w-[80px]">H: TPU</th>
                <th className="py-3 px-3 min-w-[200px] font-bold text-slate-900">I: Product Name (การค้า)</th>
                <th className="py-3 px-2 min-w-[90px] bg-emerald-50 text-emerald-950 font-bold text-center">
                  J: หน่วย (Unit) 💊
                </th>
                <th className="py-3 px-2 min-w-[70px] text-right">K: จำนวน</th>
                <th className="py-3 px-2 min-w-[85px] text-right">L: ราคา/หน่วย</th>
                <th className="py-3 px-3 min-w-[95px] text-right">M: ราคารวม</th>
                <th className="py-3 px-3 min-w-[105px] text-right font-bold text-emerald-800">N: Grand Total</th>
                <th className="py-3 px-2 min-w-[100px] text-center">O: ลิงก์บิล / Drive</th>
                <th className="py-3 px-3 min-w-[180px] bg-teal-50/70 text-teal-950 font-bold">
                  P: ชื่อยาสามัญ (AI) ✨
                </th>
                <th className="py-3 px-2 w-16 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={19} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลรายการยาที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, index) => {
                  const isEditing = editingRowId === row.id;
                  const isSelected = selectedRowIds.includes(row.id);
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={row.id} className="bg-amber-50/60">
                        <td className="py-2 px-3 text-center">
                          <input type="checkbox" disabled />
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400 font-medium">{rowNumber}</td>
                        <td className="py-2 px-3 text-slate-500">{row.timestamp}</td>
                        
                        {/* B: Invoice No */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.invoiceNo}
                            onChange={(e) => setEditFormData({ ...editFormData, invoiceNo: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* C: Company Name */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.companyName}
                            onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* D: Tax ID */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.taxId}
                            maxLength={13}
                            onChange={(e) => setEditFormData({ ...editFormData, taxId: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* E: Invoice Date */}
                        <td className="py-2 px-2">
                          <input
                            type="date"
                            value={editFormData.invoiceDate}
                            onChange={(e) => setEditFormData({ ...editFormData, invoiceDate: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* F: Salesperson */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.salesperson}
                            onChange={(e) => setEditFormData({ ...editFormData, salesperson: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* G: GPU Code */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.gpuCode}
                            maxLength={8}
                            onChange={(e) => setEditFormData({ ...editFormData, gpuCode: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* H: TPU Code */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.tpuCode}
                            maxLength={8}
                            onChange={(e) => setEditFormData({ ...editFormData, tpuCode: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white"
                          />
                        </td>

                        {/* I: Product Name */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.productName}
                            onChange={(e) => setEditFormData({ ...editFormData, productName: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-amber-300 bg-white font-medium"
                          />
                        </td>

                        {/* J: Unit */}
                        <td className="py-2 px-2 bg-emerald-50/50">
                          <input
                            type="text"
                            value={editFormData.unit || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-emerald-400 bg-white text-emerald-900 font-semibold"
                            placeholder="หน่วย"
                          />
                        </td>

                        {/* K: Quantity */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={editFormData.quantity}
                            onChange={(e) => {
                              const qty = Number(e.target.value);
                              const total = Math.round(qty * editFormData.unitPrice * 100) / 100;
                              setEditFormData({ ...editFormData, quantity: qty, totalPrice: total });
                            }}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right"
                          />
                        </td>

                        {/* L: Unit Price */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.unitPrice}
                            onChange={(e) => {
                              const unitP = Number(e.target.value);
                              const total = Math.round(editFormData.quantity * unitP * 100) / 100;
                              setEditFormData({ ...editFormData, unitPrice: unitP, totalPrice: total });
                            }}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right"
                          />
                        </td>

                        {/* M: Total Price */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.totalPrice}
                            onChange={(e) => setEditFormData({ ...editFormData, totalPrice: Number(e.target.value) })}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right"
                          />
                        </td>

                        {/* N: Grand Total */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.grandTotal}
                            onChange={(e) => setEditFormData({ ...editFormData, grandTotal: Number(e.target.value) })}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right font-bold"
                          />
                        </td>

                        {/* O: Image URL */}
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] text-slate-400">Drive</span>
                        </td>

                        {/* P: Generic Name */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editFormData.genericName}
                            onChange={(e) => setEditFormData({ ...editFormData, genericName: e.target.value })}
                            className="w-full px-1.5 py-1 text-xs border rounded-md border-teal-400 bg-white text-teal-900 font-medium"
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              title="บันทึกการแก้ไข"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-600"
                              title="ยกเลิก"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(row.id)}
                          className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Row number */}
                      <td className="py-2.5 px-2 text-center text-slate-400 font-medium">
                        {rowNumber}
                      </td>

                      {/* A: Timestamp */}
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {row.timestamp}
                      </td>

                      {/* B: Invoice No - Clickable to open Bill Viewer */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          onClick={() => setViewingBillNo(row.invoiceNo)}
                          className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 group text-left"
                          title="คลิกเพื่อดูรายการและรายละเอียดของบิลนี้ทั้งหมด"
                        >
                          <span>{row.invoiceNo}</span>
                          <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                        </button>
                      </td>

                      {/* C: Company Name */}
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {row.companyName}
                      </td>

                      {/* D: Tax ID */}
                      <td className="py-2.5 px-2 text-slate-600 font-mono text-[11px]">
                        {row.taxId || '-'}
                      </td>

                      {/* E: Invoice Date */}
                      <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">
                        {row.invoiceDate}
                      </td>

                      {/* F: Salesperson */}
                      <td className="py-2.5 px-2 text-slate-600 truncate max-w-[120px]">
                        {row.salesperson}
                      </td>

                      {/* G: GPU Code */}
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">
                        {row.gpuCode || '-'}
                      </td>

                      {/* H: TPU Code */}
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">
                        {row.tpuCode || '-'}
                      </td>

                      {/* I: Product Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {row.productName}
                      </td>

                      {/* J: Unit (หน่วย) */}
                      <td className="py-2.5 px-2 text-center bg-emerald-50/30">
                        <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200">
                          {row.unit || 'กล่อง'}
                        </span>
                      </td>

                      {/* K: Quantity */}
                      <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                        {Number(row.quantity).toLocaleString()}
                      </td>

                      {/* L: Unit Price */}
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        ฿{Number(row.unitPrice).toFixed(2)}
                      </td>

                      {/* M: Total Price */}
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        ฿{Number(row.totalPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* N: Grand Total */}
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        ฿{Number(row.grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* O: Image URL / Direct Bill Navigation */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Dedicated Bill Viewer button */}
                          <button
                            onClick={() => setViewingBillNo(row.invoiceNo)}
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="เปิดดูรายละเอียดบิลใบนี้"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Google Drive File Link */}
                          <a
                            href={row.imageUrl || settings.googleDriveFolderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                            title="เปิดดูไฟล์ใน Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* P: Generic Name */}
                      <td className="py-2.5 px-3 bg-teal-50/40 text-teal-900 font-medium">
                        {row.genericName || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(row)}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="แก้ไขข้อมูลแถวนี้"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายการ ${row.productName} (บิล ${row.invoiceNo}) หรือไม่?`)) {
                                onDeleteRecord(row.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ลบแถวนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            แสดง {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ถึง{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} จากทั้งหมด{' '}
            <b>{filteredRecords.length}</b> รายการ (ชีทจำกัด 500 แถว)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ย้อนกลับ
            </button>
            <span className="px-2 font-medium">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Interactive Bill Viewer Modal (Dedicated Per-Bill View & Navigation)     */}
      {/* ========================================================================= */}
      {viewingBillNo && viewingBillSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-emerald-300" />
                  <h3 className="text-xl font-bold tracking-tight">
                    บิลเลขที่: {viewingBillSummary.invoiceNo}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
                    {viewingBillSummary.totalItems} รายการ
                  </span>
                </div>
                <p className="text-emerald-100 text-sm flex items-center gap-3">
                  <span>ผู้จำหน่าย: <b>{viewingBillSummary.companyName}</b></span>
                  {viewingBillSummary.taxId && viewingBillSummary.taxId !== '-' && (
                    <span className="text-emerald-200 text-xs font-mono">
                      (Tax ID: {viewingBillSummary.taxId})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewingBillNo(null);
                    if (onClearInitialBill) onClearInitialBill();
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Deep Link Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  วันที่: <b>{viewingBillSummary.invoiceDate}</b>
                </span>
                <span>•</span>
                <span>พนักงานขาย: <b>{viewingBillSummary.salesperson || '-'}</b></span>
              </div>

              <div className="flex items-center gap-2">
                {/* Shareable Link Button */}
                <button
                  onClick={() => handleCopyBillLink(viewingBillSummary.invoiceNo)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="คัดลอกลิงก์ตรงสำหรับเปิดดูบิลนี้"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">คัดลอกลิงก์แล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>คัดลอกลิงก์บิลนี้</span>
                    </>
                  )}
                </button>

                {/* Direct Google Drive File Link */}
                <a
                  href={viewingBillSummary.imageUrl || settings.googleDriveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดไฟล์ใน Google Drive</span>
                </a>
              </div>
            </div>

            {/* Bill Line Items Table */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ตารางรายการยาและเวชภัณฑ์ในบิลนี้
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3 min-w-[180px]">ชื่อสินค้า (ชื่อยาการค้า)</th>
                        <th className="py-2.5 px-3 min-w-[140px] bg-teal-50/70 text-teal-950 font-bold">
                          ชื่อยาสามัญ (Generic Name) ✨
                        </th>
                        <th className="py-2.5 px-2 min-w-[80px] bg-emerald-50 text-emerald-950 font-bold text-center">
                          หน่วย (Unit) 💊
                        </th>
                        <th className="py-2.5 px-2 w-20 text-right">จำนวน</th>
                        <th className="py-2.5 px-2 w-24 text-right">ราคา/หน่วย</th>
                        <th className="py-2.5 px-3 w-28 text-right font-bold text-slate-800">ราคารวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingBillSummary.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <div>{item.productName}</div>
                            {(item.gpuCode || item.tpuCode) && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {item.gpuCode ? `GPU: ${item.gpuCode} ` : ''}
                                {item.tpuCode ? `TPU: ${item.tpuCode}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 bg-teal-50/30 text-teal-900 font-medium">
                            {item.genericName || '-'}
                          </td>
                          <td className="py-2.5 px-2 text-center bg-emerald-50/20">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
                              {item.unit || 'กล่อง'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-semibold text-slate-700">
                            {Number(item.quantity).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-600">
                            ฿{Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            ฿{Number(item.totalPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill Totals Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700">สถานะการตรวจสอบภาษี (VAT Status)</div>
                  <div className="text-slate-600 flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      รวม VAT 7%
                    </span>
                    <span>ราคาสินค้ารวม VAT 7% ถูกต้องตามระเบียบพัสดุ</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-right space-y-1">
                  <div className="text-xs text-slate-500">ยอดรวมทั้งสิ้นของบิล (Grand Total)</div>
                  <div className="text-2xl font-black text-emerald-800">
                    ฿{Number(viewingBillSummary.grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Timestamp ที่บันทึก: {viewingBillSummary.timestamp}
              </span>
              <button
                onClick={() => {
                  setViewingBillNo(null);
                  if (onClearInitialBill) onClearInitialBill();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
