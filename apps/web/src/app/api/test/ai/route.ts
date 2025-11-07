import { NextResponse } from "next/server";
import { runAllTests } from "@/lib/ai/__tests__/ai-service.test";

/**
 * GET /api/test/ai
 * Run comprehensive AI service tests
 */
export async function GET() {
  try {
    const testResults = await runAllTests();

    return NextResponse.json({
      success: true,
      ...testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
