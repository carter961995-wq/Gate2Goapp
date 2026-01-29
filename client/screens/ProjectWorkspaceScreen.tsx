import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RECOVERY_STATUS_LABELS, STEP_STATUS_LABELS } from "@/types/recovery";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "CaseDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProjectWorkspaceScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { cases, getCaseSteps, updateStep } = useRecovery();
  const { caseId } = route.params;

  const recoveryCase = cases.find((c) => c.id === caseId);
  const steps = getCaseSteps(caseId);

  if (!recoveryCase) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Case not found"
          description="This recovery case may have been removed."
        />
      </ThemedView>
    );
  }

  const completedSteps = steps.filter((step) => step.status === "done").length;
  const progressLabel =
    steps.length > 0 ? `${completedSteps} of ${steps.length} steps` : "No plan yet";

  const handleToggleStatus = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    const nextStatus =
      step.status === "todo"
        ? "in_progress"
        : step.status === "in_progress"
        ? "done"
        : "todo";
    updateStep({ ...step, status: nextStatus });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <ThemedText style={styles.title}>{recoveryCase.deviceModel}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                {recoveryCase.title}
              </ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                { borderColor: theme.accent },
              ]}
            >
              <ThemedText style={[styles.statusText, { color: theme.accent }]}>
                {RECOVERY_STATUS_LABELS[recoveryCase.status]}
              </ThemedText>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="user" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {recoveryCase.ownerName || "Owner not set"}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="flag" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {recoveryCase.priority.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="tool" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                Damage: {recoveryCase.damageType.replace("_", " ")}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="cloud" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                Backup: {recoveryCase.hasBackup ? "Yes" : "No"}
              </ThemedText>
            </View>
          </View>
        </View>

        {recoveryCase.aiSummary ? (
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.summaryHeader}>
              <Feather name="cpu" size={18} color={theme.accent} />
              <ThemedText style={styles.summaryTitle}>AI Concierge Summary</ThemedText>
            </View>
            <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
              {recoveryCase.aiSummary}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button onPress={() => navigation.navigate("RecoveryPlan", { caseId })}>
            View Recovery Plan
          </Button>
          <Button
            onPress={() => navigation.navigate("TrustCenter")}
            style={{ backgroundColor: theme.backgroundSecondary }}
          >
            Trust Center
          </Button>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Plan progress</ThemedText>
          <ThemedText style={[styles.sectionMeta, { color: theme.textSecondary }]}>
            {progressLabel}
          </ThemedText>
        </View>

        {steps.length === 0 ? (
          <EmptyState
            icon="list"
            title="No plan steps yet"
            description="Create a recovery plan to start tracking progress."
          />
        ) : (
          <View style={styles.stepList}>
            {steps.map((step) => (
              <Pressable
                key={step.id}
                onPress={() =>
                  navigation.navigate("PlanStep", { caseId, stepId: step.id })
                }
                style={[
                  styles.stepCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepTitleRow}>
                    <Feather name="check-circle" size={16} color={theme.accent} />
                    <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleToggleStatus(step.id)}
                    style={[
                      styles.stepStatus,
                      { borderColor: theme.border },
                    ]}
                  >
                    <ThemedText style={styles.stepStatusText}>
                      {STEP_STATUS_LABELS[step.status]}
                    </ThemedText>
                  </Pressable>
                </View>
                <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                  {step.description}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  cardTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionMeta: {
    fontSize: 12,
  },
  stepList: {
    gap: Spacing.md,
  },
  stepCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  stepStatus: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  stepStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
});
