import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  X, 
  Download, 
  RefreshCw, 
  Database,
  ArrowUpDown,
  Building,
  Calendar,
  Eye,
  Plus
} from 'lucide-react';
import { SheetRowRecord, AppSettings } from '../types';

interface TableViewProps {
  records: SheetRowRecord[];
  onUpdateRecord: (updated: SheetRowRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteMultipleRecords: (ids: string[]) => void;
  onOpenLightbox: (imageUrl: string, title: string, driveUrl?: string) => void;
  settings: AppSettings;
}

export const TableView: React.FC<TableViewProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteMultipleRecords,
  onOpenLightbox,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<SheetRowRecord | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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

  // Start inline editing
  const handleStartEdit = (row: SheetRowRecord) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
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
                ข้อมูลบิลยาใน Google Sheets (ตาราง 15 คอลัมน์)
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {records.length}/500 แถว
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              โครงสร้างตารางคอลัมน์ A ถึง O ตามที่กำหนดในชีท "บิล Invoice" สามารถค้นหาและแก้ไขข้อความที่ผิดพลาดได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <span>เปิดชีทจริง</span>
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
              placeholder="ค้นหาเลขที่บิล, ชื่อบริษัท, ชื่อยาการค้า, ชื่อยาสามัญ, Tax ID, รหัส GPU/TPU..."
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
                <th className="py-3 px-3 min-w-[120px] font-bold text-emerald-900">B: Invoice No</th>
                <th className="py-3 px-3 min-w-[180px]">C: Company Name</th>
                <th className="py-3 px-2 min-w-[110px]">D: Tax ID</th>
                <th className="py-3 px-2 min-w-[95px]">E: Date</th>
                <th className="py-3 px-2 min-w-[110px]">F: Salesperson</th>
                <th className="py-3 px-2 min-w-[80px]">G: GPU</th>
                <th className="py-3 px-2 min-w-[80px]">H: TPU</th>
                <th className="py-3 px-3 min-w-[200px] font-bold text-slate-900">I: Product Name (การค้า)</th>
                <th className="py-3 px-2 min-w-[70px] text-right">J: จำนวน</th>
                <th className="py-3 px-2 min-w-[85px] text-right">K: ราคา/หน่วย</th>
                <th className="py-3 px-3 min-w-[95px] text-right">L: ราคารวม</th>
                <th className="py-3 px-3 min-w-[100px] text-right font-bold text-emerald-800">M: Grand Total</th>
                <th className="py-3 px-2 min-w-[80px] text-center">N: Image</th>
                <th className="py-3 px-3 min-w-[180px] bg-teal-50/70 text-teal-950 font-bold">
                  O: ชื่อยาสามัญ (AI) ✨
                </th>
                <th className="py-3 px-2 w-16 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
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

                        {/* J: Quantity */}
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

                        {/* K: Unit Price */}
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

                        {/* L: Total Price */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.totalPrice}
                            onChange={(e) => setEditFormData({ ...editFormData, totalPrice: Number(e.target.value) })}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right"
                          />
                        </td>

                        {/* M: Grand Total */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.grandTotal}
                            onChange={(e) => setEditFormData({ ...editFormData, grandTotal: Number(e.target.value) })}
                            className="w-full px-1 py-1 text-xs border rounded-md border-amber-300 bg-white text-right font-bold"
                          />
                        </td>

                        {/* N: Image URL */}
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] text-slate-400">Drive</span>
                        </td>

                        {/* O: Generic Name */}
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

                      {/* B: Invoice No */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.invoiceNo}
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

                      {/* J: Quantity */}
                      <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                        {Number(row.quantity).toLocaleString()}
                      </td>

                      {/* K: Unit Price */}
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        ฿{Number(row.unitPrice).toFixed(2)}
                      </td>

                      {/* L: Total Price */}
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        ฿{Number(row.totalPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* M: Grand Total */}
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        ฿{Number(row.grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* N: Image URL */}
                      <td className="py-2.5 px-2 text-center">
                        <a
                          href={row.imageUrl || settings.googleDriveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                          title="เปิดรูปใน Google Drive"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </td>

                      {/* O: Generic Name */}
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
    </div>
  );
};
