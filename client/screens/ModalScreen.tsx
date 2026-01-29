import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, BorderRadius } from "@/constants/theme";

const TRUST_ITEMS = [
  {
    icon: "lock",
    title: "Consent-first recovery",
    description:
      "We only act with explicit owner authorization and never bypass device security.",
  },
  {
    icon: "shield",
    title: "Security roadmap",
    description:
      "SOC 2 Type II and ISO 27001 certifications are part of our compliance roadmap.",
  },
  {
    icon: "tool",
    title: "Authorized partners",
    description:
      "We route hardware issues to authorized Apple service providers and reputable labs.",
  },
  {
    icon: "file-text",
    title: "Audit trails",
    description:
      "Every recovery action is logged for transparency and accountability.",
  },
  {
    icon: "globe",
    title: "Global privacy",
    description:
      "GDPR/CCPA-aligned data handling with configurable retention windows.",
  },
];

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>SafeRestore Trust Center</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Built for consent-based recovery with transparent controls and
            responsible AI guidance.
          </ThemedText>
        </View>

        {TRUST_ITEMS.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.accent + "20" },
                ]}
              >
                <Feather name={item.icon as any} size={18} color={theme.accent} />
              </View>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            </View>
            <ThemedText style={[styles.cardText, { color: theme.textSecondary }]}>
              {item.description}
            </ThemedText>
          </View>
        ))}

        <View style={[styles.note, { borderColor: theme.border }]}>
          <ThemedText style={[styles.noteText, { color: theme.textSecondary }]}>
            We do not provide passcode bypasses, encryption circumvention, or
            unauthorized data access. If a device cannot be unlocked by the
            owner, we direct users to official recovery and repair options.
          </ThemedText>
        </View>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
