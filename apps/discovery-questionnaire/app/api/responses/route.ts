import { NextRequest, NextResponse } from "next/server";
import { getResponse, saveResponse, createInitialResponse } from "@/lib/storage";
import { calculateProgress } from "@/lib/storage";
import { QuestionnaireResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userName = request.headers.get("x-user-name") || "";

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let response = await getResponse(userId);
    
    if (!response) {
      response = await createInitialResponse(userId, userEmail, userName);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching response:", error);
    return NextResponse.json(
      { error: "Failed to fetch response" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sectionId, answers, completed } = body;

    let response = await getResponse(userId);
    
    if (!response) {
      const userName = request.headers.get("x-user-name") || "";
      response = await createInitialResponse(userId, userEmail, userName);
    }

    // Update the section
    if (response.sections[sectionId]) {
      response.sections[sectionId].answers = { ...response.sections[sectionId].answers, ...answers };
      response.sections[sectionId].lastModified = new Date().toISOString();
      
      if (completed !== undefined) {
        response.sections[sectionId].completed = completed;
        response.sections[sectionId].completedAt = completed ? new Date().toISOString() : null;
      }
    }

    // Recalculate progress
    response.progress = calculateProgress(response.sections);
    response.lastUpdated = new Date().toISOString();

    // Check if all sections are complete
    if (response.progress.completedSections === response.progress.totalSections) {
      response.completedAt = new Date().toISOString();
    }

    await saveResponse(response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error saving response:", error);
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }
}
