import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

const SYSTEM_INSTRUCTION = `
You are ARC90 Coach, the intelligent AI wellness and productivity assistant
inside the ARC90 application.

ARC90 helps users build personalized 7, 30, 60, or 90-day arcs involving:

- fitness
- nutrition
- sleep
- recovery
- learning
- career
- productivity
- personal development

Answer the user's actual question directly.

Be practical and specific.
Do not repeatedly say "I can help".
Do not give canned responses.
If the user asks for a plan, actually create the plan.

Use the user's ARC90 context when relevant.

FITNESS:
Help with workouts, exercise selection, warmups, cooldowns,
training schedules, beginner/intermediate fitness guidance and recovery.

NUTRITION:
Help with meal planning, healthy eating, hydration, protein,
general nutrition education and organizing meals around schedules.

RECOVERY:
Help with sleep, mobility, rest days, recovery and balancing training
with workload.

PRODUCTIVITY:
Help with routines, time blocking, study schedules, career and learning
plans.

ARC90:
Help with daily quests, weekly planning, challenge planning, progress review,
routine adaptation and consistency.

HEALTH SAFETY:

You provide general wellness and educational information.

You are NOT a doctor, physiotherapist, dietitian, pharmacist,
or emergency medical service.

Do not diagnose medical conditions.

Do not prescribe medication.

Do not tell users to start, stop, or change prescription medication.

Do not make individualized medication dosing decisions.

For serious or urgent symptoms, recommend appropriate professional
or emergency medical care.

For normal fitness, nutrition, sleep and wellness questions,
remain useful and practical.

PERSONALITY:

Be intelligent.
Be practical.
Be concise for simple questions.
Be detailed for complex plans.
Be encouraging without being fake.
Avoid repetitive disclaimers.
`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryGeminiError(error: unknown) {
  const message = String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

async function generateWithFallback(prompt: string) {
  if (!ai) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ];

  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    try {
      console.log(`ARC90: Trying ${model}...`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 1200,
        },
      });

      console.log(`ARC90: ${model} responded successfully.`);

      return response;
    } catch (error) {
      lastError = error;

      console.warn(`ARC90: ${model} failed.`);

      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      if (i < models.length - 1) {
        const delay = 1200 * Math.pow(2, i);

        console.warn(
          `ARC90: Temporary Gemini failure. Waiting ${delay}ms before fallback...`
        );

        await sleep(delay);
      }
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    if (!apiKey || !ai) {
      return NextResponse.json(
        {
          error:
            "ARC90 AI is not configured. GEMINI_API_KEY is missing from .env.local.",
          code: "GEMINI_API_KEY_MISSING",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const message = body?.message;
    const context = body?.context ?? {};
    const history = body?.history ?? [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Message is required.",
          code: "INVALID_MESSAGE",
        },
        { status: 400 }
      );
    }

    const contextText = `
ARC90 USER CONTEXT

Arc name:
${context.arcName ?? "Not provided"}

Arc duration:
${context.duration ?? "Not provided"} days

Focus areas:
${
  Array.isArray(context.focus)
    ? context.focus.join(", ")
    : "Not provided"
}

Current progress:
${context.progress ?? "Not provided"}

Completed tasks:
${context.completedTasks ?? "None"}

Current tasks:
${context.tasks ?? "Not provided"}
`;

    const recentHistory = Array.isArray(history)
      ? history
          .slice(-10)
          .map(
            (item: { role: string; text: string }) =>
              `${item.role === "user" ? "USER" : "ARC90 COACH"}: ${item.text}`
          )
          .join("\n")
      : "";

    const prompt = `
${contextText}

RECENT CONVERSATION:
${recentHistory || "No previous conversation."}

USER'S CURRENT MESSAGE:
${message}

Answer the current question directly.

Use ARC90 context when relevant.

Do not simply repeat the user's question.

Do not give a generic "I can help you..." response.

If the user asks for a workout, meal plan, routine, schedule,
study plan, recovery plan or other practical plan, actually create it.
`;

    const response = await generateWithFallback(prompt);

    return NextResponse.json({
      response:
        response.text ||
        "I couldn't generate a response right now. Please try again.",
    });
  } catch (error) {
    console.error("========== ARC90 AI ERROR ==========");
    console.error(error);
    console.error("====================================");

    const errorText = String(error);

    if (
      errorText.includes("GEMINI_API_KEY_MISSING") ||
      errorText.includes("API key")
    ) {
      return NextResponse.json(
        {
          error:
            "ARC90 AI is not configured correctly. Check GEMINI_API_KEY in .env.local.",
          code: "GEMINI_API_KEY_MISSING",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Gemini is temporarily unavailable. ARC90 tried multiple supported models. Please send the message again in a moment.",
        code: "GEMINI_TEMPORARY_UNAVAILABLE",
      },
      { status: 503 }
    );
  }
}