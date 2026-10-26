import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  FileCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Bell, 
  Database, 
  Folder, 
  Server,
  RefreshCw,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { AppSettings } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/gasCode';

interface SettingsGasModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsGasModal: React.FC<SettingsGasModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'gas_code' | 'line_preview'>('config');
  const [isTestingLine, setIsTestingLine] = useState(false);
  const [lineTestMessage, setLineTestMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleTestLineNotify = async () => {
    setIsTestingLine(true);
    setLineTestMessage(null);

    try {
      const response = await fetch('/api/line/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.lineChannelAccessToken,
          toUserId: formData.lineDestinationUserId || undefined,
          invoiceSummary: {
            invoiceNo: 'TEST-BL-6710-999',
            companyName: 'บริษัท เบอร์ลินฟาร์มาซูติคอล จำกัด (ทดสอบ)',
            grandTotal: 15400.00,
            itemCount: 3,
            vatStatus: 'ราคารวม VAT 7% แล้ว',
            date: new Date().toISOString().split('T')[0],
            driveUrl: formData.googleDriveFolderUrl,
          },
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLineTestMessage('✅ ส่งการแจ้งเตือน LINE Flex Message สำเร็จ!');
      } else {
        setLineTestMessage('❌ ส่งไม่สำเร็จ: ' + (data.error || 'กรุณาตรวจสอบ Channel Access Token'));
      }
    } catch (err: any) {
      setLineTestMessage('❌ เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsTestingLine(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ตั้งค่าระบบ & สคริปต์ Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมต่อ Google Sheets, Google Drive และระบบแจ้งเตือน LINE OA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            การเชื่อมต่อ & LINE OA
          </button>
          <button
            onClick={() => setActiveTab('gas_code')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'gas_code'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            โค้ด Google Apps Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('line_preview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'line_preview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            ตัวอย่าง LINE Flex Message
          </button>
        </div>

        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Google Sheets Config */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Google Sheets Database (ฐานข้อมูลชีท)</span>
                </h4>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${formData.googleSheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                >
                  เปิด Sheet <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Google Spreadsheet ID:
                  </label>
                  <input
                    type="text"
                    value={formData.googleSheetId}
                    onChange={(e) => setFormData({ ...formData, googleSheetId: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    ชื่อแท็บ Sheet Name:
                  </label>
                  <input
                    type="text"
                    value={formData.sheetName}
                    onChange={(e) => setFormData({ ...formData, sheetName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Google Drive Config */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-amber-700" />
                  <span>Google Drive Folder (โฟลเดอร์เก็บไฟล์ภาพ/PDF)</span>
                </h4>
                <a
                  href={formData.googleDriveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-medium"
                >
                  เปิดโฟลเดอร์ Drive <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Google Drive Folder ID:
                  </label>
                  <input
                    type="text"
                    value={formData.googleDriveFolderId}
                    onChange={(e) => setFormData({ ...formData, googleDriveFolderId: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    ชื่อโฟลเดอร์:
                  </label>
                  <div className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-medium text-xs">
                    Inventory_OCR_Uploads(ไฟล์ย่อย)
                  </div>
                </div>
              </div>
            </div>

            {/* Google Apps Script Web App URL */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Google Apps Script Web App URL (URL สำหรับบันทึกผ่าน API จริง)</span>
                </h4>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={formData.gasWebAppUrl}
                  onChange={(e) => setFormData({ ...formData, gasWebAppUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  เมื่อนำโค้ดในแท็บ "โค้ด Google Apps Script" ไป Deploy เป็น Web App แล้ว สามารถนำ URL มาวางที่นี่เพื่อทำการ Sync อัตโนมัติ
                </p>
              </div>
            </div>

            {/* LINE OA Messaging API */}
            <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>LINE OA Messaging API (แจ้งเตือน Flex Message เมื่อบันทึกสำเร็จ)</span>
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Channel Access Token (Long-lived):
                  </label>
                  <input
                    type="password"
                    placeholder="วาง Channel Access Token จาก LINE Developers Console..."
                    value={formData.lineChannelAccessToken}
                    onChange={(e) => setFormData({ ...formData, lineChannelAccessToken: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestLineNotify}
                    disabled={isTestingLine || !formData.lineChannelAccessToken}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isTestingLine ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังส่งทดสอบ...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        ทดสอบส่ง Flex Message เข้า LINE
                      </>
                    )}
                  </button>
                  {lineTestMessage && (
                    <span className="text-xs font-medium text-slate-700">
                      {lineTestMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Google Apps Script Code */}
        {activeTab === 'gas_code' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">วิธีนำโค้ดไปติดตั้งใน Google Sheets:</p>
                <ol className="list-decimal list-inside space-y-0.5 mt-1 text-[11px] text-emerald-800">
                  <li>เปิด Google Sheets แผ่นงาน <b>"บิล Invoice"</b></li>
                  <li>ไปที่เมนู <b>Extensions (ส่วนขยาย) &gt; Apps Script</b></li>
                  <li>ลบโค้ดเดิมทั้งหมดในไฟล์ <code>Code.gs</code> แล้ววางโค้ดด้านล่างนี้</li>
                  <li>คลิกปุ่ม <b>Deploy (ทำให้ใช้งานได้) &gt; New deployment &gt; Web app</b></li>
                  <li>ตั้งค่า <b>Execute as: Me</b> และ <b>Who has access: Anyone</b> แล้วกด Deploy</li>
                  <li>คัดลอก Web App URL นำมาใส่ในช่องตั้งค่าของเว็บแอพนี้</li>
                </ol>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-t-xl text-slate-300 text-xs">
                <span className="font-mono">Code.gs (Google Apps Script)</span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> คัดลอกโค้ดทั้งหมด
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-b-xl text-[11px] font-mono overflow-x-auto max-h-[380px] leading-relaxed">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: LINE Flex Message Live Preview */}
        {activeTab === 'line_preview' && (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100">
            <p className="text-xs text-slate-500 mb-3 text-center">
              รูปแบบการแสดงผลจริงบนโทรศัพท์มือถือเมื่อระบบส่ง Flex Message ผ่าน LINE OA
            </p>

            {/* Mock phone bubble */}
            <div className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              {/* Flex Header */}
              <div className="bg-emerald-600 text-white p-4">
                <span className="text-[11px] font-semibold text-emerald-100 block">
                  🏥 รพ.สบปราบ - คลังยา
                </span>
                <h4 className="text-base font-bold mt-0.5">
                  บันทึกบิล Invoice สำเร็จ
                </h4>
              </div>

              {/* Flex Body */}
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">เลขที่บิล:</span>
                  <span className="font-bold text-slate-800">BL-6710-0421</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ผู้จำหน่าย:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    บริษัท เบอร์ลินฟาร์มาซูติคอลฯ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่:</span>
                  <span className="text-slate-700">05/10/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวน:</span>
                  <span className="text-slate-700">3 รายการ</span>
                </div>

                <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-800">ยอดรวมสุทธิ:</span>
                  <span className="text-base font-extrabold text-emerald-600">฿53,741.80</span>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-[10px] p-2 rounded-lg font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>ตรวจสอบแล้ว: ราคารวมภาษีมูลค่าเพิ่ม 7% ถูกต้อง</span>
                </div>
              </div>

              {/* Flex Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <button className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs">
                  📂 เปิดดูรูปบน Google Drive
                </button>
                <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                  📊 ดูชีทข้อมูล รพ.สบปราบ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            จำกัดข้อมูล 500 แถวเพื่อประสิทธิภาพสูงสุด
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
