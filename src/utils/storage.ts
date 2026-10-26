import { AppSettings, SheetRowRecord, UploadBatchRecord } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  googleSheetId: '1ogoM0vXPndiRcjNgbkN3Bsitd5JTcoT4rsj7hkerZqQ',
  sheetName: 'บิล Invoice',
  googleDriveFolderId: '1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
  googleDriveFolderUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
  gasWebAppUrl: '',
  lineChannelAccessToken: '',
  lineDestinationUserId: '',
  enableLineNotify: true,
  maxSheetRows: 500,
};

// Initial realistic seed records based on hospital pharmacy inventory files
export const INITIAL_SEED_RECORDS: SheetRowRecord[] = [
  {
    id: 'row_1',
    timestamp: '2026-10-06 09:15:20',
    invoiceNo: 'BL-6710-0421',
    companyName: 'บริษัท เบอร์ลินฟาร์มาซูติคอลอินดัสตรี้ จำกัด',
    taxId: '0105513002914',
    invoiceDate: '2026-10-05',
    salesperson: 'คุณสมชาย วงศ์สวัสดิ์',
    gpuCode: '241850',
    tpuCode: '782910',
    productName: 'Berlin Paracetamol 500 mg tab (Box 100x10s)',
    quantity: 50,
    unitPrice: 280.00,
    totalPrice: 14000.00,
    grandTotal: 53741.80,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Paracetamol 500 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_2',
    timestamp: '2026-10-06 09:15:20',
    invoiceNo: 'BL-6710-0421',
    companyName: 'บริษัท เบอร์ลินฟาร์มาซูติคอลอินดัสตรี้ จำกัด',
    taxId: '0105513002914',
    invoiceDate: '2026-10-05',
    salesperson: 'คุณสมชาย วงศ์สวัสดิ์',
    gpuCode: '315024',
    tpuCode: '891045',
    productName: 'Lipidop 20 mg (Atorvastatin) tab',
    quantity: 30,
    unitPrice: 720.00,
    totalPrice: 21600.00,
    grandTotal: 53741.80,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Atorvastatin calcium 20 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_3',
    timestamp: '2026-10-06 09:15:20',
    invoiceNo: 'BL-6710-0421',
    companyName: 'บริษัท เบอร์ลินฟาร์มาซูติคอลอินดัสตรี้ จำกัด',
    taxId: '0105513002914',
    invoiceDate: '2026-10-05',
    salesperson: 'คุณสมชาย วงศ์สวัสดิ์',
    gpuCode: '189420',
    tpuCode: '652130',
    productName: 'Lodipin 5 mg (Amlodipine) tab',
    quantity: 40,
    unitPrice: 365.00,
    totalPrice: 14600.00,
    grandTotal: 53741.80,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Amlodipine besylate 5 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_4',
    timestamp: '2026-10-05 14:22:11',
    invoiceNo: 'PT-24-12775',
    companyName: 'บริษัท พาตาร์แล็บ จำกัด',
    taxId: '0105524018741',
    invoiceDate: '2026-10-04',
    salesperson: 'คุณวราภรณ์ สุขใจ',
    gpuCode: '450128',
    tpuCode: '912044',
    productName: 'Patarphen 4 mg (Chlorpheniramine) tab',
    quantity: 100,
    unitPrice: 45.00,
    totalPrice: 4500.00,
    grandTotal: 12775.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Chlorpheniramine maleate 4 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_5',
    timestamp: '2026-10-05 14:22:11',
    invoiceNo: 'PT-24-12775',
    companyName: 'บริษัท พาตาร์แล็บ จำกัด',
    taxId: '0105524018741',
    invoiceDate: '2026-10-04',
    salesperson: 'คุณวราภรณ์ สุขใจ',
    gpuCode: '582190',
    tpuCode: '310492',
    productName: 'Patar Omeprazole 20 mg cap',
    quantity: 60,
    unitPrice: 124.00,
    totalPrice: 7440.00,
    grandTotal: 12775.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Omeprazole 20 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_6',
    timestamp: '2026-10-04 11:30:45',
    invoiceNo: 'DIE-67-14766',
    companyName: 'บริษัท ไดอี ฟาร์มาซูติคอล จำกัด',
    taxId: '0105531049821',
    invoiceDate: '2026-10-03',
    salesperson: 'คุณอนุชา มีทรัพย์',
    gpuCode: '612390',
    tpuCode: '741209',
    productName: 'Diemox 500 mg (Amoxicillin) cap',
    quantity: 50,
    unitPrice: 185.00,
    totalPrice: 9250.00,
    grandTotal: 14766.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Amoxicillin trihydrate 500 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_7',
    timestamp: '2026-10-04 11:30:45',
    invoiceNo: 'DIE-67-14766',
    companyName: 'บริษัท ไดอี ฟาร์มาซูติคอล จำกัด',
    taxId: '0105531049821',
    invoiceDate: '2026-10-03',
    salesperson: 'คุณอนุชา มีทรัพย์',
    gpuCode: '723810',
    tpuCode: '852019',
    productName: 'Die-Cipro 500 mg (Ciprofloxacin) tab',
    quantity: 30,
    unitPrice: 151.00,
    totalPrice: 4530.00,
    grandTotal: 14766.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Ciprofloxacin hydrochloride 500 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_8',
    timestamp: '2026-10-03 16:10:05',
    invoiceNo: 'CC-22370',
    companyName: 'บริษัท ชุมชนเภสัชกรรม จำกัด (มหาชน)',
    taxId: '0107537001423',
    invoiceDate: '2026-10-02',
    salesperson: 'คุณกิตติศักดิ์ พรหมมา',
    gpuCode: '891230',
    tpuCode: '412098',
    productName: 'Chumchon Metformin 500 mg tab',
    quantity: 80,
    unitPrice: 140.00,
    totalPrice: 11200.00,
    grandTotal: 22370.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Metformin hydrochloride 500 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_9',
    timestamp: '2026-10-03 16:10:05',
    invoiceNo: 'CC-22370',
    companyName: 'บริษัท ชุมชนเภสัชกรรม จำกัด (มหาชน)',
    taxId: '0107537001423',
    invoiceDate: '2026-10-02',
    salesperson: 'คุณกิตติศักดิ์ พรหมมา',
    gpuCode: '912401',
    tpuCode: '523019',
    productName: 'Chumchon Losartan 50 mg tab',
    quantity: 45,
    unitPrice: 215.00,
    totalPrice: 9675.00,
    grandTotal: 22370.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Losartan potassium 50 mg',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
  {
    id: 'row_10',
    timestamp: '2026-10-02 10:45:19',
    invoiceNo: 'IRR-67-0891',
    companyName: 'บริษัท ไทยโอซูก้า จำกัด',
    taxId: '0105516004921',
    invoiceDate: '2026-10-01',
    salesperson: 'คุณธนพล เจริญกุล',
    gpuCode: '109284',
    tpuCode: '210948',
    productName: 'Sterile Water for Irrigation 1000 ml bottle',
    quantity: 120,
    unitPrice: 42.00,
    totalPrice: 5040.00,
    grandTotal: 10700.00,
    imageUrl: 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
    genericName: 'Water for Irrigation 1000 ml',
    vatStatus: 'INCLUDED_7_PERCENT',
  },
];

const STORAGE_KEYS = {
  SETTINGS: 'sobprab_inv_settings_v1',
  RECORDS: 'sobprab_inv_records_v1',
  HISTORY: 'sobprab_inv_history_v1',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Notice when loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Safe storage setter with QuotaExceededError recovery
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuota) {
      try {
        if (key === STORAGE_KEYS.HISTORY) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // Retain only latest 15 items and strip any remaining thumbnail URLs
            const stripped = parsed.slice(0, 15).map((item) => ({
              ...item,
              thumbnailUrl: undefined,
            }));
            localStorage.setItem(key, JSON.stringify(stripped));
            return;
          }
        } else if (key === STORAGE_KEYS.RECORDS) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const stripped = parsed.map((item) => ({
              ...item,
              imageUrl: item.imageUrl && item.imageUrl.length > 500 ? '' : item.imageUrl,
            }));
            localStorage.setItem(key, JSON.stringify(stripped));
            return;
          }
        }
      } catch {
        // Fallback: clear history key to guarantee settings and records stay intact
        try {
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
        } catch {}
      }
    }
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Notice when saving settings:', e);
  }
}

export function loadRecords(): SheetRowRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 500); // 500 limit
      }
    }
  } catch (e) {
    console.warn('Notice when loading records:', e);
  }
  // If empty, save seed records
  saveRecords(INITIAL_SEED_RECORDS);
  return INITIAL_SEED_RECORDS;
}

export function saveRecords(records: SheetRowRecord[]): void {
  try {
    // Limit to max 500 rows and ensure no raw base64 data URLs in records
    const capped = records.slice(0, 500).map((r) => {
      if (r.imageUrl && r.imageUrl.startsWith('data:') && r.imageUrl.length > 5000) {
        return { ...r, imageUrl: '' };
      }
      return r;
    });
    safeLocalStorageSet(STORAGE_KEYS.RECORDS, JSON.stringify(capped));
  } catch (e) {
    console.warn('Notice when saving records:', e);
  }
}

export function loadUploadHistory(): UploadBatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Sanitize and strip any legacy bloated base64 thumbnails
        return parsed.slice(0, 30).map((item) => {
          if (item.thumbnailUrl && item.thumbnailUrl.startsWith('data:') && item.thumbnailUrl.length > 5000) {
            return { ...item, thumbnailUrl: undefined };
          }
          return item;
        });
      }
    }
  } catch (e) {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {}
  }
  return [];
}

export function saveUploadHistory(history: UploadBatchRecord[]): void {
  try {
    // Keep max 30 items and strip large data URIs (> 5000 chars) to stay safely within localStorage quota
    const sanitized = history.slice(0, 30).map((item) => {
      if (item.thumbnailUrl && item.thumbnailUrl.startsWith('data:') && item.thumbnailUrl.length > 5000) {
        return { ...item, thumbnailUrl: undefined };
      }
      return item;
    });
    safeLocalStorageSet(STORAGE_KEYS.HISTORY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Notice when saving history:', e);
  }
}
