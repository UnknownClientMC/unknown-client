import express from "express";
import multer from "multer";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Please upload an image file."));
  }
});
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/find-mod", upload.single("image"), async (req, res) => {
  try {
    const description = String(req.body.description || "").slice(0, 3000);
    if (!description.trim() && !req.file) {
      return res.status(400).json({ error: "Add a description or image." });
    }

    const content = [{
      type: "text",
      text: `The user is looking for a Minecraft mod. They may describe it in Hinglish/Hindi/English. Understand their intent, including transliterated Hindi such as "fps badhane wala mod", "lag kam kare", "zoom wala mod", "health bar dikhaye". If an image is attached, inspect it for visible mod names, logos, UI clues, or gameplay features. Return a concise English Modrinth search query, not an invented mod name. Description: ${description || "(no text description)"}`
    }];

    if (req.file) {
      const data = req.file.buffer.toString("base64");
      content.push({
        type: "image_url",
        image_url: { url: `data:${req.file.mimetype};base64,${data}`, detail: "high" }
      });
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 'You help identify Minecraft mods from Hinglish descriptions and screenshots. Return ONLY valid JSON with keys "search_query" and "explanation". search_query must be a short useful English query for searching the Modrinth catalog. Never claim certainty if the image does not contain enough clues. If no mod can be inferred, use the most descriptive visible feature. explanation should be a short Hinglish sentence.'
        },
        { role: "user", content }
      ],
      response_format: { type: "json_object" },
      max_tokens: 250
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    res.json({
      search_query: String(parsed.search_query || description || "Minecraft mod").slice(0, 200),
      explanation: String(parsed.explanation || "").slice(0, 300)
    });
  } catch (error) {
    console.error("find-mod failed:", error?.message || error);
    res.status(500).json({ error: "AI search failed. Check backend configuration." });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ error: err.message || "Upload failed." });
  }
});

app.listen(PORT, () => console.log(`UNKNOWN CLIENT AI backend listening on ${PORT}`));
