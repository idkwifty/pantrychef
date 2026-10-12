const MODEL = "gpt-4o-mini"; // можна змінити на іншу модель із підтримкою зображень
const API_URL = "https://api.openai.com/v1/chat/completions";

const ALLOWED_ORIGINS = [
  "https://pantrychef-chi-seven.vercel.app",
  "http://localhost:8081",
  "http://localhost:19006",
];

const LANGS: Record<string, string> = {
  en: "English",
  uk: "Ukrainian",
  ru: "Russian",
  pl: "Polish",
  de: "German",
};

// Простий ліміт: 30 запитів на годину з однієї IP (на рівні одного екземпляра функції)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

function strs(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x) => typeof x === "string")
    .slice(0, maxItems)
    .map((x: string) => x.slice(0, maxLen));
}

async function callOpenAI(messages: unknown[], maxTokens: number) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    console.error("OpenAI error", res.status, (await res.text()).slice(0, 300));
    throw new Error("upstream");
  }
  const json = await res.json();
  return JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
}

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Server is not configured" });

  const ip = String(req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return res.status(429).json({ error: "Too many requests" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};

    if (body.kind === "detect") {
      const image = typeof body.image === "string" ? body.image : "";
      if (!image || image.length > 3_500_000) {
        return res.status(400).json({ error: "Invalid image" });
      }
      const data = await callOpenAI(
        [
          {
            role: "system",
            content:
              "You identify food ingredients in photos of a fridge or pantry. " +
              'Reply only with JSON: {"items":[{"name":string,"confidence":number,"notes":string}]}. ' +
              "name is a short singular product name in Russian. confidence is 0..1. " +
              "Include only items you can actually see.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What food products are in this photo?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        800
      );
      return res.status(200).json({ items: Array.isArray(data.items) ? data.items : [] });
    }

    if (body.kind === "plan") {
      const days = Math.min(Math.max(parseInt(body.days, 10) || 1, 1), 7);
      const language = LANGS[body.lang] ?? "English";
      const prefs = body.prefs ?? {};
      const data = await callOpenAI(
        [
          {
            role: "system",
            content:
              `You are a careful meal planner. Write all text in ${language}. ` +
              `Create a plan for ${days} day(s) with breakfast, lunch and dinner each day. ` +
              "Use the ingredients the user already has as much as possible. " +
              "NEVER include any ingredient from the user's allergies or dislikes, and respect the diet. " +
              "Keep each description to one or two short sentences. " +
              'Reply only with JSON: {"days":[{"day":string,"meals":[{"type":"breakfast|lunch|dinner",' +
              '"title":string,"description":string,"ingredients":string[],"missing":string[],"minutes":number}]}],' +
              '"shoppingList":string[]}. "missing" lists ingredients the user does not have. ' +
              "shoppingList is the combined list of everything missing across the plan.",
          },
          {
            role: "user",
            content: JSON.stringify({
              ingredientsAtHome: strs(body.pantry, 60, 60),
              allergies: strs(prefs.allergies, 20, 40),
              diet: String(prefs.diet ?? "none").slice(0, 20),
              dislikes: strs(prefs.disliked, 30, 60),
              spiceLevel: String(prefs.spice ?? "mild").slice(0, 10),
              favoriteCuisines: strs(prefs.cuisines, 10, 40),
            }),
          },
        ],
        4000
      );
      return res.status(200).json({
        days: Array.isArray(data.days) ? data.days : [],
        shoppingList: Array.isArray(data.shoppingList) ? data.shoppingList : [],
      });
    }

    return res.status(400).json({ error: "Unknown request" });
  } catch {
    return res.status(502).json({ error: "Upstream error" });
  }
}