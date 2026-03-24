interface NanoBananaRequest {
  prompt: string;
  logo?: string;
  referenceImage?: string;
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
  style?: string;
  colors?: { primary?: string; secondary1?: string; secondary2?: string };
}

interface NanoBananaResponse {
  imageUrl: string;
  imageBase64?: string;
  finalPrompt?: string;
  model?: string;
}

const API_KEY = process.env.NANO_BANANA_API_KEY || "";

// Imagen 4 supports these ratios
const IMAGEN_RATIO_MAP: Record<string, string> = {
  "1:1": "1:1",
  "9:16": "9:16",
  "16:9": "16:9",
  "4:5": "3:4", // closest supported ratio
};

async function imageToBase64(img: string): Promise<{ mimeType: string; data: string }> {
  if (img.startsWith("data:")) {
    const [meta, data] = img.split(",");
    const mimeType = meta.split(":")[1].split(";")[0];
    return { mimeType, data };
  }
  const response = await fetch(img);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { mimeType: "image/png", data: base64 };
}

// ============================================
// IMAGEN 4 — for pure text-to-image with correct aspect ratio
// ============================================
async function generateWithImagen(
  prompt: string,
  aspectRatio: string
): Promise<NanoBananaResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;

  const imagenRatio = IMAGEN_RATIO_MAP[aspectRatio] || "1:1";

  console.log("=== IMAGEN 4 REQUEST ===");
  console.log("Ratio:", imagenRatio);
  console.log("Prompt:", prompt.slice(0, 300));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        aspectRatio: imagenRatio,
        sampleCount: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Imagen 4 API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const prediction = data.predictions?.[0];
  const base64 = prediction?.bytesBase64Encoded;

  if (base64) {
    return {
      imageUrl: `data:image/png;base64,${base64}`,
      imageBase64: base64,
      finalPrompt: prompt,
      model: "imagen-4",
    };
  }

  throw new Error("No image returned from Imagen 4");
}

// ============================================
// GEMINI — for logo/reference image composition
// ============================================
async function generateWithGemini(
  prompt: string,
  logo?: string,
  referenceImage?: string
): Promise<NanoBananaResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];

  // Reference image FIRST
  if (referenceImage) {
    const refData = await imageToBase64(referenceImage);
    parts.push({ inlineData: refData });
    parts.push({ text: "Above is a REFERENCE IMAGE. Use it as visual inspiration for style, colors and layout — but create a completely NEW design based on the prompt below." });
  }

  // Logo with strict instructions
  if (logo) {
    const logoData = await imageToBase64(logo);
    parts.push({ inlineData: logoData });
    parts.push({ text: "Above is the COMPANY LOGO. Place this logo EXACTLY as-is in the design. Do NOT modify, redraw or recreate the logo. Overlay the original logo image in a visible area." });
  }

  // Main prompt
  parts.push({ text: prompt });

  console.log("=== GEMINI REQUEST ===");
  console.log("Parts:", parts.length);
  console.log("Has logo:", !!logo);
  console.log("Has reference:", !!referenceImage);
  console.log("Prompt:", prompt.slice(0, 300));

  const response = await fetch(url, {
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
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith("image/")
  );

  if (imagePart?.inlineData) {
    return {
      imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      imageBase64: imagePart.inlineData.data,
      finalPrompt: prompt,
      model: "gemini-2.5-flash-image",
    };
  }

  throw new Error("No image returned from Gemini");
}

// ============================================
// MAIN ENTRY POINT
// ============================================
export async function generateImage(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  // Build the full prompt
  let fullPrompt = req.prompt;

  if (req.style) {
    fullPrompt += `\n\nVisual style: ${req.style}.`;
  }

  if (req.colors) {
    const colorParts: string[] = [];
    if (req.colors.primary) colorParts.push(`primary color: ${req.colors.primary}`);
    if (req.colors.secondary1) colorParts.push(`secondary color: ${req.colors.secondary1}`);
    if (req.colors.secondary2) colorParts.push(`accent color: ${req.colors.secondary2}`);
    if (colorParts.length > 0) {
      fullPrompt += `\nUse these EXACT colors in the design: ${colorParts.join(", ")}.`;
    }
  }

  const hasImages = !!req.logo || !!req.referenceImage;

  if (hasImages) {
    // Use GEMINI when we have logo or reference images
    // Add size hint in prompt (Gemini doesn't guarantee it but it helps)
    if (req.aspectRatio) {
      const sizeHints: Record<string, string> = {
        "1:1": "square format (1:1)",
        "9:16": "vertical Story format (9:16, tall portrait)",
        "16:9": "wide banner format (16:9, landscape)",
        "4:5": "slightly vertical format (4:5, portrait)",
      };
      fullPrompt += `\n\nImage format: ${sizeHints[req.aspectRatio] || req.aspectRatio}.`;
    }
    return generateWithGemini(fullPrompt, req.logo, req.referenceImage);
  } else {
    // Use IMAGEN 4 for pure text — guarantees correct aspect ratio
    return generateWithImagen(fullPrompt, req.aspectRatio || "1:1");
  }
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
