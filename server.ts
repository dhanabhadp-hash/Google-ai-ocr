import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
const openRouterApiKey = (process.env.OPENROUTER_API_KEY || '').trim();
const openRouterModel = (process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash').trim();
const ai = geminiApiKey ? new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
}) : null;

function analyzeVat(subtotal: number, grandTotal: number, vatAmount: number) {
  const expectedVat = Math.round(subtotal * 0.07 * 100) / 100;
  const expectedGrand = Math.round((subtotal + expectedVat) * 100) / 100;

  if (Math.abs(grandTotal - expectedGrand) < 1) {
    return { status: 'INCLUDED_7_PERCENT', rate: 7, note: 'บิลรวมภาษีมูลค่าเพิ่ม 7% ถูกต้อง', isCompliant: true };
  }
  if (vatAmount > 0 && Math.abs(vatAmount - Math.round((grandTotal * 7 / 107) * 100) / 100) < 1) {
    return { status: 'INCLUDED_7_PERCENT', rate: 7, note: 'ราคารวมภาษีมูลค่าเพิ่ม 7% ไว้ในตัวแล้ว', isCompliant: true };
  }
  if (Math.abs(grandTotal - subtotal) < 1 && vatAmount === 0) {
    return { status: 'ZERO_OR_EXEMPT', rate: 0, note: 'รายการไม่คิดภาษีหรือได้รับการยกเว้น VAT', isCompliant: true };
  }
  return { status: 'MISMATCH', rate: 7, note: 'ยอดรวมอาจคลาดเคลื่อน กรุณาตรวจสอบกับเอกสารต้นฉบับ', isCompliant: false };
}

function responseText(response: any): string {
  if (typeof response?.text === 'string') return response.text;
  return response?.candidates?.flatMap((candidate: any) => candidate?.content?.parts || [])
    .map((part: any) => part?.text || '').join('');
}

function parseJson(text: string): any {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function callGemini(contents: any, config: any) {
  if (!ai) throw new Error('GEMINI_API_KEY is not configured');
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError: any;

  for (const model of models) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        ai.models.generateContent({ model, contents, config }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Gemini OCR timeout')), 45000);
        }),
      ]);
      if (responseText(result).trim()) return result;
      lastError = new Error(`Gemini model ${model} returned an empty response`);
    } catch (error: any) {
      lastError = error;
      const message = String(error?.message || error);
      const status = Number(error?.status || error?.code);
      if ([400, 401, 403].includes(status) || /API key|UNAUTHENTICATED|key not valid|PERMISSION_DENIED/i.test(message)) {
        throw error;
      }
      console.warn(`[Gemini OCR] ${model} failed; trying next model:`, message);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  throw lastError || new Error('Gemini OCR ไม่สามารถประมวลผลเอกสารได้');
}

async function callOpenRouter(base64: string, mimeType: string, prompt: string): Promise<string> {
  if (!openRouterApiKey) throw new Error('OPENROUTER_API_KEY is not configured');
  // OpenRouter vision inputs use image data URLs. PDF support varies by model/provider,
  // so do not pass a PDF as an image and risk silently producing incorrect OCR.
  if (!mimeType.startsWith('image/')) {
    throw new Error('OpenRouter fallback รองรับเฉพาะไฟล์ภาพ; PDF ต้องใช้ Gemini หรือแปลงเป็นภาพก่อน');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'Google AI OCR',
      },
      body: JSON.stringify({
        model: openRouterModel,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        }],
      }),
    });
    const body: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage = body?.error?.message || body?.message || `HTTP ${response.status}`;
      throw new Error(`OpenRouter ${openRouterModel}: ${providerMessage}`);
    }
    const content = body?.choices?.[0]?.message?.content;
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part: any) => part?.text || '').join('')
        : '';
    if (!text.trim()) throw new Error('OpenRouter returned an empty response');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

const ocrSystemPrompt = `คุณคือ AI OCR สำหรับเอกสารใบสั่งซื้อ/ใบแจ้งหนี้ยา สกัดข้อมูลจากไฟล์แนบตามที่เห็นจริงเท่านั้น ห้ามเดาหรือสร้างข้อมูลขึ้นเอง หากไม่พบให้ใช้ string ว่างหรือ 0 และห้ามใช้ข้อมูลจากชื่อไฟล์แทนข้อมูลในเอกสาร
ตอบเป็น JSON เท่านั้น ไม่มี Markdown ตาม schema นี้:
{"invoiceNo":"","companyName":"","taxId":"","invoiceDate":"YYYY-MM-DD","salesperson":"","subtotal":0,"vatAmount":0,"grandTotal":0,"items":[{"gpuCode":"","tpuCode":"","productName":"","genericName":"","unit":"","quantity":0,"unitPrice":0,"totalPrice":0}],"rawNotes":""}
แปลงวันที่ พ.ศ. เป็น ค.ศ. ระบุหน่วยนับตามที่พบบนบิล และอย่าสร้างรหัส GPU/TPU หากไม่มีในเอกสาร`;

app.post('/api/ocr', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileBase64, mimeType, fileName } = req.body || {};
    if (typeof fileBase64 !== 'string' || !fileBase64 || typeof mimeType !== 'string' || !mimeType) {
      res.status(400).json({ success: false, error: 'กรุณาส่ง fileBase64 และ mimeType' });
      return;
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
    if (!cleanBase64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      res.status(400).json({ success: false, error: 'ข้อมูลไฟล์ Base64 ไม่ถูกต้อง' });
      return;
    }
    if (!mimeType.startsWith('image/') && mimeType !== 'application/pdf') {
      res.status(415).json({ success: false, error: 'รองรับเฉพาะไฟล์ภาพและ PDF' });
      return;
    }

    const prompt = `${ocrSystemPrompt}\n\nสกัดข้อมูลจากเอกสารนี้อย่างละเอียด ชื่อไฟล์: ${String(fileName || 'invoice').slice(0, 200)}`;
    let provider: 'gemini' | 'openrouter';
    let rawText = '';
    let geminiError: any;

    // Gemini is the primary provider. On failure (or missing Gemini key), try OpenRouter.
    if (ai) {
      try {
        const result = await callGemini([
          { role: 'user', parts: [{ inlineData: { mimeType, data: cleanBase64 } }, { text: prompt }] },
        ], { responseMimeType: 'application/json', temperature: 0.1 });
        rawText = responseText(result);
        provider = 'gemini';
      } catch (error: any) {
        geminiError = error;
        console.warn('[OCR] Gemini failed; attempting OpenRouter fallback:', error?.message || error);
      }
    } else {
      geminiError = new Error('GEMINI_API_KEY is not configured');
      console.warn('[OCR] GEMINI_API_KEY is missing; attempting OpenRouter fallback');
    }

    if (!rawText.trim()) {
      if (!openRouterApiKey) {
        if (ai && geminiError) throw geminiError;
        res.status(503).json({
          success: false,
          error: 'ไม่พบ GEMINI_API_KEY หรือ OPENROUTER_API_KEY ที่ใช้งานได้ใน environment ของเซิร์ฟเวอร์',
        });
        return;
      }
      try {
        rawText = await callOpenRouter(cleanBase64, mimeType, prompt);
        provider = 'openrouter';
      } catch (openRouterError: any) {
        const geminiMessage = geminiError?.message || 'ไม่ได้ตั้งค่า Gemini API key';
        const openRouterMessage = openRouterError?.message || 'OpenRouter OCR failed';
        throw new Error(`OCR ไม่สำเร็จจากทั้งสองผู้ให้บริการ (Gemini: ${geminiMessage}; OpenRouter: ${openRouterMessage})`);
      }
    }

    const parsed = parseJson(rawText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`${provider!} ส่งผลลัพธ์ว่างหรือ JSON ไม่ถูกต้อง กรุณาลองใหม่`);
    }

    const money = (value: unknown) => {
      const numeric = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    };
    const subtotal = money(parsed.subtotal);
    const grandTotal = money(parsed.grandTotal);
    const vatAmount = money(parsed.vatAmount);
    const items = Array.isArray(parsed.items) ? parsed.items.map((item: any) => ({
      gpuCode: String(item?.gpuCode || ''),
      tpuCode: String(item?.tpuCode || ''),
      productName: String(item?.productName || ''),
      genericName: String(item?.genericName || ''),
      unit: String(item?.unit || ''),
      quantity: money(item?.quantity),
      unitPrice: money(item?.unitPrice),
      totalPrice: money(item?.totalPrice),
    })) : [];

    res.json({
      success: true,
      data: {
        invoiceNo: String(parsed.invoiceNo || ''),
        companyName: String(parsed.companyName || ''),
        taxId: String(parsed.taxId || ''),
        invoiceDate: String(parsed.invoiceDate || ''),
        salesperson: String(parsed.salesperson || ''),
        subtotal,
        vatAmount,
        grandTotal,
        vatAnalysis: analyzeVat(subtotal, grandTotal, vatAmount),
        items,
        rawNotes: String(parsed.rawNotes || ''),
        authNotice: provider === 'openrouter' ? `ประมวลผลด้วย OpenRouter (${openRouterModel}) เนื่องจาก Gemini ใช้งานไม่ได้` : '',
        provider,
      },
    });
  } catch (error: any) {
    console.error('Error during OCR processing:', error);
    const message = String(error?.message || 'เกิดข้อผิดพลาดในการประมวลผล OCR');
    const status = Number(error?.status || error?.code);
    res.status([400, 401, 403, 429].includes(status) ? status : 502).json({ success: false, error: message });
  }
});

app.post('/api/line/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, invoiceSummary } = req.body;
    const channelToken = token || process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelToken) {
      res.status(400).json({ success: false, error: 'กรุณาระบุ LINE Channel Access Token เพื่อส่งการแจ้งเตือน' });
      return;
    }
    if (!invoiceSummary || typeof invoiceSummary !== 'object') {
      res.status(400).json({ success: false, error: 'ข้อมูล invoiceSummary ไม่ถูกต้อง' });
      return;
    }
    const { invoiceNo, companyName, grandTotal, itemCount, vatStatus, date, driveUrl } = invoiceSummary;
    const payload = {
      to: req.body.toUserId || undefined,
      messages: [{ type: 'text', text: `บันทึกบิลคลังยาสำเร็จ\nเลขที่บิล: ${invoiceNo || '-'}\nผู้จำหน่าย: ${companyName || '-'}\nวันที่: ${date || '-'}\nจำนวนรายการ: ${itemCount || 1}\nยอดรวม: ฿${Number(grandTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}\nVAT: ${vatStatus || 'ตรวจสอบแล้ว'}\nDrive: ${driveUrl || '-'}` }],
    };
    const endpoint = req.body.toUserId ? 'https://api.line.me/v2/bot/message/push' : 'https://api.line.me/v2/bot/message/broadcast';
    const lineResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${channelToken}` },
      body: JSON.stringify(payload),
    });
    const result = await lineResponse.json().catch(() => ({}));
    if (!lineResponse.ok) {
      res.status(lineResponse.status).json({ success: false, error: result.message || 'เกิดข้อผิดพลาดในการส่ง LINE Message API', details: result });
      return;
    }
    res.json({ success: true, message: 'ส่งการแจ้งเตือน LINE สำเร็จ', result });
  } catch (error: any) {
    console.error('Error sending LINE message:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to send LINE notification' });
  }
});

app.post('/api/gas/proxy', async (req: Request, res: Response): Promise<void> => {
  try {
    const { webAppUrl, payload } = req.body;
    const targetUrl = webAppUrl || process.env.GAS_WEBAPP_URL;
    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'กรุณาระบุ URL ของ Google Apps Script Web App ในการตั้งค่า' });
      return;
    }
    const gasResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await gasResponse.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { text }; }
    res.json({ success: gasResponse.ok, data });
  } catch (error: any) {
    console.error('GAS proxy error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Error communicating with Google Apps Script' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'OCR INV. คลังยา รพ.สบปราบ',
    geminiConfigured: Boolean(geminiApiKey),
    openRouterConfigured: Boolean(openRouterApiKey),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => res.sendFile(path.resolve(__dirname, 'dist/index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${PORT}`));
}

startServer();
