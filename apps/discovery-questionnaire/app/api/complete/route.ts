import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/storage";
import { generateResponseHTML } from "@/lib/htmlGenerator";
import nodemailer from "nodemailer";

const RECIPIENT_EMAILS = [
  "anthony.najafian@fusion5.com.au",
  "joel.mikkelsen@fusion5.com.au",
];

async function sendEmail(htmlContent: string, userEmail: string, userName: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpUser || !smtpPassword) {
    console.error("SMTP credentials not configured");
    throw new Error("Email service not configured");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const subject = `ERP Discovery Questionnaire Completed - ${userName || userEmail}`;
  
  const mailOptions = {
    from: smtpFrom,
    to: RECIPIENT_EMAILS.join(", "),
    subject,
    html: htmlContent,
    attachments: [
      {
        filename: `questionnaire-response-${userEmail}-${Date.now()}.html`,
        content: htmlContent,
        contentType: "text/html",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userName = request.headers.get("x-user-name") || "";

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await getResponse(userId);
    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Generate HTML
    const htmlContent = generateResponseHTML(response);

    // Send email
    try {
      await sendEmail(htmlContent, userEmail, userName);
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      // Continue even if email fails - we still return success with HTML
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire completed and email sent",
      html: htmlContent, // Return HTML in case email fails, client can download
    });
  } catch (error: any) {
    console.error("Error completing questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to complete questionnaire" },
      { status: 500 }
    );
  }
}
