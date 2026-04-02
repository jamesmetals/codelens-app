/**
 * Vercel Serverless Function: POST /api/generate-summary
 *
 * Recebe { title, code } no body e retorna { summary }.
 * A GROQ_API_KEY fica nas variáveis de ambiente do Vercel — nunca exposta ao browser.
 */
export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GROQ_API_KEY não configurada no servidor. Adicione-a nas variáveis de ambiente do Vercel.',
    });
  }

  const { title = '', code = '' } = req.body || {};

  if (!title && !code) {
    return res.status(400).json({ error: 'Forneça ao menos um título ou conteúdo para gerar o resumo.' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente técnico de estudos. Responda SEMPRE em português brasileiro. Seja objetivo e técnico.',
          },
          {
            role: 'user',
            content: `Escreva um resumo técnico e objetivo de 1 a 2 frases sobre o seguinte conteúdo de estudo.\n\nTítulo: "${title}"\n\nConteúdo:\n${code.slice(0, 3000)}\n\nResponda APENAS com o texto do resumo, sem prefixos como "Resumo:" ou aspas.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Erro Groq: ${groqRes.status}`;
      return res.status(groqRes.status).json({ error: msg });
    }

    const data = await groqRes.json();
    const summary = data.choices?.[0]?.message?.content?.trim() ?? '';
    return res.status(200).json({ summary });

  } catch (err) {
    console.error('[generate-summary] Erro:', err);
    return res.status(500).json({ error: err.message || 'Erro interno ao gerar resumo.' });
  }
}
