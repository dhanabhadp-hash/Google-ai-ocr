import React, { useRef } from 'react';
import { X, Download, FileSpreadsheet, FileCode, FileText, UploadCloud, Database } from 'lucide-react';
import { SheetRowRecord } from '../types';
import { exportToExcel, exportToCsv, exportToJson } from '../utils/exportUtils';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SheetRowRecord[];
  onImportRecords: (records: SheetRowRecord[]) => void;
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  records,
  onImportRecords,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportToExcel(records);
  };

  const handleExportCsv = () => {
    exportToCsv(records);
  };

  const handleExportJson = () => {
    exportToJson({
      appName: 'OCR INV. คลังยา รพ.สบปราบ',
      exportTimestamp: new Date().toISOString(),
      rowCount: records.length,
      records: records,
    });
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const imported = Array.isArray(parsed) ? parsed : (parsed.records || []);

        if (Array.isArray(imported) && imported.length > 0) {
          if (window.confirm(`พบข้อมูลจำนวน ${imported.length} แถว คุณต้องการกู้คืนข้อมูลเข้าสู่ระบบหรือไม่?`)) {
            onImportRecords(imported);
            alert(`นำเข้าข้อมูล ${imported.length} แถวสำเร็จ!`);
            onClose();
          }
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้องหรือไม่พบรายการข้อมูล');
        }
      } catch (err: any) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ส่งออกข้อมูล & สำรองฐานข้อมูล (Backup)
              </h3>
              <p className="text-xs text-slate-500">
                ข้อมูลปัจจุบันมีทั้งหมด <b>{records.length} แถว</b> (จำกัด 500 แถว)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            เลือกรูปแบบไฟล์ที่ต้องการส่งออก เพื่อนำไปจัดทำรายงาน วิเคราะห์ต่อในโปรแกรม Excel หรือสำรองข้อมูล
          </p>

          <div className="space-y-2.5">
            {/* Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="w-full p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-800">
                    Microsoft Excel (.xlsx)
                  </h4>
                  <p className="text-xs text-slate-500">
                    มีหัวตาราง A-O ครบถ้วน จัดรูปแบบคอลัมน์ภาษาไทยสวยงาม
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>

            {/* CSV (.csv with UTF-8 BOM) */}
            <button
              onClick={handleExportCsv}
              className="w-full p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-800">
                    ไฟล์ CSV (.csv - UTF-8 BOM)
                  </h4>
                  <p className="text-xs text-slate-500">
                    เข้ารหัสภาษาไทยถูกต้อง เปิดใน Excel ไม่เป็นภาษาต่างดาว
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-blue-600 shrink-0" />
            </button>

            {/* JSON (.json) */}
            <button
              onClick={handleExportJson}
              className="w-full p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-amber-800">
                    ไฟล์สำรองข้อมูล JSON (.json)
                  </h4>
                  <p className="text-xs text-slate-500">
                    สำหรับแบ็คอัพโครงสร้างข้อมูลทั้งหมด สามารถนำกลับมา Restore ได้
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-amber-600 shrink-0" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h5 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>นำเข้าข้อมูลจากไฟล์สำรอง (Restore JSON):</span>
            </h5>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJsonFile}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4 text-slate-400" />
              เลือกไฟล์ JSON เพื่อกู้คืนฐานข้อมูล
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
