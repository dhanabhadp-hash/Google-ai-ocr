import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Table, 
  BarChart3, 
  History, 
  Download, 
  Settings, 
  ExternalLink, 
  Menu, 
  X,
  Database
} from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  rowCount: number;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  rowCount,
  settings,
  onOpenSettings,
  onOpenExport
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'upload', label: 'อัพโหลด & สกัด OCR', icon: Upload },
    { id: 'table', label: 'ฐานข้อมูลชีท', icon: Table },
    { id: 'dashboard', label: 'แดชบอร์ด KPI', icon: BarChart3 },
    { id: 'history', label: 'ประวัติอัพโหลด', icon: History },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const isNearLimit = rowCount >= 450;
  const isAtLimit = rowCount >= 500;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Hospital Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                  OCR INV. <span className="text-emerald-700 font-extrabold">คลังยา รพ.สบปราบ</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบสกัดข้อมูลบิลยา • บันทึก Google Sheets & Google Drive
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Tools & Row Quota */}
          <div className="hidden sm:flex items-center gap-2">
            {/* 500-Row Quota Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isAtLimit
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isNearLimit
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="จำกัดขอบเขตของชีท 500 แถวเพื่อป้องกันความล่าช้า"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{rowCount}/500 แถว</span>
            </div>

            {/* Google Drive Link */}
            <a
              href={settings.googleDriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
              title="เปิดโฟลเดอร์ Google Drive: Inventory_OCR_Uploads(ไฟล์ย่อย)"
            >
              <span className="text-amber-600">📁</span> Drive
              <ExternalLink className="w-3 h-3 text-amber-500" />
            </a>

            {/* Google Sheet Link */}
            <a
              href={`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="เปิด Google Sheets: บิล Invoice"
            >
              <span className="text-emerald-600">📊</span> Sheets
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </a>

            {/* Export Button */}
            <button
              onClick={onOpenExport}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
              title="ส่งออก Excel / CSV / JSON & สำรองข้อมูล"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
              title="ตั้งค่าระบบ & สคริปต์ Google Apps Script"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={onOpenExport}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              title="ส่งออกไฟล์"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              title="ตั้งค่า"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>ความจุข้อมูล: <b>{rowCount}/500 แถว</b></span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={settings.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 hover:underline flex items-center gap-0.5"
              >
                Drive <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                Sheets <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
