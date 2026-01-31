import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email recipient for all contact forms
const CONTACT_EMAIL = "fabriziomendezalberti@gmail.com";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  type: "demo" | "contact" | "pricing";
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, company, message, type } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build email subject based on type
    const subjects = {
      demo: `FlowState Demo Request from ${name}`,
      contact: `FlowState Contact from ${name}`,
      pricing: `FlowState Pricing Inquiry from ${name}`,
    };

    const subject = subjects[type] || subjects.contact;

    // Build HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .value { color: #111827; font-size: 16px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8B5CF6; }
            .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🌊 FlowState</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${type === "demo" ? "New Demo Request" : type === "pricing" ? "Pricing Inquiry" : "Contact Form Submission"}</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}" style="color: #8B5CF6;">${email}</a></div>
              </div>
              ${company ? `
              <div class="field">
                <div class="label">Company</div>
                <div class="value">${company}</div>
              </div>
              ` : ""}
              <div class="field">
                <div class="label">Message</div>
                <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from FlowState at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
FlowState ${type === "demo" ? "Demo Request" : type === "pricing" ? "Pricing Inquiry" : "Contact"}

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ""}

Message:
${message}

---
Sent from FlowState at ${new Date().toLocaleString()}
    `.trim();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "FlowState <onboarding@resend.dev>", // Use your verified domain once set up
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
