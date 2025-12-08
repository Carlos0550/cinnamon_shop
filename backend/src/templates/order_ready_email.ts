import fs from 'fs';
import path from 'path';

export function order_ready_email_html({ saleId, buyerName, payment_method }: { saleId: string; buyerName?: string; payment_method: string }) {
  const tplPath = path.join(__dirname, './files/order_ready_email.html');
  let html = fs.readFileSync(tplPath, 'utf-8');
  const safeName = buyerName && buyerName.trim() ? buyerName : 'Cliente';
  const isLocal = String(payment_method).toUpperCase() === 'EN_LOCAL';
  const mapsUrl = 'https://www.google.com/maps/@-27.4622582,-55.7443897,21z?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D';
  const infoMessage = isLocal
    ? 'Tu pedido está listo para ser retirado en nuestro local ubicado entre Av. Roque Gonzales y Roque Sáenz Peña.'
    : 'Pronto recibirás la información de envío.';
  const actionButton = isLocal
    ? `<div style="text-align:center; margin:22px 0;">
         <a href="${mapsUrl}" target="_blank"
            style="display:inline-block; background:#000000; color:#FF6DAA; text-decoration:none; padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
           Ver en Google Maps
         </a>
       </div>`
    : '';

  html = html.replace(/\{\{buyer_name\}\}/g, safeName);
  html = html.replace(/\{\{sale_id\}\}/g, String(saleId));
  html = html.replace(/\{\{info_message\}\}/g, infoMessage);
  html = html.replace(/\{\{action_button\}\}/g, actionButton);
  html = html.replace(/\{\{year\}\}/g, String(new Date().getFullYear()));
  return html;
}
