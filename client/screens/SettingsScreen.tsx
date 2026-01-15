import React from "react";
import { StyleSheet, View, Alert, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as storage from "@/lib/storage";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings, updateSettings, refreshData } = useApp();

  const handleRestorePurchases = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateSettings({
      hasActiveSubscription: true,
      subscriptionTier: "premium",
    });
  };

  const handleEndSubscription = () => {
    Alert.alert(
      "End Subscription",
      "Are you sure you want to end your subscription? This is for testing purposes only.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Subscription",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            updateSettings({
              hasActiveSubscription: false,
              subscriptionTier: "essential",
            });
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your projects and designs. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await storage.clearAllData();
            await refreshData();
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ hasCompletedOnboarding: false });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <View style={styles.section}>
          <SectionHeader title="Subscription" />
          <View
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.row}>
              <ThemedText>Status</ThemedText>
              <ThemedText
                style={{
                  color: settings.hasActiveSubscription
                    ? theme.success
                    : theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {settings.hasActiveSubscription ? "Active" : "Inactive"}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText>Tier</ThemedText>
              <ThemedText style={{ fontWeight: "500" }}>
                {settings.subscriptionTier === "premium" ? "Premium" : "Essential"}
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={handleRestorePurchases}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="refresh-cw" size={18} color={theme.accent} />
            <ThemedText style={[styles.buttonText, { color: theme.accent }]}>
              Restore Purchases
            </ThemedText>
          </Pressable>
          {settings.hasActiveSubscription ? (
            <Pressable
              onPress={handleEndSubscription}
              style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather name="x-circle" size={18} color={theme.error} />
              <ThemedText style={[styles.buttonText, { color: theme.error }]}>
                End Subscription (Testing)
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Defaults" />
          <View
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.inputRow}>
              <ThemedText>Markup %</ThemedText>
              <InputField
                value={String(settings.defaultMarkupPercent)}
                onChangeText={(text) =>
                  updateSettings({ defaultMarkupPercent: parseFloat(text) || 0 })
                }
                keyboardType="decimal-pad"
                style={styles.smallInput}
              />
            </View>
            <View style={styles.inputRow}>
              <ThemedText>Labor (cents)</ThemedText>
              <InputField
                value={String(settings.defaultLaborCents)}
                onChangeText={(text) =>
                  updateSettings({ defaultLaborCents: parseInt(text) || 0 })
                }
                keyboardType="number-pad"
                style={styles.smallInput}
              />
            </View>
            <View style={styles.inputRow}>
              <ThemedText>Tax %</ThemedText>
              <InputField
                value={String(settings.defaultTaxPercent)}
                onChangeText={(text) =>
                  updateSettings({ defaultTaxPercent: parseFloat(text) || 0 })
                }
                keyboardType="decimal-pad"
                style={styles.smallInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Branding (Proposal)" />
          <View
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <InputField
              label="Company name"
              value={settings.brandingCompanyName}
              onChangeText={(text) =>
                updateSettings({ brandingCompanyName: text })
              }
              placeholder="Your company name"
            />
            <InputField
              label="Phone"
              value={settings.brandingPhone}
              onChangeText={(text) => updateSettings({ brandingPhone: text })}
              placeholder="Contact phone"
              keyboardType="phone-pad"
            />
            <InputField
              label="Email"
              value={settings.brandingEmail}
              onChangeText={(text) => updateSettings({ brandingEmail: text })}
              placeholder="Contact email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Data" />
          <Pressable
            onPress={handleResetOnboarding}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="rotate-ccw" size={18} color={theme.textSecondary} />
            <ThemedText style={styles.buttonText}>Reset Onboarding</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleDeleteAllData}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
            <ThemedText style={[styles.buttonText, { color: theme.error }]}>
              Delete All Data
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  smallInput: {
    width: 100,
    textAlign: "right",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
