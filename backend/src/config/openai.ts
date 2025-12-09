import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.openai_api_key,
});

export const analyzeProductImages = async (imageUrls: string[]): Promise<{ title: string; description: string }> => {
  try {
    const imageMessages = imageUrls.map(url => ({
      type: "image_url" as const,
      image_url: {
        url: url,
        detail: "high" as const
      }
    }));
    const systemPrompt = `
      Actúa como un generador experto de contenido para productos de e-commerce. Analiza exclusivamente las imágenes proporcionadas y produce dos campos:

      1. title  
        - Título corto, profesional y atractivo  
        - Máximo 50 caracteres  
        - Sin guiones  
        - Sin emojis  

      2. description  
        - Texto persuasivo y profesional orientado a conversión  
        - Máximo 300 caracteres  
        - Puede incluir entre 0 y 4 emojis (no más)  
        - Destaca beneficios, sensación de calidad o motivos para comprar  
        - Evita palabras como “básico”, “común” o equivalentes

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
      - Verifica que la descripción ≤ 300 caracteres.  
      - Verifica que la descripción contiene 0–4 emojis.  
      - Verifica que no se agregaron elementos no visibles.  
      - Verifica que el JSON es válido.  
      - Verifica que no se incluyó información sobre elementos biológicos humanos.  
      Si alguna regla falla, corrige silenciosamente antes de responder.

      - Asegurate que la descripción tenga un tono natural, como si no hubiera sido generado por IA.
      - Si la imagen contiene una marca de producto, intenta incluir el nombre de la marca en la descripción, esto asegura que el producto se sienta legítimo y seguro.
      - En lo posible, intenta usar palabras claves para el SEO del producto, especialmente en el titulo del producto.
      **Formato de salida**  
      Responde exclusivamente con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones:
      {
        "title": "...",
        "description": "..."
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
            text: "Analiza estas imágenes y genera título y descripción."
          },
          ...imageMessages
        ]
      }
    ],
    max_tokens: 500,
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
    const description = parsed.description?.substring(0, 300) || 'Descripción generada automáticamente por IA.';

    return { title, description };
  } catch (error) {
    console.error('Error al analizar imágenes con OpenAI:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export { openai };
