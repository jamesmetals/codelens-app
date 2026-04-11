/**
 * Vercel Serverless Function: POST /api/generate-summary
 *
 * Recebe { title, code } no body e retorna { summary }.
 * A GROQ_API_KEY fica nas variaveis de ambiente do servidor.
 */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_TITLE_LENGTH = 160;
const MAX_CODE_LENGTH = 12_000;

const rateLimitStore = globalThis.__codelensSummaryRateLimit || new Map();
globalThis.__codelensSummaryRateLimit = rateLimitStore;

function getHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(req) {
  const forwardedFor = String(getHeader(req, "x-forwarded-for") || "").trim();
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return String(req.socket?.remoteAddress || "unknown");
}

function getExpectedOrigin(req) {
  const configuredOrigin = String(process.env.ALLOWED_ORIGIN || "").trim().replace(/\/+$/, "");
  if (configuredOrigin) {
    return configuredOrigin;
  }

  const host = String(getHeader(req, "x-forwarded-host") || getHeader(req, "host") || "").trim();
  if (!host) {
    return "";
  }

  const protocol = String(getHeader(req, "x-forwarded-proto") || "https").trim();
  return `${protocol}://${host}`;
}

function getRequestOrigin(req) {
  const origin = String(getHeader(req, "origin") || "").trim().replace(/\/+$/, "");
  if (origin) {
    return origin;
  }

  const referer = String(getHeader(req, "referer") || "").trim();
  if (!referer) {
    return "";
  }

  try {
    return new URL(referer).origin.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function isAllowedOrigin(req) {
  const expectedOrigin = getExpectedOrigin(req);
  const requestOrigin = getRequestOrigin(req);

  if (!expectedOrigin || !requestOrigin) {
    return false;
  }

  return requestOrigin === expectedOrigin;
}

function parsePayload(body) {
  if (!body) return {};

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (typeof body === "object") {
    return body;
  }

  return null;
}

function setRateLimitHeaders(res, state) {
  res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, state.remaining)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));
}

function applyRateLimit(ipAddress) {
  const now = Date.now();

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(ipAddress);

  if (!current || current.resetAt <= now) {
    const nextState = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      ok: true,
    };

    rateLimitStore.set(ipAddress, nextState);
    return nextState;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      ...current,
      remaining: 0,
      ok: false,
    };
  }

  current.count += 1;
  current.remaining = RATE_LIMIT_MAX_REQUESTS - current.count;
  current.ok = true;
  return current;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origem nao autorizada." });
  }

  const rateLimitState = applyRateLimit(getClientIp(req));
  setRateLimitHeaders(res, rateLimitState);

  if (!rateLimitState.ok) {
    return res.status(429).json({ error: "Limite temporario atingido. Tente novamente em instantes." });
  }

  const contentType = String(getHeader(req, "content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return res.status(415).json({ error: "Envie o corpo em JSON." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY nao configurada no servidor. Adicione-a nas variaveis de ambiente do Vercel.",
    });
  }

  const payload = parsePayload(req.body);
  if (!payload || Array.isArray(payload)) {
    return res.status(400).json({ error: "Corpo da requisicao invalido." });
  }

  const rawTitle = String(payload.title || "");
  const rawCode = String(payload.code || "");

  if (rawTitle.length > MAX_TITLE_LENGTH || rawCode.length > MAX_CODE_LENGTH) {
    return res.status(413).json({ error: "Conteudo maior do que o permitido para gerar o resumo." });
  }

  const title = rawTitle.trim();
  const code = rawCode.trim();

  if (!title && !code) {
    return res.status(400).json({ error: "Forneca ao menos um titulo ou conteudo para gerar o resumo." });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Voce e um assistente tecnico de estudos. Responda SEMPRE em portugues brasileiro. Seja objetivo e tecnico.",
          },
          {
            role: "user",
            content: `Escreva um resumo tecnico e objetivo de 1 a 2 frases sobre o seguinte conteudo de estudo.\n\nTitulo: "${title}"\n\nConteudo:\n${code.slice(0, 3000)}\n\nResponda APENAS com o texto do resumo, sem prefixos como "Resumo:" ou aspas.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      const message = errBody?.error?.message || `Erro Groq: ${groqRes.status}`;
      return res.status(groqRes.status).json({ error: message });
    }

    const data = await groqRes.json();
    const summary = data.choices?.[0]?.message?.content?.trim() ?? "";
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("[generate-summary] Erro:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao gerar resumo." });
  }
}
