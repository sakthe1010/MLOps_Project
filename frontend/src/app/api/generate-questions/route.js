import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Keep it secret via .env.local
});

export async function POST(req) {
  const { chapterName, subject } = await req.json();

  const prompt = `Generate 5 multiple choice questions with 4 options each (A, B, C, D) and mark the correct option. 
  Subject: ${subject}, Chapter: ${chapterName}.
  Format:
  [
    {
      "question": "...?",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A"
    },
    ...
  ]`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0].message.content;

  try {
    const questions = JSON.parse(text);
    return Response.json({ success: true, questions });
  } catch {
    return Response.json({ success: false, error: "Failed to parse AI response" });
  }
}
