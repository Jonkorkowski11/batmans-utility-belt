import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// We'll use the GOOGLE_CLIENT_SECRET or a dedicated GEMINI_API_KEY if available.
// For now, looking for GEMINI_API_KEY or falling back to a message.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!genAI) {
    return NextResponse.json({ 
      error: "AI NOT CONFIGURED", 
      message: "Please add GEMINI_API_KEY to your .env.local to enable EOS AI features." 
    }, { status: 503 });
  }

  try {
    const { section, currentContent, guidance, teamContext } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert EOS (Entrepreneurial Operating System) Implementer.
      Help me build my ${section} based on the following context.
      
      SECTION: ${section}
      JON'S GUIDANCE (Expert Workflow): ${guidance}
      CURRENT CONTENT: ${currentContent}
      TEAM CONTEXT: ${teamContext || "A high-growth digital agency team."}

      INSTRUCTIONS:
      1. Follow Jon's guidance strictly.
      2. Keep it concise, punchy, and professional.
      3. Provide 3-5 high-quality examples or a completed version of the section.
      4. Focus on accountability and clear execution.

      OUTPUT:
      Return only the text for the section, formatted clearly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI VTO Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
