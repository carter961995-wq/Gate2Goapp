export type RecoveryStatus =
  | "intake"
  | "verification"
  | "account_recovery"
  | "device_transfer"
  | "backup_restore"
  | "authorized_service"
  | "completed"
  | "on_hold";

export type DamageType =
  | "screen"
  | "water"
  | "battery"
  | "no_power"
  | "lost"
  | "other";

export type RecoveryPriority = "standard" | "urgent" | "critical";

export type RecoveryStepStatus = "todo" | "in_progress" | "done";

export type RecoveryStepCategory =
  | "consent"
  | "account"
  | "device"
  | "backup"
  | "repair"
  | "transfer";

export type MembershipTier = "starter" | "plus" | "premier";

export interface RecoveryCase {
  id: string;
  title: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  deviceModel: string;
  iosVersion: string;
  damageType: DamageType;
  devicePowersOn: boolean;
  knowsPasscode: boolean;
  hasAppleIdAccess: boolean;
  hasBackup: boolean;
  lastBackupDate?: string;
  consentConfirmed: boolean;
  status: RecoveryStatus;
  priority: RecoveryPriority;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  proofPhotoUri?: string;
  aiSummary?: string;
}

export interface RecoveryStep {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: RecoveryStepStatus;
  category: RecoveryStepCategory;
  actionUrl?: string;
}

export interface RecoverySettings {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  region: string;
  preferredLanguage: string;
  allowNotifications: boolean;
  membershipTier: MembershipTier;
  hasActiveSubscription: boolean;
  dataRetentionDays: number;
}

export const RECOVERY_STATUS_LABELS: Record<RecoveryStatus, string> = {
  intake: "Intake",
  verification: "Verification",
  account_recovery: "Account Recovery",
  device_transfer: "Device Transfer",
  backup_restore: "Backup Restore",
  authorized_service: "Authorized Service",
  completed: "Completed",
  on_hold: "On Hold",
};

export const DAMAGE_TYPE_OPTIONS: { value: DamageType; label: string }[] = [
  { value: "screen", label: "Broken screen" },
  { value: "water", label: "Water damage" },
  { value: "battery", label: "Battery failure" },
  { value: "no_power", label: "No power" },
  { value: "lost", label: "Lost or stolen" },
  { value: "other", label: "Other issue" },
];

export const PRIORITY_OPTIONS: { value: RecoveryPriority; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "urgent", label: "Urgent" },
  { value: "critical", label: "Critical" },
];

export const STEP_STATUS_LABELS: Record<RecoveryStepStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
