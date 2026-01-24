import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/storage";

// Check if user is admin (Fusion5 email domain)
function isAdmin(userEmail: string): boolean {
  const adminDomains = ["fusion5.com.au", "fusion5.com"];
  const domain = userEmail.toLowerCase().split("@")[1];
  return adminDomains.includes(domain || "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const userId = decodeURIComponent(params.userId);
    const response = await getResponse(userId);
    
    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
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
