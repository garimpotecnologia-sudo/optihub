interface NanoBananaRequest {
  prompt: string;
  referenceImages?: string[];
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
  style?: string;
}

interface NanoBananaResponse {
  imageUrl: string;
  imageBase64?: string;
}

const API_URL =
  process.env.NANO_BANANA_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
const API_KEY = process.env.NANO_BANANA_API_KEY || "";

export async function generateImage(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add reference images if provided
  if (req.referenceImages?.length) {
    for (const img of req.referenceImages) {
      if (img.startsWith("data:")) {
        const [meta, data] = img.split(",");
        const mimeType = meta.split(":")[1].split(";")[0];
        parts.push({ inlineData: { mimeType, data } });
      } else {
        // Fetch and convert URL to base64
        const response = await fetch(img);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        parts.push({
          inlineData: { mimeType: "image/png", data: base64 },
        });
      }
    }
  }

  // Build prompt with style and aspect ratio hints
  let fullPrompt = req.prompt;
  if (req.style) fullPrompt += `. Style: ${req.style}`;
  if (req.aspectRatio) fullPrompt += `. Aspect ratio: ${req.aspectRatio}`;

  parts.push({ text: fullPrompt });

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Nano Banana API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith("image/")
  );

  if (imagePart?.inlineData) {
    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    return {
      imageUrl: `data:${mimeType};base64,${base64}`,
      imageBase64: base64,
    };
  }

  throw new Error("No image returned from Nano Banana API");
}

export async function editImage(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  return generateImage(req);
}

export async function composeImages(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  return generateImage(req);
}

// Rate limits by plan
export const PLAN_LIMITS = {
  STARTER: 30,
  PRO: 500,
  REDE: Infinity,
} as const;

export function canGenerate(plan: keyof typeof PLAN_LIMITS, usedThisMonth: number): boolean {
  return usedThisMonth < PLAN_LIMITS[plan];
}
