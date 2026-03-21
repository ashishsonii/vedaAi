import OpenAI from "openai"

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey:  process.env.GROQ_API_KEY!,
})

export interface Question {
  text:       string
  difficulty: "easy" | "medium" | "hard"
  marks:      number
  type:       "mcq" | "short" | "long"
  options?:   string[]
}

export interface Section {
  title:       string
  instruction: string
  questions:   Question[]
}

export const buildPrompt = (assignment: any): string => `
You are an expert exam paper generator for academic institutions.

Generate a structured question paper with these requirements:
- Subject: ${assignment.subject}
- Topic: ${assignment.topic}
- Total Marks: ${assignment.totalMarks}
- Allowed Question Types: ${assignment.questionTypes.join(", ")}
- Instructions: ${assignment.instructions}

Rules:
1. Create exactly 4 sections: Section A (Easy ~30%), Section B (Medium ~50%), Section C (Hard ~20%), and a final section titled "Answer Key".
2. Total marks across sections A, B, C MUST equal exactly ${assignment.totalMarks}. The Answer Key section should have 0 marks.
3. The "Answer Key" section MUST contain brief, concise answers for EVERY question generated in sections A, B, and C. It should not be excessively long.
4. MCQ questions MUST include an "options" array with exactly 4 strings.
5. Short answer: 2-5 marks | Long answer: 5-10 marks | MCQ: 1 mark
6. Only use question types from: ${assignment.questionTypes.join(", ")}

Return ONLY a valid JSON array. No markdown. No explanation. No code fences.

[
  {
    "title": "Section A",
    "instruction": "Attempt all questions",
    "questions": [
      {
        "text": "Question here",
        "type": "mcq",
        "difficulty": "easy",
        "marks": 1,
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ]
  },
  {
    "title": "Answer Key",
    "instruction": "Answers for teachers",
    "questions": [
      {
        "text": "1. Answer to Q1\\n2. Answer to Q2 (Option B)\\n3. Brief explanation for Q3",
        "type": "short",
        "difficulty": "medium",
        "marks": 0
      }
    ]
  }
]
`.trim()

const parseAndValidate = (raw: string): Section[] => {
  const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim()

  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (!match) throw new Error("AI returned non-JSON response")
    parsed = JSON.parse(match[0])
  }

  if (!Array.isArray(parsed)) throw new Error("AI response is not an array")

  return parsed.map((section: any, i: number) => ({
    title:       section.title ?? `Section ${String.fromCharCode(65 + i)}`,
    instruction: section.instruction ?? "Attempt all questions",
    questions: (section.questions ?? []).map((q: any) => ({
      text:       q.text ?? "Question text missing",
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      marks:      Number(q.marks) || 1,
      type:       q.type ?? "short",
      ...(q.options ? { options: q.options } : {}),
    })),
  }))
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const generateWithAI = async (
  prompt: string,
  retries = 3
): Promise<Section[]> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 Groq attempt ${attempt}/${retries}`)

      const response = await client.chat.completions.create({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  4096,
        temperature: 0.7,
        messages: [
          {
            role:    "system",
            content: "You are an exam paper generator. Always respond with valid JSON only. No markdown, no explanation.",
          },
          { role: "user", content: prompt },
        ],
      })

      const raw = response.choices[0]?.message?.content ?? ""
      console.log(`✅ Groq response received (${raw.length} chars)`)
      return parseAndValidate(raw)

    } catch (error: any) {
      const isRateLimit   = error?.status === 429 || error?.message?.includes("429")
      const isLastAttempt = attempt === retries

      if (isRateLimit && !isLastAttempt) {
        const waitMs = attempt * 10000 // Groq resets faster than DeepSeek
        console.warn(`⏳ Rate limited. Retrying in ${waitMs / 1000}s...`)
        await sleep(waitMs)
        continue
      }

      throw error
    }
  }

  throw new Error("AI generation failed after all retries")
}