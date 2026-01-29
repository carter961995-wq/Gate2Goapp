import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { MembershipTier } from "@/types/recovery";
import { Spacing, BorderRadius } from "@/constants/theme";

const TIERS: {
  id: MembershipTier;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  icon: keyof typeof Feather.glyphMap;
}[] = [
  {
    id: "starter",
    title: "Starter",
    price: "Free",
    subtitle: "Guided intake + recovery checklist",
    features: [
      "AI recovery plan",
      "Official Apple recovery links",
      "Backup readiness checklist",
    ],
    icon: "star",
  },
  {
    id: "plus",
    title: "Plus",
    price: "$29/mo",
    subtitle: "Concierge guidance + case tracking",
    features: [
      "Priority chat responses",
      "Case timeline and reminders",
      "Authorized service routing",
    ],
    icon: "shield",
  },
  {
    id: "premier",
    title: "Premier",
    price: "$99/mo",
    subtitle: "White-glove recovery support",
    features: [
      "Human escalation within 2 hours",
      "Dedicated recovery specialist",
      "Compliance-grade audit trail",
    ],
    icon: "award",
  },
];

export default function PaywallScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { updateSettings } = useRecovery();

  const handleSelectTier = async (tier: MembershipTier) => {
    await updateSettings({
      membershipTier: tier,
      hasActiveSubscription: tier !== "starter",
    });
    Alert.alert("Plan selected", "Your membership preference was saved.");
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Membership</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            SafeRestore never bypasses security. We guide official, consent-based
            recovery paths and connect you to authorized providers.
          </ThemedText>
        </View>

        <View style={styles.tiers}>
          {TIERS.map((tier) => (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <View style={styles.tierHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.accent + "20" },
                  ]}
                >
                  <Feather name={tier.icon} size={20} color={theme.accent} />
                </View>
                <View style={styles.tierTitle}>
                  <ThemedText style={styles.tierName}>{tier.title}</ThemedText>
                  <ThemedText
                    style={[styles.tierSubtitle, { color: theme.textSecondary }]}
                  >
                    {tier.subtitle}
                  </ThemedText>
                </View>
                <ThemedText style={styles.tierPrice}>{tier.price}</ThemedText>
              </View>
              <View style={styles.features}>
                {tier.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Feather name="check" size={14} color={theme.success} />
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => handleSelectTier(tier.id)}
                style={[
                  styles.selectButton,
                  { borderColor: theme.accent },
                ]}
              >
                <ThemedText style={{ color: theme.accent }}>
                  Choose {tier.title}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </View>

        <Button
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: theme.backgroundSecondary }}
        >
          Back to app
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  tiers: {
    gap: Spacing.md,
  },
  tierCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tierTitle: {
    flex: 1,
  },
  tierName: {
    fontSize: 17,
    fontWeight: "700",
  },
  tierSubtitle: {
    fontSize: 12,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  features: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
});
