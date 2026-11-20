import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: "Valid mobile phone number is required." },
        { status: 400 }
      );
    }

    // Clean phone number (strip non-digits)
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit US phone number." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to Icepack Gameday Alerts.",
      phone: cleaned,
      name: name || undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
