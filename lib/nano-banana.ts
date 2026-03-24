interface NanoBananaRequest {
  prompt: string;
  logo?: string;           // Logo to overlay — NOT to reinterpret
  referenceImage?: string; // Style/composition reference
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
  style?: string;
  colors?: { primary?: string; secondary1?: string; secondary2?: string };
}

interface NanoBananaResponse {
  imageUrl: string;
  imageBase64?: string;
  finalPrompt?: string; // For debugging
}

const API_URL =
  process.env.NANO_BANANA_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
const API_KEY = process.env.NANO_BANANA_API_KEY || "";

const RATIO_DIMENSIONS: Record<string, { w: number; h: number; desc: string }> = {
  "1:1":  { w: 1080, h: 1080, desc: "square" },
  "9:16": { w: 1080, h: 1920, desc: "vertical/portrait (tall, like a phone screen)" },
  "16:9": { w: 1920, h: 1080, desc: "horizontal/landscape (wide, like a banner)" },
  "4:5":  { w: 1080, h: 1350, desc: "slightly vertical portrait" },
};

async function imageToInlineData(img: string) {
  if (img.startsWith("data:")) {
    const [meta, data] = img.split(",");
    const mimeType = meta.split(":")[1].split(";")[0];
    return { inlineData: { mimeType, data } };
  }
  const response = await fetch(img);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { inlineData: { mimeType: "image/png", data: base64 } };
}

export async function generateImage(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];

  // === REFERENCE IMAGE ===
  // Sent FIRST so the model sees it before the prompt
  if (req.referenceImage) {
    parts.push(await imageToInlineData(req.referenceImage));
    parts.push({ text: "Above is a REFERENCE IMAGE for style/composition inspiration. Use it as visual inspiration for colors, layout and mood — but create a completely NEW and ORIGINAL design based on the prompt below." });
  }

  // === LOGO ===
  // Sent separately with VERY specific instructions
  if (req.logo) {
    parts.push(await imageToInlineData(req.logo));
    parts.push({ text: "Above is the COMPANY LOGO. You MUST place this logo EXACTLY as-is in the final design. Do NOT modify, redraw, reinterpret or recreate the logo. Place the original logo image in a visible corner or header area of the design." });
  }

  // === BUILD THE MAIN PROMPT ===
  let fullPrompt = req.prompt;

  // Style
  if (req.style) {
    fullPrompt += `\n\nVisual style: ${req.style}.`;
  }

  // Colors
  if (req.colors) {
    const colorParts: string[] = [];
    if (req.colors.primary) colorParts.push(`primary/dominant color: ${req.colors.primary}`);
    if (req.colors.secondary1) colorParts.push(`secondary color 1: ${req.colors.secondary1}`);
    if (req.colors.secondary2) colorParts.push(`secondary color 2: ${req.colors.secondary2}`);
    if (colorParts.length > 0) {
      fullPrompt += `\n\nColor palette — use these EXACT colors as the main colors: ${colorParts.join(", ")}.`;
    }
  }

  // Aspect ratio — explicit dimensions
  if (req.aspectRatio && RATIO_DIMENSIONS[req.aspectRatio]) {
    const dim = RATIO_DIMENSIONS[req.aspectRatio];
    fullPrompt += `\n\n=== IMAGE SIZE (MANDATORY) ===\nThe output image dimensions MUST be exactly ${dim.w}x${dim.h} pixels (${req.aspectRatio} ratio, ${dim.desc}).\nDo NOT output any other size. This is a strict requirement.`;
  }

  // Add main prompt as last part
  parts.push({ text: fullPrompt });

  // Log for debugging
  console.log("=== NANO BANANA FINAL PROMPT ===");
  console.log("Parts count:", parts.length);
  console.log("Has logo:", !!req.logo);
  console.log("Has reference:", !!req.referenceImage);
  console.log("Aspect ratio:", req.aspectRatio);
  console.log("Full text prompt:", fullPrompt);
  console.log("=== END ===");

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
      finalPrompt: fullPrompt,
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
