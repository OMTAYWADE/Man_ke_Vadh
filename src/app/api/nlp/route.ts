import { NextResponse } from "next/server";

import { analyseText } from "@/lib/nlp";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const text = body?.text;

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Text is required.",
        },
        {
          status: 400,
        }
      );
    }

    const analysis =
      analyseText(text);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "NLP analysis failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "NLP analysis failed.",
      },
      {
        status: 500,
      }
    );
  }
}