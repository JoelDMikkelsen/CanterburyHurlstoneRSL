import { NextRequest, NextResponse } from "next/server";
import { getAllResponses } from "@/lib/storage";

// Check if user is admin (Fusion5 email domain)
function isAdmin(userEmail: string): boolean {
  const adminDomains = ["fusion5.com.au", "fusion5.com"];
  const domain = userEmail.toLowerCase().split("@")[1];
  return adminDomains.includes(domain || "");
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const responses = await getAllResponses();
    
    return NextResponse.json(responses);
  } catch (error: any) {
    console.error("Error fetching all responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
