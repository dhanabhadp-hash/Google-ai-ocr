import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadView } from './components/UploadView';
import { TableView } from './components/TableView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { ImageLightbox } from './components/ImageLightbox';
import { BackupExportModal } from './components/BackupExportModal';
import { SettingsGasModal } from './components/SettingsGasModal';
import { 
  loadSettings, 
  saveSettings, 
  loadRecords, 
  saveRecords, 
  loadUploadHistory, 
  saveUploadHistory 
} from './utils/storage';
import { 
  AppSettings, 
  SheetRowRecord, 
  UploadBatchRecord, 
  ExtractedInvoice 
} from './types';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [records, setRecords] = useState<SheetRowRecord[]>(loadRecords);
  const [history, setHistory] = useState<UploadBatchRecord[]>(loadUploadHistory);
  const [currentTab, setCurrentTab] = useState<string>('upload');

  // Modals state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    driveUrl?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to storage on change
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveUploadHistory(history);
  }, [history]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Open full-screen lightbox
  const handleOpenLightbox = (imageUrl: string, title: string, driveUrl?: string) => {
    setLightboxState({
      isOpen: true,
      imageUrl,
      title,
      driveUrl: driveUrl || settings.googleDriveFolderUrl,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  // Save extracted invoice to Google Sheets
  const handleSaveToSheet = async (
    invoice: ExtractedInvoice,
    newRows: SheetRowRecord[]
  ): Promise<{ success: boolean; error?: string }> => {
    const maxLimit = settings.maxSheetRows || 500;
    if (records.length + newRows.length > maxLimit) {
      return {
        success: false,
        error: `จำนวนแถวเกินขีดจำกัด ${maxLimit} แถว (ปัจจุบัน: ${records.length} แถว, เพิ่ม: ${newRows.length} แถว)`,
      };
    }

    try {
      // 1. If GAS Web App URL is configured, forward to Google Apps Script
      if (settings.gasWebAppUrl) {
        try {
          await fetch('/api/gas/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webAppUrl: settings.gasWebAppUrl,
              payload: {
                action: 'save_invoice',
                invoice: {
                  invoiceNo: invoice.invoiceNo,
                  companyName: invoice.companyName,
                  taxId: invoice.taxId,
                  invoiceDate: invoice.invoiceDate,
                  salesperson: invoice.salesperson,
                  grandTotal: invoice.grandTotal,
                  driveUrl: invoice.driveUrl || settings.googleDriveFolderUrl,
                  items: invoice.items,
                },
                lineToken: settings.lineChannelAccessToken || undefined,
              },
            }),
          });
        } catch (gasErr) {
          console.warn('Google Apps Script proxy warning:', gasErr);
        }
      }

      // 2. Prepend newly saved rows into records (capped at maxLimit)
      const updatedRecords = [...newRows, ...records].slice(0, maxLimit);
      setRecords(updatedRecords);

      // 3. Add to upload history (generate tiny lightweight thumbnail to keep storage slim)
      let miniThumb: string | undefined = undefined;
      if (invoice.fileDataUrl && invoice.fileDataUrl.startsWith('data:image')) {
        try {
          miniThumb = await new Promise<string | undefined>((resolve) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const maxDim = 80;
                let w = img.width;
                let h = img.height;
                if (w > h) {
                  if (w > maxDim) {
                    h = Math.round((h * maxDim) / w);
                    w = maxDim;
                  }
                } else {
                  if (h > maxDim) {
                    w = Math.round((w * maxDim) / h);
                    h = maxDim;
                  }
                }
                canvas.width = Math.max(w, 1);
                canvas.height = Math.max(h, 1);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL('image/jpeg', 0.4));
                  return;
                }
              } catch {}
              resolve(undefined);
            };
            img.onerror = () => resolve(undefined);
            img.src = invoice.fileDataUrl!;
          });
        } catch {}
      }

      const newHistoryItem: UploadBatchRecord = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        fileName: invoice.fileName,
        fileType: invoice.fileType,
        fileSize: 0,
        invoiceNo: invoice.invoiceNo,
        companyName: invoice.companyName,
        itemCount: invoice.items.length,
        grandTotal: invoice.grandTotal,
        status: 'SUCCESS',
        driveUrl: invoice.driveUrl || settings.googleDriveFolderUrl,
        thumbnailUrl: miniThumb,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

      // 4. Trigger LINE OA Flex notification if enabled
      if (settings.enableLineNotify) {
        fetch('/api/line/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: settings.lineChannelAccessToken || undefined,
            toUserId: settings.lineDestinationUserId || undefined,
            invoiceSummary: {
              invoiceNo: invoice.invoiceNo,
              companyName: invoice.companyName,
              grandTotal: invoice.grandTotal,
              itemCount: invoice.items.length,
              vatStatus: invoice.vatAnalysis?.note || 'ตรวจสอบแล้ว',
              date: invoice.invoiceDate,
              driveUrl: invoice.driveUrl || settings.googleDriveFolderUrl,
            },
          }),
        }).catch((e) => console.warn('LINE notify failed:', e));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'เกิดข้อผิดพลาดในการบันทึก' };
    }
  };

  // Update single record
  const handleUpdateRecord = (updated: SheetRowRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Delete single record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Bulk delete
  const handleDeleteMultipleRecords = (ids: string[]) => {
    const idSet = new Set(ids);
    setRecords((prev) => prev.filter((r) => !idSet.has(r.id)));
  };

  // Clear upload history
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Import / Restore JSON
  const handleImportRecords = (imported: SheetRowRecord[]) => {
    const maxLimit = settings.maxSheetRows || 500;
    setRecords(imported.slice(0, maxLimit));
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        rowCount={records.length}
        settings={settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'upload' && (
          <UploadView
            onSaveToSheet={handleSaveToSheet}
            onOpenLightbox={handleOpenLightbox}
            settings={settings}
            rowCount={records.length}
          />
        )}

        {currentTab === 'table' && (
          <TableView
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onDeleteMultipleRecords={handleDeleteMultipleRecords}
            onOpenLightbox={handleOpenLightbox}
            settings={settings}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView records={records} settings={settings} />
        )}

        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onOpenLightbox={handleOpenLightbox}
            settings={settings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <b>OCR INV. คลังยา รพ.สบปราบ</b> • ขับเคลื่อนด้วย Gemini 3.8 Flash, Google Sheets & Google Drive
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">ขีดจำกัดชีท: {records.length}/500 แถว</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-emerald-700 hover:underline font-medium"
            >
              ตั้งค่าระบบ & Apps Script
            </button>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxState.isOpen}
        onClose={handleCloseLightbox}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        driveUrl={lightboxState.driveUrl}
      />

      {/* Backup & Export Modal */}
      <BackupExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        onImportRecords={handleImportRecords}
      />

      {/* Settings & GAS Hub Modal */}
      <SettingsGasModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
