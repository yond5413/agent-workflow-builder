import { NextRequest, NextResponse } from "next/server";
import { validateWorkflow } from "@/lib/validator";
import { WorkflowEngine } from "@/lib/engine";
import { Workflow } from "@/types/workflow";

export async function POST(request: NextRequest) {
  try {
    const workflow: Workflow = await request.json();

    // Validate workflow first
    const validationResult = validateWorkflow(workflow);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow validation failed",
          validationErrors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Execute workflow
    const engine = new WorkflowEngine(workflow);
    const result = await engine.execute();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to execute workflow",
        results: {},
        logs: [],
      },
      { status: 500 }
    );
  }
}

