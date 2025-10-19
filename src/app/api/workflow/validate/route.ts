import { NextRequest, NextResponse } from "next/server";
import { validateWorkflow } from "@/lib/validator";
import { Workflow } from "@/types/workflow";

export async function POST(request: NextRequest) {
  try {
    const workflow: Workflow = await request.json();

    const validationResult = validateWorkflow(workflow);

    return NextResponse.json(validationResult);
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : "Failed to validate workflow",
            type: "error",
          },
        ],
      },
      { status: 400 }
    );
  }
}

