# OCR INV. คลังยา รพ.สบปราบ

ระบบเว็บแอปพลิเคชัน OCR สกัดข้อมูลเอกสารใบส่งของ / ใบกำกับภาษี / ใบเสร็จรับเงิน (Inventory Invoices) สำหรับ **คลังยา โรงพยาบาลสบปราบ** ขับเคลื่อนด้วย AI **Google Gemini 3.8 Flash** พร้อมระบบสำรองโมเดลอัตโนมัติ (Multi-Model Fallback Cascade), เชื่อมต่อฐานข้อมูล **Google Sheets**, จัดเก็บไฟล์รูปภาพ/PDF บน **Google Drive** และแจ้งเตือนผ่าน **LINE Official Account (Flex Message)**

---

## 🌟 ฟังก์ชันการทำงานหลัก

- 📤 **OCR สกัดข้อมูลอัจฉริยะ (Gemini AI)**: รองรับการเลือกไฟล์พร้อมกันหลายบิล ทั้งรูปถ่าย (.jpg, .png, .webp) และเอกสาร PDF
- 💊 **วิเคราะห์ชื่อยาสามัญ (Generic Name INN)**: AI ตรวจจับชื่อการค้า (Trade Name) และแปลงเป็นชื่อยาสามัญมาตรฐานสากล พร้อมดึงรหัส GPU และ TPU (5-8 หลัก)
- 🧾 **ตรวจสอบภาษีมูลค่าเพิ่ม (VAT 7%)**: คำนวณยอดรวมสินค้าและแจ้งเตือนสถานะภาษี (รวม VAT 7%, ยังไม่รวม VAT หรือได้รับการยกเว้น)
- 📋 **หน้าต่างตรวจสอบก่อนบันทึก (Review & Edit)**: ตรวจทาน แก้ไข เพิ่ม/ลบ รายการยาในตารางก่อนบันทึกจริง
- 🔍 **พรีวิวภาพขนาดย่อ & ดูภาพเต็ม (Lightbox)**: ย่อ-ขยาย (Zoom), หมุนภาพ 90 องศา และลิงก์ไปยัง Google Drive
- 📊 **ฐานข้อมูล Google Sheets (15 คอลัมน์ A ถึง O)**:
  - A: Timestamp (เวลาที่บันทึก)
  - B: Invoice No (เลขที่บิล)
  - C: Company Name (ชื่อบริษัท/ร้านค้า)
  - D: Tax ID (เลขประจำตัวผู้เสียภาษี 13 หลัก)
  - E: Invoice Date (วันที่ในบิล)
  - F: Salesperson (พนักงานขาย)
  - G: GPU Code (รหัส GPU 5-8 หลัก)
  - H: TPU Code (รหัส TPU 5-8 หลัก)
  - I: Product Name (ชื่อสินค้า / ชื่อยาการค้า)
  - J: Quantity (จำนวน)
  - K: Unit Price (ราคาต่อหน่วย)
  - L: Total Price (ราคารวม)
  - M: Grand Total (ยอดรวมทั้งบิล)
  - N: Image URL (ลิงก์รูปภาพบน Google Drive)
  - O: ชื่อยาสามัญ (AI วิเคราะห์)
- ⚡ **จำกัดขอบเขต 500 แถว**: มีแถบวัดโควต้า (Quota Tracker) เพื่อป้องกันชีทโหลดช้า
- 📈 **แดชบอร์ด KPI**: วิเคราะห์มูลค่าจัดซื้อยาสะสม, บริษัทยาคู่ค้าที่สั่งซื้อสูงสุด (Top Suppliers) และกลุ่มยาสามัญ
- 💾 **สำรองข้อมูล & ส่งออก**: รองรับการ Export เป็น Excel (.xlsx), CSV (UTF-8 BOM ภาษาไทย) และ JSON Backup/Restore
- 💬 **แจ้งเตือน LINE OA (Flex Message)**: ส่งสรุปบิลยาเข้า LINE Chatbot อัตโนมัติเมื่อบันทึกข้อมูลสำเร็จ

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, @google/genai SDK
- **AI Models**: Gemini 3.8 Flash พร้อมระบบลดหลั่นอัตโนมัติ (gemini-3.1-flash-lite, gemini-flash-latest, gemini-2.5-flash)
- **Database & Cloud Storage**:
  - Google Sheets: แผ่นงาน `"บิล Invoice"` (ID: `1ogoM0vXPndiRcjNgbkN3Bsitd5JTcoT4rsj7hkerZqQ`)
  - Google Drive: โฟลเดอร์ `"Inventory_OCR_Uploads(ไฟล์ย่อย)"` (ID: `1_cwXmxuHj5enUq3VWNSWDlXTz_JpnwlY`)
  - Google Apps Script: Web App Backend API
- **Messaging**: LINE Messaging API (LINE OA Flex Message)

---

## 🚀 การติดตั้งและเริ่มใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server (Port 3000)
npm run dev

# Build สำหรับ Production
npm run build

# Start Production Server
npm start
```

---

## ⚙️ ตัวแปรสภาพแวดล้อม (.env)

```env
# Gemini API Key (จำเป็นสำหรับ AI OCR)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# LINE OA Messaging API Channel Access Token (สำหรับการแจ้งเตือน Flex Message)
LINE_CHANNEL_ACCESS_TOKEN=""

# Google Apps Script Web App URL (สำหรับการซิงค์ Drive และ Sheets จริง)
GAS_WEBAPP_URL=""
```
