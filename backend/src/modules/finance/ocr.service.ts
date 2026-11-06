import Tesseract from 'tesseract.js';

export async function parseReceiptImage(imageUrl: string) {
  const { data } = await Tesseract.recognize(imageUrl, 'spa');
  const text = data.text || '';
  const amtMatch = text.match(/(?:total|monto|amount)[:\s]*\$?\s*([\d\.,]+)/i);
  const refMatch = text.match(/(?:ref|referencia|nro)[:\s]*([A-Za-z0-9-]{4,})/i);
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  return { text, amount: amtMatch ? amtMatch[1] : null, reference: refMatch ? refMatch[1] : null, date: dateMatch ? dateMatch[1] : null };
}

export function parseBankNotification(text: string) {
  const amtMatch = text.match(/(?:acreditado|abono|credito)[:\s]*\$?\s*([\d\.,]+)/i);
  const refMatch = text.match(/(?:ref|referencia)[:\s]*([A-Za-z0-9-]{4,})/i);
  return { amount: amtMatch ? amtMatch[1] : null, reference: refMatch ? refMatch[1] : null };
}