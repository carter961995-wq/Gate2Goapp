import { RecoveryCase, RecoveryStepCategory } from "@/types/recovery";

export interface RecoveryStepTemplate {
  title: string;
  description: string;
  category: RecoveryStepCategory;
  actionUrl?: string;
}

const APPLE_ID_RECOVERY_URL = "https://iforgot.apple.com";
const APPLE_SUPPORT_DEVICE_TRANSFER_URL =
  "https://support.apple.com/HT210216";
const APPLE_SUPPORT_BACKUP_URL = "https://support.apple.com/HT204136";
const APPLE_SUPPORT_REPAIR_URL = "https://support.apple.com/repair";
const APPLE_SUPPORT_ICLOUD_DATA_URL = "https://www.icloud.com";

export function buildRecoveryPlan(caseDetails: RecoveryCase): RecoveryStepTemplate[] {
  const steps: RecoveryStepTemplate[] = [];

  steps.push({
    title: "Confirm ownership and consent",
    description:
      "We only proceed with owner-approved recovery. Verify account access, device serial/IMEI, and consent forms.",
    category: "consent",
  });

  if (!caseDetails.hasAppleIdAccess) {
    steps.push({
      title: "Restore Apple ID access",
      description:
        "Use Apple’s account recovery to regain access before any restore or transfer.",
      category: "account",
      actionUrl: APPLE_ID_RECOVERY_URL,
    });
  }

  if (caseDetails.devicePowersOn && caseDetails.knowsPasscode) {
    steps.push({
      title: "Attempt device-to-device transfer",
      description:
        "If the old device can unlock, use Quick Start to transfer data directly to the new iPhone.",
      category: "transfer",
      actionUrl: APPLE_SUPPORT_DEVICE_TRANSFER_URL,
    });
  } else {
    steps.push({
      title: "Assess physical device recovery options",
      description:
        "If the device cannot unlock or power on, route to authorized service for diagnostics.",
      category: "repair",
      actionUrl: APPLE_SUPPORT_REPAIR_URL,
    });
  }

  if (caseDetails.hasBackup) {
    steps.push({
      title: "Restore from iCloud backup",
      description:
        "Restore your most recent iCloud backup on the new device.",
      category: "backup",
      actionUrl: APPLE_SUPPORT_BACKUP_URL,
    });
  } else {
    steps.push({
      title: "Check iCloud synced data",
      description:
        "Even without a full backup, some data may be synced to iCloud (photos, notes, contacts).",
      category: "backup",
      actionUrl: APPLE_SUPPORT_ICLOUD_DATA_URL,
    });
  }

  steps.push({
    title: "Set up future-safe backups",
    description:
      "Enable iCloud Backup and verify the next scheduled backup after recovery.",
    category: "backup",
    actionUrl: APPLE_SUPPORT_BACKUP_URL,
  });

  return steps;
}

export function buildCaseSummary(caseDetails: RecoveryCase): string {
  const status = caseDetails.devicePowersOn ? "powers on" : "does not power on";
  const access = caseDetails.knowsPasscode ? "passcode available" : "passcode unknown";
  const backup = caseDetails.hasBackup ? "backup located" : "no backup confirmed";

  return `Device ${status}, ${access}, ${backup}. Next steps focus on official Apple recovery paths and authorized service if needed.`;
}
