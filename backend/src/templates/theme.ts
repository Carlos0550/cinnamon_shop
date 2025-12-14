export type BusinessData = {
  name: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
}

export type PaletteData = {
  colors: string[];
}

export function applyTheme(html: string, business?: BusinessData | null, palette?: PaletteData | null) {
  // Default Business Info
  const businessName = business?.name || "Tienda online";
  const businessAddress = business?.address || "";
  const businessCity = business?.city || "";
  const businessState = business?.state || "";
  const businessEmail = business?.email || "";
  const businessPhone = business?.phone || "";

  // Default Palette (Kuromi / Original)
  // 0: Lightest, 9: Darkest
  // We need to map these to our placeholders
  
  const colors = palette?.colors || [
    '#F3E8FF', // 0: bg
    '#F3E8FF', // 1
    '#F3E8FF', // 2
    '#F3E8FF', // 3
    '#F3E8FF', // 4
    '#FF6DAA', // 5: button bg?
    '#FF6DAA', // 6: primary
    '#BBBBBB', // 7: muted
    '#6D28D9', // 8: header bg
    '#2B2B2B'  // 9: text main / footer bg
  ];

  // Logic to determine if palette is light or dark could be complex, 
  // but let's map based on the user's provided example which seems to be light-to-dark (0 to 9).
  
  // If we assume the palette is 0=Light -> 9=Dark.
  const c = colors;
  
  // We need to decide if the card should be light or dark.
  // The original design had a Dark Card (#2B2B2B) on Light BG (#F3E8FF).
  // If we want to strictly follow the palette, we might end up with Light Card on Light BG if we aren't careful.
  
  // Let's try to infer high contrast.
  
  const bg = c[0]; // Lightest
  const headerBg = c[8]; // Dark
  const headerText = c[0]; // Light text on Dark Header
  
  const cardBg = c[1] || '#ffffff'; // Slightly darker than bg, or just white? 
  // Original was Dark Card. If we want to modernize/standardize, maybe Light Card is safer for most palettes.
  // But let's stick to the requested "active shop palette".
  
  // If the user selects "Rosados y Blancos":
  // 0: #FCE4EC (Very Light Pink) -> BG
  // 9: #560027 (Very Dark Pink) -> Text
  
  // Let's use a Light Theme approach for general compatibility:
  // BG: c[0]
  // Card: White or c[1]
  // Text: c[9]
  // Primary: c[6]
  // Header: c[8]
  
  const replacements: Record<string, string> = {
    '{{color_bg}}': c[0],
    '{{color_header_bg}}': c[8],
    '{{color_header_text}}': '#FFFFFF', // Assuming dark header usually. Or use c[0]
    '{{color_card_bg}}': '#FFFFFF', // Safer to use white for card background with colored text
    '{{color_inner_card_bg}}': c[0], // Light bg for inner sections
    '{{color_primary}}': c[6],
    '{{color_text_main}}': c[9],
    '{{color_text_muted}}': c[7],
    '{{color_button_bg}}': c[8], // Dark button
    '{{color_button_text}}': '#FFFFFF',
    '{{color_footer_bg}}': c[9],
    '{{color_footer_text}}': c[2] || '#CCCCCC',
    '{{color_table_header_bg}}': c[2],
    
    '{{business_name}}': businessName,
    '{{business_address}}': businessAddress,
    '{{business_city}}': businessCity,
    '{{business_state}}': businessState,
    '{{business_email}}': businessEmail,
    '{{business_phone}}': businessPhone,
    '{{year}}': String(new Date().getFullYear())
  };

  let output = html;
  for (const [key, value] of Object.entries(replacements)) {
    // Replace all occurrences
    output = output.split(key).join(value);
  }
  return output;
}
