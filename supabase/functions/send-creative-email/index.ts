import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ApprovedVision {
  creativeVibe?: { label: string; description: string };
  visualDirection?: string;
  colorStory?: Array<{ name: string; hex: string }>;
  hook?: string;
  adCaption?: string;
  whatWeWillCreate?: string[];
}

function buildVisionBlock(vision: ApprovedVision): string {
  const colorDots = (vision.colorStory ?? []).map(c =>
    `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:12px;">
      <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.hex};border:1px solid rgba(255,255,255,0.2);"></span>
      <span style="font-family:Arial,sans-serif;font-size:12px;color:#8eaacf;">${c.name} <span style="color:#3b5280;">${c.hex}</span></span>
    </span>`
  ).join('');

  const deliverables = (vision.whatWeWillCreate ?? []).map(d =>
    `<li style="font-family:Arial,sans-serif;font-size:13px;color:#8eaacf;line-height:1.8;list-style:none;padding-left:0;">✦ ${d}</li>`
  ).join('');

  return `
  <tr>
    <td style="padding:0 40px 32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0c1030;border:1px solid rgba(168,85,247,0.25);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:18px 24px 14px 24px;border-bottom:1px solid rgba(168,85,247,0.15);">
            <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#9333ea;">✦ Approved Creative Vision</span>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px 0 24px;">
            ${vision.creativeVibe ? `
            <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Creative Vibe</p>
            <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;color:#c084fc;font-weight:600;">${vision.creativeVibe.label}</p>
            <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:13px;color:#d1d5db;line-height:1.6;">${vision.creativeVibe.description}</p>
            ` : ''}
            ${vision.hook ? `
            <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Hook</p>
            <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:16px;font-weight:900;color:#ffffff;line-height:1.3;">${vision.hook}</p>
            ` : ''}
            ${vision.colorStory?.length ? `
            <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Color Story</p>
            <p style="margin:0 0 16px 0;">${colorDots}</p>
            ` : ''}
            ${vision.visualDirection ? `
            <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Visual Direction</p>
            <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:13px;color:#d1d5db;line-height:1.6;">${vision.visualDirection}</p>
            ` : ''}
            ${deliverables ? `
            <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">What We Will Create</p>
            <ul style="margin:0 0 16px 0;padding:0;">${deliverables}</ul>
            ` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildNotificationEmail(fullName: string, email: string, brandName: string, niche: string, adFormat: string, description: string, referenceUrl: string, approvedVision?: ApprovedVision): string {
  const field = (label: string, value: string, isLink = false) => `
    <tr>
      <td style="padding: 0 0 16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f1625; border: 1px solid #1e2d4a; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px;">
              <p style="margin: 0 0 4px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5b7fa6;">${label}</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 15px; font-weight: 500; color: #e8edf5; line-height: 1.5;">${isLink ? `<a href="${value}" style="color: #22d3ee; text-decoration: none;">${value}</a>` : value}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Free Creative Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060b14;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #060b14; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #0a1020; border-radius: 20px; overflow: hidden; border: 1px solid #1a2640;">
          <tr>
            <td style="background: linear-gradient(135deg, #6d1fc4 0%, #2452c8 50%, #0694b0 100%); padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">CloutKart</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.65);">AI Creatives That Drive Results</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a1020; padding: 28px 40px 0 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background-color: #121d35; border: 1px solid #1e3355; border-radius: 50px; padding: 7px 18px;">
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #22d3ee;">&#x25cf;&nbsp; New Free Creative Request</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a1020; padding: 24px 40px 32px 40px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-family: Arial, sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">Free Creative Requested</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 15px; color: #6b88aa; line-height: 1.6;">A user has submitted a free creative request.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="background: linear-gradient(90deg, transparent, #1e3355, transparent); height: 1px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a1020; padding: 32px 40px 0 40px;">
              <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #3b5280;">Request Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${field("Full Name", fullName)}
                ${field("Email", `mailto:${email}`, true)}
                ${field("Brand Name", brandName)}
                ${field("Industry / Niche", niche)}
                ${field("Ad Format", adFormat)}
                ${referenceUrl ? field("Reference URL", referenceUrl, true) : ""}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a1020; padding: 0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5b7fa6;">Brief Description</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #0c1528; border: 1px solid #1a3050; border-left: 3px solid #6d1fc4; border-radius: 12px; padding: 20px 24px;">
                          <p style="margin: 0; font-family: Arial, sans-serif; font-size: 15px; color: #c8d8f0; line-height: 1.8; white-space: pre-wrap;">${description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${approvedVision ? buildVisionBlock(approvedVision) : ''}
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="background: linear-gradient(90deg, transparent, #1e3355, transparent); height: 1px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a1020; padding: 32px 40px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Your Free Creative Request" style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block; background: linear-gradient(135deg, #6d1fc4, #2452c8, #0694b0); border-radius: 50px; padding: 14px 36px;">Reply to User &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #070d1a; border-top: 1px solid #111e33; padding: 28px 40px; text-align: center; border-radius: 0 0 20px 20px;">
              <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff;">CloutKart</p>
              <p style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 11px; color: #3b5280; letter-spacing: 0.08em; text-transform: uppercase;">AI-Powered Creative Advertising</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #2a4070;"><a href="mailto:inquiry@clout-kart.com" style="color: #2a6090; text-decoration: none;">inquiry@clout-kart.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildUserConfirmationEmail(fullName: string, brandName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Free Creative Request - CloutKart</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060b14;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #060b14; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #0a1020; border-radius: 20px; overflow: hidden; border: 1px solid #1a2640;">
          <tr>
            <td style="background: linear-gradient(135deg, #6d1fc4 0%, #2452c8 50%, #0694b0 100%); padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">CloutKart</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.65);">AI Creatives That Drive Results</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <p style="margin: 0 0 24px 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.3;">
                Request received, ${fullName}!
              </p>
              <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 15px; color: #7a9abd; line-height: 1.8;">
                We've received your free creative request for <strong style="color: #c8d8f0;">${brandName}</strong>. Our team will start working on it and you can expect your creative <strong style="color: #c8d8f0;">within 48 hours.</strong>
              </p>
              <p style="margin: 0 0 32px 0; font-family: Arial, sans-serif; font-size: 15px; color: #7a9abd; line-height: 1.8;">
                You can track the status of your request in your CloutKart dashboard.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #0c1528; border: 1px solid #1a3050; border-left: 3px solid #22d3ee; border-radius: 12px; padding: 20px 24px;">
                    <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #22d3ee;">What Happens Next</p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; color: #8eaacf; line-height: 1.7;">Our creative team will review your brief, craft a high-converting ad creative, and deliver it to you within 48 hours. We'll reach out if we need any clarification.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="background: linear-gradient(90deg, transparent, #1e3355, transparent); height: 1px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px 32px 40px;">
              <p style="margin: 0 0 4px 0; font-family: Arial, sans-serif; font-size: 14px; color: #c8d8f0; font-weight: 600;">— The CloutKart Team</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #3b5280;"><a href="mailto:inquiry@clout-kart.com" style="color: #22d3ee; text-decoration: none;">inquiry@clout-kart.com</a></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #070d1a; border-top: 1px solid #111e33; padding: 24px 40px; text-align: center; border-radius: 0 0 20px 20px;">
              <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff;">CloutKart</p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #2a4070; letter-spacing: 0.08em; text-transform: uppercase;">AI-Powered Creative Advertising</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { fullName, email, brandName, niche, adFormat, description, referenceUrl, approvedVision } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: true, note: "Email service not configured; request saved." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plainText = `New Free Creative Request\n\nUser: ${fullName} (${email})\nBrand: ${brandName}\nNiche: ${niche}\nFormat: ${adFormat}\nReference: ${referenceUrl || "None"}\n\nBrief:\n${description}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CloutKart <inquiry@clout-kart.com>",
        to: ["adhiraj@clout-kart.com", "rounak@clout-kart.com", "shivam@clout-kart.com"],
        subject: `New Free Creative Request from ${fullName} — ${brandName}`,
        text: plainText,
        html: buildNotificationEmail(fullName, email, brandName, niche, adFormat, description, referenceUrl || "", approvedVision),
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CloutKart <inquiry@clout-kart.com>",
        to: [email],
        reply_to: "inquiry@clout-kart.com",
        subject: "Your free creative request is in! — CloutKart",
        text: `Hi ${fullName},\n\nWe've received your free creative request for ${brandName}. Expect delivery within 48 hours.\n\n— The CloutKart Team\ninquiry@clout-kart.com`,
        html: buildUserConfirmationEmail(fullName, brandName),
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-creative-email error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
