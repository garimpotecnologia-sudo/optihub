interface NanoBananaRequest {
  prompt: string;
  referenceImages?: string[];
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
  style?: string;
  colors?: { primary?: string; secondary1?: string; secondary2?: string };
}

interface NanoBananaResponse {
  imageUrl: string;
  imageBase64?: string;
}

const API_URL =
  process.env.NANO_BANANA_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
const API_KEY = process.env.NANO_BANANA_API_KEY || "";

const RATIO_INSTRUCTIONS: Record<string, string> = {
  "1:1": "IMPORTANT: The output image MUST be a perfect square (1:1 ratio, e.g. 1080x1080 pixels). Do NOT make it rectangular.",
  "9:16": "IMPORTANT: The output image MUST be vertical/portrait format (9:16 ratio, e.g. 1080x1920 pixels). Tall and narrow, like a phone screen in portrait mode.",
  "16:9": "IMPORTANT: The output image MUST be horizontal/landscape widescreen format (16:9 ratio, e.g. 1920x1080 pixels). Wide and short, like a banner.",
  "4:5": "IMPORTANT: The output image MUST be a slightly vertical rectangle (4:5 ratio, e.g. 1080x1350 pixels). Taller than it is wide, but not as tall as 9:16.",
};

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
        const response = await fetch(img);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        parts.push({ inlineData: { mimeType: "image/png", data: base64 } });
      }
    }
  }

  // Build strong prompt with explicit size and color instructions
  let fullPrompt = req.prompt;

  if (req.style) {
    fullPrompt += `\n\nVisual style: ${req.style}.`;
  }

  // Colors instruction
  if (req.colors) {
    const colorParts: string[] = [];
    if (req.colors.primary) colorParts.push(`primary/dominant color: ${req.colors.primary}`);
    if (req.colors.secondary1) colorParts.push(`secondary color 1: ${req.colors.secondary1}`);
    if (req.colors.secondary2) colorParts.push(`secondary color 2: ${req.colors.secondary2}`);
    if (colorParts.length > 0) {
      fullPrompt += `\n\nColor palette to use in the design: ${colorParts.join(", ")}. Use these exact colors as the main colors of the design.`;
    }
  }

  // Aspect ratio — strong instruction at the end
  if (req.aspectRatio && RATIO_INSTRUCTIONS[req.aspectRatio]) {
    fullPrompt += `\n\n${RATIO_INSTRUCTIONS[req.aspectRatio]}`;
  }

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

export async function editImage(req: NanoBananaRequest): Promise<NanoBananaResponse> {
  return generateImage(req);
}

export async function composeImages(req: NanoBananaRequest): Promise<NanoBananaResponse> {
  return generateImage(req);
}

export const PLAN_LIMITS = {
  STARTER: 30,
  PRO: 500,
  REDE: Infinity,
} as const;

export function canGenerate(plan: keyof typeof PLAN_LIMITS, usedThisMonth: number): boolean {
  return usedThisMonth < PLAN_LIMITS[plan];
}
