import fs from 'fs';
import path from 'path';

export function order_declined_email_html({ saleId, buyerName, reason }: { saleId: string; buyerName?: string; reason: string }) {
  const tplPath = path.join(__dirname, './files/order_declined_email.html');
  let html = fs.readFileSync(tplPath, 'utf-8');
  const safeName = buyerName && buyerName.trim() ? buyerName : 'Cliente';
  const safeReason = reason && reason.trim() ? reason : 'Motivo no especificado';
  html = html.replace(/\{\{buyer_name\}\}/g, safeName);
  html = html.replace(/\{\{sale_id\}\}/g, String(saleId));
  html = html.replace(/\{\{reason\}\}/g, safeReason);
  html = html.replace(/\{\{year\}\}/g, String(new Date().getFullYear()));
  return html;
}
