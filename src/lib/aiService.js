const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const urgencyWeight = {
  high: 3,
  medium: 2,
  low: 1,
};

function heuristicInsights({ title, description, quantity }) {
  const text = `${title} ${description}`.toLowerCase();
  const hasDairy = /(milk|dairy|paneer|yogurt|cream|cheese)/.test(text);
  const hasMeat = /(chicken|meat|fish|mutton|egg)/.test(text);
  const bulk = quantity >= 80;

  const urgency = bulk || hasDairy || hasMeat ? "high" : quantity >= 35 ? "medium" : "low";
  const recommendation = hasDairy || hasMeat ? "families and shelters" : "kids and community kitchens";
  const storage_tip = hasDairy || hasMeat ? "Keep refrigerated and deliver quickly." : "Store in sealed containers and keep shaded.";

  return { urgency, recommendation, storage_tip };
}

export async function getFoodInsights({ title, description, quantity }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey) {
    return heuristicInsights({ title, description, quantity });
  }

  const prompt = `You are an AI food rescue assistant.
Return strictly valid JSON with keys: urgency, recommendation, storage_tip.
Allowed urgency values: low, medium, high.

Food title: ${title}
Description: ${description}
Quantity (meals): ${quantity}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 120,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return heuristicInsights({ title, description, quantity });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const urgency = String(parsed.urgency || "medium").toLowerCase();
    return {
      urgency: urgency === "high" || urgency === "low" ? urgency : "medium",
      recommendation: String(parsed.recommendation || "community shelters"),
      storage_tip: String(parsed.storage_tip || "Store safely and deliver as soon as possible."),
    };
  } catch {
    return heuristicInsights({ title, description, quantity });
  }
}

export function getUrgencyScore(value) {
  const key = String(value || "").toLowerCase();
  return urgencyWeight[key] ?? urgencyWeight.medium;
}
