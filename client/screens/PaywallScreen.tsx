import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { VisualCard } from "@/components/VisualCard";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { SubscriptionTier } from "@/types/gate2go";

type BillingPeriod = "monthly" | "yearly";

const FEATURES = [
  { icon: "grid", label: "Visual card selection for every option" },
  { icon: "image", label: "Live Preview & Photoreal Generate" },
  { icon: "file-text", label: "Projects, variants & export" },
];

export default function PaywallScreen() {
  const { theme } = useTheme();
  const { updateSettings } = useApp();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("premium");
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const handleStartTrial = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({
      hasActiveSubscription: true,
      subscriptionTier: selectedTier,
    });
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateSettings({
      hasActiveSubscription: true,
      subscriptionTier: "premium",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Gate2Go</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Start your 7-day free trial. Choose Essential or Premium.
          </ThemedText>
        </View>

        <View style={styles.tiersContainer}>
          <View style={styles.tierRow}>
            <VisualCard
              title="Essential"
              subtitle="Core styles + Wood/Steel"
              icon="check-circle"
              isSelected={selectedTier === "essential"}
              onPress={() => setSelectedTier("essential")}
            />
            <VisualCard
              title="Premium"
              subtitle="All styles + materials + openers"
              icon="star"
              isSelected={selectedTier === "premium"}
              onPress={() => setSelectedTier("premium")}
            />
          </View>
        </View>

        <View
          style={[
            styles.billingToggle,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Pressable
            onPress={() => setBilling("monthly")}
            style={[
              styles.billingOption,
              billing === "monthly" && {
                backgroundColor: theme.backgroundDefault,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.billingText,
                billing === "monthly" && { fontWeight: "600" },
              ]}
            >
              Monthly
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setBilling("yearly")}
            style={[
              styles.billingOption,
              billing === "yearly" && {
                backgroundColor: theme.backgroundDefault,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.billingText,
                billing === "yearly" && { fontWeight: "600" },
              ]}
            >
              Yearly
            </ThemedText>
          </Pressable>
        </View>

        <View
          style={[
            styles.featuresCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText style={styles.featuresTitle}>Includes</ThemedText>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Feather
                name={feature.icon as any}
                size={18}
                color={theme.accent}
              />
              <ThemedText
                style={[styles.featureText, { color: theme.textSecondary }]}
              >
                {feature.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <Button onPress={handleStartTrial} style={styles.ctaButton}>
          Start Free Trial
        </Button>
        <ThemedText style={[styles.billingNote, { color: theme.textSecondary }]}>
          {billing === "monthly"
            ? "Then billed monthly (cancel anytime)"
            : "Then billed yearly (save vs monthly)"}
        </ThemedText>

        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <ThemedText style={[styles.restoreText, { color: theme.accent }]}>
            Restore Purchases
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing["2xl"],
    paddingTop: Spacing["5xl"],
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  tiersContainer: {
    marginBottom: Spacing.xl,
  },
  tierRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  billingToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  billingOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  billingText: {
    fontSize: 15,
  },
  featuresCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    fontSize: 15,
  },
  ctaButton: {
    marginBottom: Spacing.sm,
  },
  billingNote: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  restoreButton: {
    alignItems: "center",
    padding: Spacing.md,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
