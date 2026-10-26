import React from 'react';
import { History, FileText, CheckCircle2, AlertCircle, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { UploadBatchRecord, AppSettings } from '../types';

interface HistoryViewProps {
  history: UploadBatchRecord[];
  onClearHistory: () => void;
  onOpenLightbox: (imageUrl: string, title: string, driveUrl?: string) => void;
  settings: AppSettings;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onOpenLightbox,
  settings,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>ประวัติการอัพโหลด & OCR สกัดบิลยา</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติการส่งไฟล์เข้าสู่ระบบและการบันทึกลง Google Drive & Google Sheets
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('คุณต้องการล้างประวัติการอัพโหลดทั้งหมดหรือไม่?')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 w-fit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            ล้างประวัติทั้งหมด
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">ยังไม่มีประวัติการอัพโหลดบิลยา</p>
            <p className="text-xs text-slate-400 mt-1">
              เมื่อคุณอัพโหลดและสกัด OCR บิลยา รายการจะปรากฏที่นี่โดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-2 w-16 text-center">รูปตัวอย่าง</th>
                  <th className="py-3 px-3 min-w-[140px]">วันเวลาที่อัพโหลด</th>
                  <th className="py-3 px-3 min-w-[160px]">ชื่อไฟล์เอกสาร</th>
                  <th className="py-3 px-3 min-w-[120px] font-bold">เลขที่บิล</th>
                  <th className="py-3 px-3 min-w-[180px]">ชื่อบริษัท/ผู้จำหน่าย</th>
                  <th className="py-3 px-2 text-center">จำนวนรายการ</th>
                  <th className="py-3 px-3 text-right font-bold">ยอดเงินรวม</th>
                  <th className="py-3 px-2 text-center">สถานะ</th>
                  <th className="py-3 px-2 text-center">Google Drive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Thumbnail */}
                    <td className="py-2 px-2 text-center">
                      <div
                        onClick={() => {
                          if (item.thumbnailUrl) {
                            onOpenLightbox(item.thumbnailUrl, item.fileName, item.driveUrl);
                          }
                        }}
                        className="w-10 h-10 mx-auto rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 flex items-center justify-center"
                        title="คลิกเพื่อดูรูปขนาดเต็ม"
                      >
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>

                    {/* File name */}
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={item.fileName}>
                      {item.fileName}
                    </td>

                    {/* Invoice No */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.invoiceNo || '-'}
                    </td>

                    {/* Company */}
                    <td className="py-2.5 px-3 text-slate-700">
                      {item.companyName || '-'}
                    </td>

                    {/* Item Count */}
                    <td className="py-2.5 px-2 text-center text-slate-600 font-medium">
                      {item.itemCount || 1}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                      ฿{Number(item.grandTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2 text-center">
                      {item.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> สำเร็จ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> ล้มเหลว
                        </span>
                      )}
                    </td>

                    {/* Drive Link */}
                    <td className="py-2.5 px-2 text-center">
                      <a
                        href={item.driveUrl || settings.googleDriveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                        title="เปิดโฟลเดอร์ Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
