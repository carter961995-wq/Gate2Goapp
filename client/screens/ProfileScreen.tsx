import React from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { cases } = useRecovery();

  const latestCase = cases[0];

  const handleAction = (label: string) => {
    Alert.alert("Request received", `${label} will be available in a live build.`);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Concierge Support</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Talk to SafeRestore AI or request a human specialist. We only use
            official, consent-based recovery paths.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <Feather name="cpu" size={18} color={theme.accent} />
            <ThemedText style={styles.cardTitle}>AI Concierge Status</ThemedText>
          </View>
          <ThemedText style={[styles.cardText, { color: theme.textSecondary }]}>
            {latestCase
              ? `Tracking ${latestCase.deviceModel}. I can help verify Apple ID access and guide you through the next official step.`
              : "Start a recovery case to receive personalized guidance."}
          </ThemedText>
          <Button onPress={() => handleAction("Live chat")}>Start Live Chat</Button>
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => handleAction("Secure document upload")}
            style={[
              styles.actionCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="upload" size={20} color={theme.accent} />
            <ThemedText style={styles.actionTitle}>Upload Ownership Proof</ThemedText>
            <ThemedText style={[styles.actionText, { color: theme.textSecondary }]}>
              Receipts, device labels, or service records.
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleAction("Schedule a call")}
            style={[
              styles.actionCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="phone" size={20} color={theme.accent} />
            <ThemedText style={styles.actionTitle}>Request a Call</ThemedText>
            <ThemedText style={[styles.actionText, { color: theme.textSecondary }]}>
              Connect with a recovery specialist.
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleAction("Authorized service referral")}
            style={[
              styles.actionCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="tool" size={20} color={theme.accent} />
            <ThemedText style={styles.actionTitle}>Find Authorized Repair</ThemedText>
            <ThemedText style={[styles.actionText, { color: theme.textSecondary }]}>
              Locate approved service providers.
            </ThemedText>
          </Pressable>
        </View>

        <View style={[styles.notice, { borderColor: theme.border }]}>
          <ThemedText style={[styles.noticeText, { color: theme.textSecondary }]}>
            SafeRestore never bypasses device security. If a device cannot be
            unlocked, we guide you to official recovery and authorized repair
            channels.
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionGrid: {
    gap: Spacing.md,
  },
  actionCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  notice: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
