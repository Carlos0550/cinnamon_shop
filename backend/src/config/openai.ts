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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza estas imágenes de producto y genera:
              1. Un título corto y profesional (sin emojis, sin guiones, máximo 50 caracteres)
              2. Una descripción persuasiva y profesional (máximo 300 caracteres)
              
              Detecta marcas, detalles, instrucciones, ingredientes, características, etc. 
              Responde ÚNICAMENTE en formato JSON válido sin markdown, sin \`\`\`json, solo el objeto JSON puro con las claves "title" y "description".
              
              Ejemplo de respuesta:
              {
                "title": "Producto Premium de Alta Calidad",
                "description": "Producto excepcional con características únicas que ofrece la mejor experiencia para el usuario. Calidad garantizada y resultados profesionales."
              }`
            },
            ...imageMessages
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
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
    return {
      title: 'Producto Generado por IA',
      description: 'Descripción generada automáticamente. Por favor, revise y edite según sea necesario.'
    };
  }
};

export { openai };