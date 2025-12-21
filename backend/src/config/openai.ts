import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.openai_api_key;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY no está configurada. Es obligatoria para el funcionamiento del sistema.');
  console.error('   Configura OPENAI_API_KEY en tus variables de entorno.');
  throw new Error('OPENAI_API_KEY is required. Please set OPENAI_API_KEY environment variable.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const analyzeProductImages = async (imageUrls: string[], additionalContext?: string): Promise<{ title: string; description: string; options: { name: string; values: string[] }[] }> => {
  try {
    const imageMessages = imageUrls.map(url => ({
      type: "image_url" as const,
      image_url: {
        url: url,
        detail: "high" as const
      }
    }));
    const systemPrompt = `
      Actúa como un generador experto de contenido para productos de e-commerce. Analiza exclusivamente las imágenes proporcionadas y produce tres campos:

      1. title  
        - Título corto, profesional y atractivo  
        - Máximo 50 caracteres  
        - Sin guiones  
        - Sin emojis  

      2. description  
        - Texto persuasivo y profesional orientado a conversión  
        - Máximo 600 caracteres  
        - Puede incluir entre 0 y 8 emojis (no más)  
        - Destaca beneficios, sensación de calidad o motivos para comprar, ingredientes, formas de usar el producto
        - Evita palabras como “básico”, “común” o equivalentes

      3. options
        - Array de objetos con "name" (ej: "Color", "Talle", "Material") y "values" (ej: ["Rojo", "Azul"]).
        - Detecta variaciones visibles o inferidas del contexto adicional (ej: si dice "tenemos rojo y azul", genera la opción Color).
        - Si no hay opciones claras, devuelve un array vacío [].
        - Si se detectan colores, intenta usar nombres de colores estándar.
        - Si se detectan talles, intenta usar S, M, L, XL, etc.

      **Reglas estrictas de interpretación**  
      - Describe únicamente elementos que puedan verse con claridad en las imágenes.  
      - No inventes características, funciones o ingredientes.  
      - Si la imagen no permite identificar el producto, utilice términos neutros (“accesorio”, “artículo”, “producto cosmético”, “producto de uso diario”).  
      - Asume SIEMPRE que se trata de un producto de e-commerce.  
      - No describas carne, sangre, piel humana real, heridas, órganos ni elementos biológicos ajenos a productos.  
      - Describe únicamente elementos visibles de las imágenes, excepto textos o etiquetas que mencionen términos biológicos humanos (ej.: “cabello humano”, “uñas humanas”, “human hair”, “human nail”). Ignora completamente esos términos y no los incluyas en el título ni en la descripción.
      - Si el empaque muestra textos como “cabello humano”, "uñas humanas" no puedes mencionarlo (ej.: pestañas, extensiones, pelucas).
      - Evita lenguaje perturbador o grotesco.  
      - Mantén un tono profesional y respetuoso.

      **Validación interna obligatoria antes de responder (no la reveles):**  
      - Verifica que el título ≤ 50 caracteres y no tiene guiones ni emojis.  
      - Verifica que la descripción ≤ 600 caracteres.  
      - Verifica que la descripción contiene 0–8 emojis.  
      - Verifica que no se agregaron elementos no visibles.  
      - Verifica que el JSON es válido.  
      - Verifica que no se incluyó información sobre elementos biológicos humanos.  
      - Si alguna regla falla, corrige silenciosamente antes de responder.

      - Asegurate que la descripción tenga un tono natural, como si no hubiera sido generado por IA.
      - Si la imagen contiene una marca de producto, intenta incluir el nombre de la marca en la descripción, esto asegura que el producto se sienta legítimo y seguro.
      - En lo posible, intenta usar palabras claves para el SEO del producto, especialmente en el titulo del producto.
      **Formato de salida**  
      Responde exclusivamente con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones:
      {
        "title": "...",
        "description": "...",
        "options": [{ "name": "...", "values": ["...", "..."] }]
      }
    `;
    const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza estas imágenes y genera título, descripción y opciones de compra.${additionalContext ? `\n\nContexto adicional del usuario (ÚSALO PARA MEJORAR LA DESCRIPCIÓN, EL TÍTULO Y DETECTAR OPCIONES): ${additionalContext}` : ''}`
          },
          ...imageMessages
        ]
      }
    ],
    temperature: 0.0
  });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Remove markdown formatting if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonContent);
    
    const title = parsed.title?.substring(0, 50) || 'Producto Generado por IA';
    const description = parsed.description?.substring(0, 700) || 'Descripción generada automáticamente por IA.';
    const options = Array.isArray(parsed.options) ? parsed.options : [];

    return { title, description, options };
  } catch (error) {
    console.error('Error al analizar imágenes con OpenAI:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export { openai };

export const generatePaletteFromPrompt = async (prompt: string): Promise<{ name: string; colors: string[] }> => {
  const systemPrompt = `
Eres un diseñador experto en color y sistemas de diseño UI.

Tu tarea es generar una paleta de 10 colores HEX (shades 0 a 9) compatible con Mantine, basada en la descripción del usuario.

REGLAS FUNDAMENTALES:
- Detecta la familia cromática principal solicitada por el usuario.
- Todos los colores de la paleta deben pertenecer claramente a esa familia cromática.
- Mantén el mismo matiz base a lo largo de toda la paleta.
- La variación entre shades debe lograrse principalmente ajustando lightness y saturación, no el hue.
- No reinterpretar ni “desplazar” el color hacia otra familia por razones estéticas.

PROGRESIÓN DE SHADES:
- colors[0] debe ser el tono más claro.
- colors[9] debe ser el tono más oscuro.
- La transición debe ser gradual, coherente y usable en UI.

CALIDAD UI:
- La paleta debe ser armónica, legible y adecuada para interfaces modernas.
- Evita extremos inutilizables (demasiado grisáceo, demasiado saturado o sin contraste funcional).

FORMATO DE SALIDA:
- Responder SOLO JSON válido.
- Claves exactas: name (string corto) y colors (array de 10 strings HEX).
- El array colors debe contener exactamente 10 valores HEX.
- No incluir texto adicional, comentarios ni markdown.

Formato EXACTO:
{"name":"...","colors":["#......","#......","#......","#......","#......","#......","#......","#......","#......","#......"]}
`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: [{ type: "text", text: `Genera una paleta según: ${prompt}` }] as any },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });
  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("No se recibió respuesta de OpenAI");
  let jsonContent = content;
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const parsed = JSON.parse(jsonContent);
  const name = typeof parsed.name === 'string' && parsed.name.length ? parsed.name.slice(0, 30) : 'generated';
  const colors = Array.isArray(parsed.colors) ? parsed.colors : [];
  if (colors.length !== 10 || !colors.every((c: any) => typeof c === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c))) {
    throw new Error('La paleta generada no es válida');
  }
  return { name, colors };
};

export const generateBusinessDescription = async (name: string, city: string, type: string = "e-commerce"): Promise<string> => {
  const systemPrompt = `
    Eres un especialista senior en SEO local y redacción comercial para negocios digitales.

    Tu tarea es generar una descripción profesional, clara y optimizada para SEO.

    Reglas estrictas:
    - La descripción DEBE tener entre 150 y 200 caracteres (ni más ni menos).
    - Debe incluir el nombre del negocio de forma natural.
    - Si se proporciona una ubicación válida, debe mencionarse una sola vez.
    - Debe describir claramente qué ofrece el negocio y su propuesta de valor.
    - Usa palabras clave relevantes para el tipo de negocio, integradas de forma natural (sin listas).
    - Prioriza SEO local y términos transaccionales cuando aplique.
    - Tono profesional y confiable.
    - No uses emojis.
    - No repitas frases genéricas ni relleno comercial vacío.

    Devuelve SOLO el texto final, sin comillas, títulos ni etiquetas.
    `;


  
  const userPrompt = `
    Nombre del negocio: ${name}
    Ubicación: ${city || "No especificada"}
    Tipo de negocio: ${type || "No especificado"}

    Genera la descripción cumpliendo estrictamente las reglas indicadas.
    `;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("No se recibió respuesta de OpenAI");
  
  return content;
};
