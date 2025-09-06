import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageDataUrl } = req.body as { imageDataUrl?: string };
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return res.status(400).json({ error: "imageDataUrl is required" });
    }

    const match = imageDataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid data URL format" });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const prompt =
      "Create a hyper-realistic portrait of the provided adult male, reimagined as himself at about 7–9 years old. The child must be instantly recognizable as the same person: preserve the unique facial structure, eye shape, nose, lips, and overall proportions, only adjusted naturally for a younger age. Key details: - Smooth, youthful skin with no wrinkles or facial hair. - Slightly rounder cheeks, smaller jawline, softer facial contours. - Eye size proportionally larger compared to the face, with a bright and innocent childlike gaze. - Hair should closely resemble the adult's current hairstyle, but shorter and appropriate for a school-aged boy, natural and neat. - Expression: calm, slightly smiling, gentle and curious, typical of a childhood portrait. - Outfit: realistic elementary school clothing, such as a plain white shirt, or a Japanese elementary school uniform (navy blazer, white shirt). - Environment: simple studio portrait with soft natural lighting and a neutral background. - Style: ultra photorealistic, extremely detailed, high-resolution photograph. Lighting and skin texture should look like a real professional portrait photograph, not a painting or illustration.";

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return res.status(502).json({ error: "Gemini API request failed", detail: errorText });
    }

    const data = await geminiResponse.json();

    // 生成結果から最初の画像パートを抽出
    const candidates = data?.candidates || [];
    let outputData: string | null = null;
    let outputMime: string = "image/png";

    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const p of parts) {
        if (p?.inlineData?.data) {
          outputData = p.inlineData.data;
          outputMime = p.inlineData.mimeType || outputMime;
          break;
        }
      }
      if (outputData) break;
    }

    if (!outputData) {
      return res.status(500).json({ error: "Gemini response did not include image data", raw: data });
    }

    const transformedDataUrl = `data:${outputMime};base64,${outputData}`;
    return res.status(200).json({ transformedDataUrl });
  } catch (error) {
    return res.status(500).json({
      error: "Image conversion failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}


