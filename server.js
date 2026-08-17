import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "bestdot.AI CreatorOS API"
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, mode = "Content" } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY belum dipasang di server."
      });
    }

    const systemPrompt = `
Kamu adalah bestdot.AI CreatorOS.
Kamu adalah AI copilot untuk content creator dan digital creator.

Mode pekerjaan: ${mode}

Jawab dalam Bahasa Indonesia secara praktis,
terstruktur, dan siap dieksekusi.

Jika membuat konten, sertakan:
1. Hook
2. Isi / Script
3. CTA
4. Caption bila relevan
5. Prompt visual bila relevan
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5.6",
          instructions: systemPrompt,
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "OpenAI API error",
        detail: data
      });
    }

    res.json({
      ok: true,
      content: data.output_text || "",
      model: process.env.OPENAI_MODEL || "gpt-5.6"
    });

  } catch (error) {
    res.status(500).json({
      error: "Generation failed",
      detail: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `bestdot.AI CreatorOS API running on port ${PORT}`
  );
});
