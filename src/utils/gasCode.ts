export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * OCR INV. คลังยา รพ.สบปราบ - Google Apps Script Backend Web App
 * =========================================================================
 * 
 * ฟังก์ชั่นการทำงาน:
 * 1. รับข้อมูลจากเว็บแอพ OCR บิลยา
 * 2. บันทึกรูปภาพ/PDF ลง Google Drive Folder: "Inventory_OCR_Uploads(ไฟล์ย่อย)"
 * 3. บันทึกข้อมูล 15 คอลัมน์ (A: Timestamp ถึง O: ชื่อยาสามัญ) ลง Google Sheets: "บิล Invoice"
 * 4. จำกัดขอบเขตไม่เกิน 500 แถว เพื่อป้องกันความล่าช้า
 * 5. ส่งการแจ้งเตือน Flex Message ผ่าน LINE Messaging API
 */

// การตั้งค่าระบบ (Configuration)
const CONFIG = {
  SPREADSHEET_ID: '1ogoM0vXPndiRcjNgbkN3Bsitd5JTcoT4rsj7hkerZqQ',
  SHEET_NAME: 'บิล Invoice',
  DRIVE_FOLDER_ID: '1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY',
  MAX_ROWS_LIMIT: 500, // จำกัดขอบเขต 500 แถว
  LINE_CHANNEL_ACCESS_TOKEN: '', // ใส่ Channel Access Token จาก LINE Developers (หากต้องการ)
  LINE_DESTINATION_USER_ID: ''  // ปล่อยว่างเพื่อ Broadcast หรือใส่ User ID เฉพาะเจาะจง
};

// 1. ฟังก์ชั่นสร้างหัวตาราง (Headers A: Timestamp ถึง O: ชื่อยาสามัญ)
// 1. ฟังก์ชั่นสร้างหัวตาราง (Headers A: Timestamp ถึง P: ชื่อยาสามัญ)
function setupSheetHeaders() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  const headers = [
    'Timestamp',      // A
    'Invoice No',     // B
    'Company Name',   // C
    'Tax ID',         // D
    'Invoice Date',   // E
    'Salesperson',    // F
    'GPU Code',       // G
    'TPU Code',       // H
    'Product Name',   // I
    'Unit (หน่วย)',   // J
    'Quantity',       // K
    'Unit Price',     // L
    'Total Price',    // M
    'Grand Total',    // N
    'Image URL',      // O
    'ชื่อยาสามัญ'     // P
  ];
  
  // ตรวจสอบว่ามีหัวตารางหรือยัง
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#059669');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

// 2. HTTP POST Handler - รับข้อมูลจาก Web App
function doPost(e) {
  try {
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);
    const action = data.action || 'save_invoice';
    
    if (action === 'save_invoice') {
      const result = handleSaveInvoice(data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลสำเร็จ',
        data: result
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'get_records') {
      const records = handleGetRecords();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: records
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. จัดการบันทึกรูปลง Google Drive และแถวข้อมูลลง Google Sheets
function handleSaveInvoice(payload) {
  setupSheetHeaders();
  
  const invoice = payload.invoice;
  let fileUrl = invoice.driveUrl || '';
  
  // บันทึกไฟล์ลง Google Drive พร้อมตั้งชื่อแยกลิงก์รายบิลอย่างชัดเจน
  if (payload.fileBase64 && payload.fileName) {
    try {
      const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      const cleanBase64 = payload.fileBase64.replace(/^data:([a-zA-Z0-9_\-\.\/]+);base64,/, '');
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const safeInv = String(invoice.invoiceNo || 'INV').replace(/[/\\?%*:|"<>]/g, '_');
      const safeCompany = String(invoice.companyName || 'คลังยา').replace(/[/\\?%*:|"<>]/g, '_');
      const ext = (payload.mimeType === 'application/pdf' || String(payload.fileName).toLowerCase().endsWith('.pdf')) ? 'pdf' : 'jpg';
      const distinctFileName = 'บิล_' + safeInv + '_' + safeCompany + '_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss') + '.' + ext;
      
      const blob = Utilities.newBlob(decodedBytes, payload.mimeType || 'image/jpeg', distinctFileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl(); // ลิงก์ตรงดูเฉพาะบิลนี้บน Google Drive
    } catch (err) {
      Logger.log('Drive upload warning: ' + err.toString());
    }
  }
  
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  const currentRows = sheet.getLastRow();
  // ตรวจสอบจำกัด 500 แถว
  if (currentRows >= CONFIG.MAX_ROWS_LIMIT) {
    throw new Error('จำนวนแถวใน Google Sheet ถึงขีดจำกัด ' + CONFIG.MAX_ROWS_LIMIT + ' แถวแล้ว กรุณาลบข้อมูลเก่าก่อน');
  }
  
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const rowsToInsert = [];
  
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [{
    gpuCode: '',
    tpuCode: '',
    productName: 'รายการยา',
    genericName: '',
    unit: 'กล่อง',
    quantity: 1,
    unitPrice: invoice.grandTotal,
    totalPrice: invoice.grandTotal
  }];
  
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    rowsToInsert.push([
      timestamp,                    // A: Timestamp
      invoice.invoiceNo || '-',     // B: Invoice No
      invoice.companyName || '-',   // C: Company Name
      invoice.taxId || '-',         // D: Tax ID
      invoice.invoiceDate || '-',   // E: Invoice Date
      invoice.salesperson || '-',   // F: Salesperson
      it.gpuCode || '',             // G: GPU Code
      it.tpuCode || '',             // H: TPU Code
      it.productName || '-',        // I: Product Name
      it.unit || 'กล่อง',           // J: Unit หน่วยนับ (ขวด, กล่อง, vial, Amp ฯลฯ)
      Number(it.quantity || 1),     // K: Quantity
      Number(it.unitPrice || 0),    // L: Unit Price
      Number(it.totalPrice || 0),   // M: Total Price
      Number(invoice.grandTotal || 0), // N: Grand Total
      fileUrl,                      // O: Image URL แยกลิงก์รายบิล
      it.genericName || ''          // P: ชื่อยาสามัญ
    ]);
  }
  
  if (rowsToInsert.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, 16).setValues(rowsToInsert);
  }
  
  // ส่งการแจ้งเตือน LINE หากมีการตั้งค่า Token
  const lineToken = payload.lineToken || CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (lineToken) {
    sendLineNotification(lineToken, invoice, fileUrl);
  }
  
  return {
    rowsSaved: rowsToInsert.length,
    fileUrl: fileUrl,
    timestamp: timestamp
  };
}

// 4. ดึงข้อมูล 500 แถวล่าสุดจาก Sheet (รองรับทั้ง 15 และ 16 คอลัมน์)
function handleGetRecords() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  
  // อ่านข้อมูลไม่เกิน 500 แถว
  const numRows = Math.min(lastRow - 1, CONFIG.MAX_ROWS_LIMIT);
  const hasUnitCol = lastCol >= 16;
  const colCount = hasUnitCol ? 16 : 15;
  const values = sheet.getRange(2, 1, numRows, colCount).getValues();
  
  return values.map(function(row, idx) {
    if (hasUnitCol) {
      return {
        id: 'row_' + (idx + 2),
        timestamp: String(row[0] || ''),
        invoiceNo: String(row[1] || ''),
        companyName: String(row[2] || ''),
        taxId: String(row[3] || ''),
        invoiceDate: String(row[4] || ''),
        salesperson: String(row[5] || ''),
        gpuCode: String(row[6] || ''),
        tpuCode: String(row[7] || ''),
        productName: String(row[8] || ''),
        unit: String(row[9] || 'กล่อง'),
        quantity: Number(row[10] || 0),
        unitPrice: Number(row[11] || 0),
        totalPrice: Number(row[12] || 0),
        grandTotal: Number(row[13] || 0),
        imageUrl: String(row[14] || ''),
        genericName: String(row[15] || '')
      };
    } else {
      return {
        id: 'row_' + (idx + 2),
        timestamp: String(row[0] || ''),
        invoiceNo: String(row[1] || ''),
        companyName: String(row[2] || ''),
        taxId: String(row[3] || ''),
        invoiceDate: String(row[4] || ''),
        salesperson: String(row[5] || ''),
        gpuCode: String(row[6] || ''),
        tpuCode: String(row[7] || ''),
        productName: String(row[8] || ''),
        unit: 'กล่อง',
        quantity: Number(row[9] || 0),
        unitPrice: Number(row[10] || 0),
        totalPrice: Number(row[11] || 0),
        grandTotal: Number(row[12] || 0),
        imageUrl: String(row[13] || ''),
        genericName: String(row[14] || '')
      };
    }
  });
}

// 5. ส่งการแจ้งเตือน LINE OA Flex Message
function sendLineNotification(token, invoice, fileUrl) {
  try {
    const formattedTotal = Number(invoice.grandTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const payload = {
      messages: [{
        type: 'flex',
        altText: '🏥 บันทึกบิลคลังยา รพ.สบปราบ: ' + invoice.invoiceNo,
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#059669',
            contents: [
              { type: 'text', text: '🏥 รพ.สบปราบ - คลังยา', color: '#ffffff', weight: 'bold', size: 'sm' },
              { type: 'text', text: 'บันทึกข้อมูลสำเร็จ', color: '#ffffff', weight: 'bold', size: 'xl' }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              { type: 'text', text: 'เลขที่บิล: ' + (invoice.invoiceNo || '-'), weight: 'bold' },
              { type: 'text', text: 'บริษัท: ' + (invoice.companyName || '-'), wrap: true },
              { type: 'text', text: 'วันที่: ' + (invoice.invoiceDate || '-') },
              { type: 'text', text: 'จำนวน: ' + (invoice.items ? invoice.items.length : 1) + ' รายการ' },
              { type: 'text', text: 'ยอดรวม: ฿' + formattedTotal, size: 'lg', color: '#059669', weight: 'bold' }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: '📂 ดูรูปบิลบน Google Drive', uri: fileUrl || 'https://drive.google.com/drive/folders/1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY' },
                style: 'primary',
                color: '#059669'
              }
            ]
          }
        }
      }]
    };
    
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log('LINE notify error: ' + err.toString());
  }
}
`;
