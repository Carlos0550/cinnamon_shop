export function order_declined_email_html({ saleId, buyerName, reason }: { saleId: string; buyerName?: string; reason: string }) {
  const safeName = buyerName && buyerName.trim() ? buyerName : 'Cliente';
  const safeReason = reason.trim() || 'Motivo no especificado';
  return `<!DOCTYPE html>
  <html lang="es"><head><meta charset="UTF-8" /><title>Tu orden fue declinada</title></head>
  <body style="margin:0; padding:0; background:#1F1F1F; font-family:Segoe UI, Arial, sans-serif; color:#EEE;">
    <div style="max-width:640px; margin:0 auto; padding:24px;">
      <h1 style="margin:0 0 12px; font-size:22px; color:#FF6DAA;">Tu orden fue declinada</h1>
      <p style="margin:0 0 10px; font-size:14px;">Hola ${safeName}, lamentamos informarte que tu orden #${saleId} fue declinada.</p>
      <p style="margin:0 0 10px; font-size:14px;">Motivo: <strong>${safeReason}</strong></p>
      <p style="margin:16px 0 0; font-size:12px; color:#AAA;">Si tienes dudas, responde este correo y te ayudaremos.</p>
    </div>
  </body></html>`;
}
