import sharp from "sharp";

interface NanoBananaRequest {
  prompt: string;
  logo?: string;
  referenceImage?: string;
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
  style?: string;
  colors?: { primary?: string; secondary1?: string; secondary2?: string };
  tool?: string;
}

interface NanoBananaResponse {
  imageUrl: string;
  imageBase64?: string;
  finalPrompt?: string;
  model?: string;
}

const API_KEY = process.env.NANO_BANANA_API_KEY || "";

const IMAGEN_RATIO_MAP: Record<string, string> = {
  "1:1": "1:1",
  "9:16": "9:16",
  "16:9": "16:9",
  "4:5": "3:4",
};

async function imageToBuffer(img: string): Promise<Buffer> {
  if (img.startsWith("data:")) {
    const base64 = img.split(",")[1];
    return Buffer.from(base64, "base64");
  }
  const response = await fetch(img);
  return Buffer.from(await response.arrayBuffer());
}

async function imageToBase64Data(img: string): Promise<{ mimeType: string; data: string }> {
  if (img.startsWith("data:")) {
    const [meta, data] = img.split(",");
    const mimeType = meta.split(":")[1].split(";")[0];
    return { mimeType, data };
  }
  const response = await fetch(img);
  const buffer = Buffer.from(await response.arrayBuffer());
  return { mimeType: "image/png", data: buffer.toString("base64") };
}

// ============================================
// IMAGEN 4 — always correct aspect ratio
// ============================================
async function generateWithImagen(
  prompt: string,
  aspectRatio: string
): Promise<{ base64: string; prompt: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;
  const imagenRatio = IMAGEN_RATIO_MAP[aspectRatio] || "1:1";

  console.log("=== IMAGEN 4 ===");
  console.log("Ratio:", imagenRatio);
  console.log("Prompt:", prompt.slice(0, 300));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { aspectRatio: imagenRatio, sampleCount: 1 },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Imagen 4 error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error("No image from Imagen 4");

  return { base64, prompt };
}

// ============================================
// GEMINI — for reference image inspiration
// ============================================
async function generateWithGemini(
  prompt: string,
  referenceImage: string
): Promise<{ base64: string; prompt: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

  const refData = await imageToBase64Data(referenceImage);
  const parts = [
    { inlineData: refData },
    { text: `Above is a REFERENCE IMAGE for style and visual inspiration. Create a completely NEW design inspired by its style, colors and mood.\n\n${prompt}` },
  ];

  console.log("=== GEMINI (with reference) ===");
  console.log("Prompt:", prompt.slice(0, 300));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData?.data
  );

  if (!imagePart?.inlineData?.data) throw new Error("No image from Gemini");
  return { base64: imagePart.inlineData.data, prompt };
}

// ============================================
// GEMINI — direct image editing (for EDITOR tool)
// ============================================
async function editWithGemini(
  prompt: string,
  sourceImage: string
): Promise<{ base64: string; prompt: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`;

  const imgData = await imageToBase64Data(sourceImage);
  const parts = [
    { inlineData: imgData },
    { text: `This is the ACTUAL product photo that you must EDIT directly. Do NOT create a new image from scratch. Apply the following edit to THIS EXACT photo, preserving the product exactly as it is:\n\n${prompt}` },
  ];

  console.log("=== GEMINI (direct edit) ===");
  console.log("Prompt:", prompt.slice(0, 300));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini edit error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData?.data
  );

  if (!imagePart?.inlineData?.data) throw new Error("No image from Gemini edit");
  return { base64: imagePart.inlineData.data, prompt };
}

// ============================================
// OVERLAY LOGO — composição via sharp (nunca toca a logo)
// ============================================
async function overlayLogo(
  imageBase64: string,
  logoSrc: string
): Promise<string> {
  try {
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const logoBuffer = await imageToBuffer(logoSrc);

    // Get image dimensions
    const imageMeta = await sharp(imageBuffer).metadata();
    const imgW = imageMeta.width || 1024;
    const imgH = imageMeta.height || 1024;

    // Resize logo to ~15% of image width, maintain aspect ratio
    const logoMaxW = Math.round(imgW * 0.15);
    const logoMaxH = Math.round(imgH * 0.08);
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoMaxW, logoMaxH, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    // Get resized logo dimensions
    const logoMeta = await sharp(resizedLogo).metadata();
    const logoW = logoMeta.width || logoMaxW;
    const logoH = logoMeta.height || logoMaxH;

    // Position: top-right corner with padding
    const padding = Math.round(imgW * 0.03);
    const left = imgW - logoW - padding;
    const top = padding;

    // Composite
    const result = await sharp(imageBuffer)
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toBuffer();

    console.log(`Logo overlayed: ${logoW}x${logoH} at (${left},${top}) on ${imgW}x${imgH}`);

    return result.toString("base64");
  } catch (err) {
    console.error("Logo overlay failed:", err);
    return imageBase64; // Return original if overlay fails
  }
}

// ============================================
// MAIN ENTRY POINT
// ============================================
export async function generateImage(
  req: NanoBananaRequest
): Promise<NanoBananaResponse> {
  // Send exactly what the user wrote
  // Only add colors if user selected them (they explicitly chose these)
  let fullPrompt = req.prompt;

  if (req.colors) {
    const colorParts: string[] = [];
    if (req.colors.primary) colorParts.push(`primary color: ${req.colors.primary}`);
    if (req.colors.secondary1) colorParts.push(`secondary color: ${req.colors.secondary1}`);
    if (req.colors.secondary2) colorParts.push(`accent color: ${req.colors.secondary2}`);
    if (colorParts.length > 0) {
      fullPrompt += `\nUse these EXACT colors: ${colorParts.join(", ")}.`;
    }
  }

  let result: { base64: string; prompt: string };
  let model: string;

  if (req.tool === "EDITOR" && req.referenceImage) {
    // EDITOR tool: edit the actual product photo directly
    model = "gemini-2.5-flash-edit";
    result = await editWithGemini(fullPrompt, req.referenceImage);
  } else if (req.referenceImage) {
    // Has reference image → use Gemini for style inspiration
    model = "gemini-2.5-flash-image";
    result = await generateWithGemini(fullPrompt, req.referenceImage);
  } else {
    // Pure text → use Imagen 4 (guaranteed correct aspect ratio)
    model = "imagen-4";
    result = await generateWithImagen(fullPrompt, req.aspectRatio || "1:1");
  }

  let finalBase64 = result.base64;

  // Overlay logo via sharp — NEVER let AI touch the logo
  if (req.logo) {
    console.log("Overlaying logo via sharp...");
    finalBase64 = await overlayLogo(finalBase64, req.logo);
  }

  return {
    imageUrl: `data:image/png;base64,${finalBase64}`,
    imageBase64: finalBase64,
    finalPrompt: result.prompt,
    model: req.logo ? `${model} + sharp-logo` : model,
  };
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
