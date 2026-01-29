import React from "react";
import { StyleSheet, View, Alert, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as storage from "@/lib/recovery-storage";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { settings, updateSettings, refreshData } = useRecovery();

  const handleResetOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ hasCompletedOnboarding: false });
  };

  const handleClearCases = () => {
    Alert.alert(
      "Clear All Cases",
      "This will permanently remove all recovery cases from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await storage.clearAllData();
            await refreshData();
          },
        },
      ]
    );
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
          <SectionHeader title="Account & Preferences" />
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <InputField
              label="Region"
              value={settings.region}
              onChangeText={(text) => updateSettings({ region: text })}
              placeholder="Global"
            />
            <InputField
              label="Preferred language"
              value={settings.preferredLanguage}
              onChangeText={(text) => updateSettings({ preferredLanguage: text })}
              placeholder="English"
            />
            <Pressable
              onPress={() =>
                updateSettings({ allowNotifications: !settings.allowNotifications })
              }
              style={styles.row}
            >
              <ThemedText>Notifications</ThemedText>
              <View
                style={[
                  styles.togglePill,
                  {
                    backgroundColor: settings.allowNotifications
                      ? theme.success
                      : theme.backgroundTertiary,
                  },
                ]}
              >
                <ThemedText style={styles.toggleText}>
                  {settings.allowNotifications ? "On" : "Off"}
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Membership" />
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.row}>
              <ThemedText>Current plan</ThemedText>
              <ThemedText style={{ fontWeight: "600" }}>
                {settings.membershipTier.toUpperCase()}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => navigation.navigate("Membership" as never)}
              style={[styles.button, { borderColor: theme.accent }]}
            >
              <Feather name="star" size={16} color={theme.accent} />
              <ThemedText style={[styles.buttonText, { color: theme.accent }]}>
                Manage Membership
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Trust & Privacy" />
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <InputField
              label="Data retention (days)"
              value={String(settings.dataRetentionDays)}
              onChangeText={(text) =>
                updateSettings({
                  dataRetentionDays: parseInt(text, 10) || 30,
                })
              }
              keyboardType="number-pad"
            />
            <Pressable
              onPress={() => navigation.navigate("TrustCenter" as never)}
              style={[styles.button, { borderColor: theme.accent }]}
            >
              <Feather name="shield" size={16} color={theme.accent} />
              <ThemedText style={[styles.buttonText, { color: theme.accent }]}>
                Open Trust Center
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Data & Reset" />
          <Pressable
            onPress={handleResetOnboarding}
            style={[styles.actionRow, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="rotate-ccw" size={18} color={theme.textSecondary} />
            <ThemedText style={styles.actionText}>Reset onboarding</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleClearCases}
            style={[styles.actionRow, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
            <ThemedText style={[styles.actionText, { color: theme.error }]}>
              Clear all cases
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
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
