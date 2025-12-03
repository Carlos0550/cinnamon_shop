export function order_ready_email_html({ saleId, buyerName, payment_method }: { saleId: string; buyerName?: string; payment_method: string }) {
  const safeName = buyerName && buyerName.trim() ? buyerName : 'Cliente';
  const mapsUrl = 'https://www.google.com/maps/@-27.4622582,-55.7443897,21z?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D';
  const localMsg = `Tu pedido está listo para ser retirado en nuestro local ubicado entre Av. Roque Gonzales y Roque Sáenz Peña.`;
  const isLocal = String(payment_method).toUpperCase() === 'EN_LOCAL';
  const actionButton = isLocal
    ? `<div style="text-align:center; margin:22px 0;">
         <a href="${mapsUrl}" target="_blank"
            style="display:inline-block; background:#000000; color:#FF6DAA; text-decoration:none; padding:12px 20px; border-radius:999px; font-weight:600; font-size:14px;">
           Ver en Google Maps
         </a>
       </div>`
    : '';
  return `<!DOCTYPE html>
  <html lang="es"><head><meta charset="UTF-8" /><title>Tu pedido está listo</title></head>
  <body style="margin:0; padding:0; background:#1F1F1F; font-family:Segoe UI, Arial, sans-serif; color:#EEE;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <h1 style="margin:0 0 12px; font-size:22px; color:#FF6DAA;">Tu pedido está listo</h1>
      <p style="margin:0 0 10px; font-size:14px;">Hola ${safeName}, tu orden #${saleId} está procesada.</p>
      ${isLocal ? `<p style="margin:0 0 10px; font-size:14px;">${localMsg}</p>` : `<p style="margin:0 0 10px; font-size:14px;">Pronto recibirás la información de envío.</p>`}
      ${actionButton}
      <p style="margin:16px 0 0; font-size:12px; color:#AAA;">Gracias por comprar en Cinnamon.</p>
    </div>
  </body></html>`;
}
