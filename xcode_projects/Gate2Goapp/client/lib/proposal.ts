import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { GateDesign, AppSettings, Project, GATE_STYLES, MATERIALS } from "@/types/gate2go";
import { formatMoney } from "@/lib/pricing";

export interface ProposalData {
  design: GateDesign;
  project: Project;
  settings: AppSettings;
}

function getStyleLabel(style: string): string {
  return GATE_STYLES.find((s) => s.value === style)?.label || style;
}

function getMaterialLabel(material: string): string {
  return MATERIALS.find((m) => m.value === material)?.label || material;
}

function generateProposalHTML(data: ProposalData): string {
  const { design, project, settings } = data;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const addonsTotal = design.addons.reduce(
    (sum, a) => sum + a.contractorCost.amountCents * a.quantity,
    0
  );

  const logoSection = settings.brandingLogoUri
    ? `<img src="${settings.brandingLogoUri}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;" />`
    : "";

  const companyHeader = settings.brandingCompanyName
    ? `
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
        ${logoSection}
        <div>
          <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">${settings.brandingCompanyName}</h2>
          ${settings.brandingPhone ? `<p style="margin: 4px 0; color: #666;">${settings.brandingPhone}</p>` : ""}
          ${settings.brandingEmail ? `<p style="margin: 4px 0; color: #666;">${settings.brandingEmail}</p>` : ""}
        </div>
      </div>
    `
    : "";

  const addonsSection =
    design.addons.length > 0
      ? `
      <div style="margin-top: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">Add-ons</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${design.addons
            .map(
              (addon) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">${addon.title}</td>
              <td style="padding: 8px 0; text-align: center;">x${addon.quantity}</td>
              <td style="padding: 8px 0; text-align: right;">${formatMoney(addon.contractorCost.amountCents * addon.quantity)}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `
      : "";

  const picketOrientation = design.params.picketOrientation as string | undefined;
  const finialStyle = design.params.finialStyle as string | undefined;

  const customizationSection =
    picketOrientation || finialStyle
      ? `
      <div style="margin-top: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Customization</h4>
        ${picketOrientation ? `<p style="margin: 4px 0;">Picket Style: ${picketOrientation === "vertical" ? "Vertical Pickets" : "Horizontal Slats"}</p>` : ""}
        ${finialStyle && finialStyle !== "none" ? `<p style="margin: 4px 0;">Finial Style: ${finialStyle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>` : ""}
      </div>
    `
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gate Proposal</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #007AFF;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .section {
          margin-bottom: 24px;
        }
        .card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .total-section {
          background: #007AFF;
          color: white;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin-top: 32px;
        }
        .total-amount {
          font-size: 36px;
          font-weight: 700;
          margin: 8px 0;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .spec-label {
          color: #666;
        }
        .spec-value {
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${companyHeader}
        <h1 style="margin: 0; font-size: 28px; color: #1a1a1a;">Gate Proposal</h1>
        <p style="margin: 8px 0 0 0; color: #666;">${today}</p>
      </div>

      <div class="section">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">Project Details</h3>
        <div class="card">
          <div class="spec-row">
            <span class="spec-label">Project</span>
            <span class="spec-value">${project.name}</span>
          </div>
          ${project.clientName ? `
          <div class="spec-row">
            <span class="spec-label">Client</span>
            <span class="spec-value">${project.clientName}</span>
          </div>
          ` : ""}
          ${project.notes ? `
          <div class="spec-row">
            <span class="spec-label">Address</span>
            <span class="spec-value">${project.notes}</span>
          </div>
          ` : ""}
        </div>
      </div>

      <div class="section">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">Gate Specifications</h3>
        <div class="card">
          <div class="spec-row">
            <span class="spec-label">Style</span>
            <span class="spec-value">${getStyleLabel(design.gateStyle)}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Material</span>
            <span class="spec-value">${getMaterialLabel(design.material)}</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Width</span>
            <span class="spec-value">${design.widthFeet} ft</span>
          </div>
          <div class="spec-row">
            <span class="spec-label">Height</span>
            <span class="spec-value">${design.heightFeet} ft</span>
          </div>
          ${customizationSection}
        </div>
      </div>

      <div class="section">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">Pricing Breakdown</h3>
        <div class="card">
          <div class="spec-row">
            <span class="spec-label">Base Price</span>
            <span class="spec-value">${formatMoney(design.basePriceCents)}</span>
          </div>
          ${addonsTotal > 0 ? `
          <div class="spec-row">
            <span class="spec-label">Add-ons</span>
            <span class="spec-value">${formatMoney(addonsTotal)}</span>
          </div>
          ` : ""}
        </div>
        ${addonsSection}
      </div>

      <div class="total-section">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Total Estimate</p>
        <p class="total-amount">${formatMoney(design.totalPriceCents)}</p>
        <p style="margin: 0; font-size: 12px; opacity: 0.7;">Includes labor, markup, and applicable taxes</p>
      </div>

      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
        This proposal is valid for 30 days from the date above.
      </p>
    </body>
    </html>
  `;
}

export async function generateAndShareProposal(data: ProposalData): Promise<void> {
  const html = generateProposalHTML(data);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Gate Proposal - ${data.project.name}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
}

export async function printProposal(data: ProposalData): Promise<void> {
  const html = generateProposalHTML(data);
  await Print.printAsync({ html });
}
