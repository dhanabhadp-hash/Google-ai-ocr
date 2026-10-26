import React, { useMemo } from 'react';
import { 
  DollarSign, 
  FileText, 
  Pill, 
  Percent, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  AlertTriangle,
  Database,
  ExternalLink
} from 'lucide-react';
import { SheetRowRecord, AppSettings } from '../types';

interface DashboardViewProps {
  records: SheetRowRecord[];
  settings: AppSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ records, settings }) => {
  // Aggregate stats
  const stats = useMemo(() => {
    const totalRows = records.length;
    const uniqueInvoices = new Set(records.map(r => r.invoiceNo).filter(Boolean)).size;
    const totalAmount = records.reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0);
    const grandTotalsSum = Array.from(
      new Map(records.map(r => [r.invoiceNo, Number(r.grandTotal) || 0])).values()
    ).reduce((a, b) => a + b, 0);

    // VAT Analysis breakdown
    let vatCompliantCount = 0;
    let vatExemptCount = 0;
    let vatMismatchCount = 0;

    const invoiceVatMap = new Map<string, string>();
    records.forEach(r => {
      if (!invoiceVatMap.has(r.invoiceNo)) {
        invoiceVatMap.set(r.invoiceNo, r.vatStatus || 'INCLUDED_7_PERCENT');
      }
    });

    invoiceVatMap.forEach((status) => {
      if (status === 'INCLUDED_7_PERCENT') vatCompliantCount++;
      else if (status === 'ZERO_OR_EXEMPT') vatExemptCount++;
      else vatMismatchCount++;
    });

    const vatComplianceRate = uniqueInvoices > 0
      ? Math.round(((vatCompliantCount + vatExemptCount) / uniqueInvoices) * 100)
      : 100;

    // Supplier Breakdown
    const supplierSpending: { [key: string]: { total: number; count: number; items: number } } = {};
    records.forEach(r => {
      const comp = r.companyName || 'ไม่ระบุ';
      if (!supplierSpending[comp]) {
        supplierSpending[comp] = { total: 0, count: 0, items: 0 };
      }
      supplierSpending[comp].total += Number(r.totalPrice) || 0;
      supplierSpending[comp].items += 1;
    });

    const topSuppliers = Object.entries(supplierSpending)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    // Top Generic Drugs
    const genericDrugMap: { [key: string]: { totalQty: number; totalCost: number } } = {};
    records.forEach(r => {
      const gen = r.genericName && r.genericName !== '-' ? r.genericName : (r.productName || 'ไม่ระบุ');
      if (!genericDrugMap[gen]) {
        genericDrugMap[gen] = { totalQty: 0, totalCost: 0 };
      }
      genericDrugMap[gen].totalQty += Number(r.quantity) || 0;
      genericDrugMap[gen].totalCost += Number(r.totalPrice) || 0;
    });

    const topDrugs = Object.entries(genericDrugMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 6);

    return {
      totalRows,
      uniqueInvoices,
      totalAmount,
      grandTotalsSum: grandTotalsSum || totalAmount,
      vatComplianceRate,
      vatCompliantCount,
      vatExemptCount,
      vatMismatchCount,
      topSuppliers,
      topDrugs,
    };
  }, [records]);

  const maxRows = settings.maxSheetRows || 500;
  const quotaPercent = Math.min(Math.round((stats.totalRows / maxRows) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>📊 แดชบอร์ด KPI คลังยา รพ.สบปราบ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สรุปภาพรวมการจัดซื้อยา มูลค่ารวม อัตราส่วนภาษีมูลค่าเพิ่ม 7% และวิเคราะห์บริษัทยาคู่ค้า
          </p>
        </div>

        {/* Quota Gauge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              ความจุ Google Sheet:
            </span>
            <span className="font-bold text-slate-800">{stats.totalRows}/{maxRows} แถว</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                quotaPercent > 90
                  ? 'bg-rose-500'
                  : quotaPercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block text-right">
            เหลือบันทึกได้อีก {Math.max(maxRows - stats.totalRows, 0)} แถว
          </span>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">มูลค่าจัดซื้อยารวม</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              ฿{stats.grandTotalsSum.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              จาก {stats.uniqueInvoices} บิล Invoice
            </p>
          </div>
        </div>

        {/* Card 2: Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">จำนวนบิลที่สกัด OCR</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.uniqueInvoices} <span className="text-sm font-semibold text-slate-500">ฉบับ</span>
            </h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              รวม {stats.totalRows} รายการยา
            </p>
          </div>
        </div>

        {/* Card 3: Generic Drugs Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">ยาสามัญที่วิเคราะห์ได้</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.topDrugs.length} <span className="text-sm font-semibold text-slate-500">กลุ่มยา</span>
            </h3>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">
              AI แมปชื่อการค้าเป็นยาสามัญ
            </p>
          </div>
        </div>

        {/* Card 4: VAT 7% Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">อัตราความถูกต้อง VAT 7%</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.vatComplianceRate}%
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {stats.vatCompliantCount} รวม VAT, {stats.vatExemptCount} ยกเว้น
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers / Pharmaceutical Companies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>ผู้จัดจำหน่าย/บริษัทยาที่สั่งซื้อสูงสุด</span>
            </h3>
            <span className="text-xs text-slate-500">
              {stats.topSuppliers.length} บริษัท
            </span>
          </div>

          <div className="space-y-3">
            {stats.topSuppliers.slice(0, 5).map((sup, idx) => {
              const maxVal = stats.topSuppliers[0]?.total || 1;
              const percent = Math.round((sup.total / maxVal) * 100);

              return (
                <div key={sup.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                      {idx + 1}. {sup.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      ฿{sup.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    {sup.items} รายการ
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Procured Generic Drugs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>ยาสามัญที่มีมูลค่าจัดซื้อสูงสุด (Generic Drug Analysis)</span>
            </h3>
            <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              AI INN/Generic
            </span>
          </div>

          <div className="space-y-3">
            {stats.topDrugs.map((drug, idx) => (
              <div
                key={drug.name}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {idx + 1}. {drug.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    จำนวนรวม: {drug.totalQty.toLocaleString()} หน่วย
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-700">
                    ฿{drug.totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
