import React, { useState } from "react";
import { StyleSheet, View, Alert, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  DAMAGE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  RecoveryCase,
  RecoveryPriority,
  DamageType,
} from "@/types/recovery";
import { buildCaseSummary, buildRecoveryPlan } from "@/lib/recovery-plan";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NewProjectScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { addCase, addSteps } = useRecovery();

  const [title, setTitle] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [iosVersion, setIosVersion] = useState("");
  const [damageType, setDamageType] = useState<DamageType>("screen");
  const [priority, setPriority] = useState<RecoveryPriority>("standard");
  const [devicePowersOn, setDevicePowersOn] = useState(true);
  const [knowsPasscode, setKnowsPasscode] = useState(true);
  const [hasAppleIdAccess, setHasAppleIdAccess] = useState(true);
  const [hasBackup, setHasBackup] = useState(true);
  const [lastBackupDate, setLastBackupDate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [proofPhotoUri, setProofPhotoUri] = useState<string | null>(null);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = title.trim().length > 0 && deviceModel.trim().length > 0 && consentConfirmed;

  const handleToggle = (setter: (value: boolean) => void, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;

    setIsCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const now = new Date().toISOString();
      const caseId = `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const recoveryCase: RecoveryCase = {
        id: caseId,
        title: title.trim(),
        ownerName: ownerName.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined,
        deviceModel: deviceModel.trim(),
        iosVersion: iosVersion.trim() || "Unknown",
        damageType,
        devicePowersOn,
        knowsPasscode,
        hasAppleIdAccess,
        hasBackup,
        lastBackupDate: lastBackupDate.trim() || undefined,
        consentConfirmed,
        status: "intake",
        priority,
        createdAt: now,
        updatedAt: now,
        notes: notes.trim() || undefined,
        proofPhotoUri: proofPhotoUri || undefined,
        aiSummary: buildCaseSummary({
          id: caseId,
          title: title.trim(),
          ownerName: ownerName.trim() || undefined,
          ownerEmail: ownerEmail.trim() || undefined,
          ownerPhone: ownerPhone.trim() || undefined,
          deviceModel: deviceModel.trim(),
          iosVersion: iosVersion.trim() || "Unknown",
          damageType,
          devicePowersOn,
          knowsPasscode,
          hasAppleIdAccess,
          hasBackup,
          lastBackupDate: lastBackupDate.trim() || undefined,
          consentConfirmed,
          status: "intake",
          priority,
          createdAt: now,
          updatedAt: now,
          notes: notes.trim() || undefined,
          proofPhotoUri: proofPhotoUri || undefined,
        }),
      };

      const planTemplates = buildRecoveryPlan(recoveryCase);
      const planSteps = planTemplates.map((step, index) => ({
        id: `step_${caseId}_${index}`,
        caseId,
        title: step.title,
        description: step.description,
        category: step.category,
        actionUrl: step.actionUrl,
        status: index === 0 ? "in_progress" : "todo",
      }));

      await addCase(recoveryCase);
      await addSteps(planSteps);
      navigation.replace("CaseDetail", { caseId });
    } catch (error) {
      Alert.alert("Error", "Failed to create case. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <SectionHeader title="Proof of Ownership (optional)" />
        <PhotoPicker imageUri={proofPhotoUri} onImageSelected={setProofPhotoUri} />
        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          Add a receipt, repair ticket, or device label to speed verification.
        </ThemedText>

        <View style={styles.section}>
          <SectionHeader title="Case details" />
          <InputField
            label="Case title"
            placeholder="e.g. iPhone 13 Pro screen damage"
            value={title}
            onChangeText={setTitle}
          />
          <InputField
            label="Device model"
            placeholder="iPhone 13 Pro"
            value={deviceModel}
            onChangeText={setDeviceModel}
          />
          <InputField
            label="iOS version"
            placeholder="iOS 17.3"
            value={iosVersion}
            onChangeText={setIosVersion}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Device condition" />
          <View style={styles.choiceGrid}>
            {DAMAGE_TYPE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setDamageType(option.value)}
                style={[
                  styles.choiceChip,
                  { backgroundColor: theme.backgroundSecondary },
                  option.value === damageType && {
                    borderColor: theme.accent,
                    borderWidth: 2,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.choiceLabel,
                    option.value === damageType && { color: theme.accent },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Priority" />
          <View style={styles.choiceGrid}>
            {PRIORITY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setPriority(option.value)}
                style={[
                  styles.choiceChip,
                  { backgroundColor: theme.backgroundSecondary },
                  option.value === priority && {
                    borderColor: theme.accent,
                    borderWidth: 2,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.choiceLabel,
                    option.value === priority && { color: theme.accent },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Access checks" />
          <ToggleRow
            label="Device powers on"
            value={devicePowersOn}
            onToggle={() => handleToggle(setDevicePowersOn, devicePowersOn)}
          />
          <ToggleRow
            label="Passcode is known"
            value={knowsPasscode}
            onToggle={() => handleToggle(setKnowsPasscode, knowsPasscode)}
          />
          <ToggleRow
            label="Apple ID access available"
            value={hasAppleIdAccess}
            onToggle={() => handleToggle(setHasAppleIdAccess, hasAppleIdAccess)}
          />
          <ToggleRow
            label="Backup exists"
            value={hasBackup}
            onToggle={() => handleToggle(setHasBackup, hasBackup)}
          />
          {hasBackup ? (
            <InputField
              label="Last backup date (optional)"
              placeholder="2026-01-20"
              value={lastBackupDate}
              onChangeText={setLastBackupDate}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Owner contact" />
          <InputField
            label="Owner name"
            placeholder="Full name"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <InputField
            label="Email"
            placeholder="you@example.com"
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="Phone"
            placeholder="(555) 555-5555"
            value={ownerPhone}
            onChangeText={setOwnerPhone}
            keyboardType="phone-pad"
          />
          <InputField
            label="Notes"
            placeholder="Any extra details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Consent & ownership" />
          <Pressable
            onPress={() => handleToggle(setConsentConfirmed, consentConfirmed)}
            style={[
              styles.consentCard,
              { backgroundColor: theme.backgroundSecondary },
              consentConfirmed && { borderColor: theme.success, borderWidth: 2 },
            ]}
          >
            <View style={styles.consentRow}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.border },
                  consentConfirmed && { backgroundColor: theme.success },
                ]}
              >
                {consentConfirmed ? (
                  <Feather name="check" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <ThemedText style={styles.consentText}>
                I confirm I am the device owner (or authorized by the owner) and
                agree to follow official recovery procedures. No bypassing
                security or unauthorized access.
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <Button
          onPress={handleCreate}
          disabled={!canCreate || isCreating}
          style={styles.createButton}
        >
          {isCreating ? "Creating..." : "Create Recovery Case"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggleRow, { backgroundColor: theme.backgroundSecondary }]}
    >
      <ThemedText style={styles.toggleLabel}>{label}</ThemedText>
      <View
        style={[
          styles.togglePill,
          { backgroundColor: value ? theme.success : theme.backgroundTertiary },
        ]}
      >
        <ThemedText style={styles.toggleText}>
          {value ? "Yes" : "No"}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  hint: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  choiceLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  toggleRow: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  togglePill: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  consentCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  consentRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  consentText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    marginTop: Spacing.xl,
  },
});
