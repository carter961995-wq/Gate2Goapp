import React from "react";
import { StyleSheet, View, Pressable, Linking, Alert } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { STEP_STATUS_LABELS } from "@/types/recovery";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "PlanStep">;

export default function DesignDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { steps, updateStep } = useRecovery();
  const { stepId } = route.params;

  const step = steps.find((s) => s.id === stepId);

  if (!step) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.missing}>Step not found.</ThemedText>
      </ThemedView>
    );
  }

  const handleOpenLink = async () => {
    if (!step.actionUrl) return;
    try {
      await Linking.openURL(step.actionUrl);
    } catch {
      Alert.alert("Unable to open link", "Please try again later.");
    }
  };

  const handleAdvanceStatus = () => {
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
      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <Feather name="check-circle" size={18} color={theme.accent} />
            <ThemedText style={styles.title}>{step.title}</ThemedText>
          </View>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            {step.description}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={[styles.statusPill, { borderColor: theme.border }]}>
              <ThemedText style={styles.statusText}>
                {STEP_STATUS_LABELS[step.status]}
              </ThemedText>
            </View>
            <View style={styles.categoryPill}>
              <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                {step.category.replace("_", " ")}
              </ThemedText>
            </View>
          </View>
        </View>

        {step.actionUrl ? (
          <Pressable
            onPress={handleOpenLink}
            style={[styles.linkCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="external-link" size={18} color={theme.accent} />
            <View style={styles.linkText}>
              <ThemedText style={styles.linkTitle}>Open official guidance</ThemedText>
              <ThemedText style={[styles.linkSubtitle, { color: theme.textSecondary }]}>
                {step.actionUrl}
              </ThemedText>
            </View>
          </Pressable>
        ) : null}

        <Button onPress={handleAdvanceStatus}>Update Step Status</Button>
        <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
          SafeRestore only uses official recovery methods. We never bypass device
          security or access data without explicit owner consent.
        </ThemedText>
      </View>
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
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryPill: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  linkCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  linkText: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  linkSubtitle: {
    fontSize: 11,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  missing: {
    marginTop: Spacing.xl,
    textAlign: "center",
  },
});
