import React, { useState } from "react";
import { StyleSheet, View, Alert, Pressable, Image, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as storage from "@/lib/storage";
import { restorePurchases, presentCustomerCenter } from "@/lib/subscriptions";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings, updateSettings, refreshData, subscriptionStatus, refreshSubscriptionStatus } = useApp();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingCustomerCenter, setIsLoadingCustomerCenter] = useState(false);

  const handleRestorePurchases = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRestoring(true);
    
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo) {
        await refreshSubscriptionStatus();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Restored", "Your purchases have been restored.");
      } else {
        Alert.alert("No Purchases Found", "No previous purchases were found for this account.");
      }
    } catch (error) {
      Alert.alert("Restore Failed", "Unable to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoadingCustomerCenter(true);
    
    try {
      await presentCustomerCenter();
      await refreshSubscriptionStatus();
    } catch (error) {
      Alert.alert("Error", "Unable to open subscription management. Please try again.");
    } finally {
      setIsLoadingCustomerCenter(false);
    }
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

  const handlePickLogo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please grant access to your photo library to select a logo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateSettings({ brandingLogoUri: result.assets[0].uri });
    }
  };

  const handleRemoveLogo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ brandingLogoUri: "" });
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
                  color: subscriptionStatus.isActive
                    ? theme.success
                    : theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {subscriptionStatus.isActive ? "Active" : "Inactive"}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText>Plan</ThemedText>
              <ThemedText style={{ fontWeight: "500" }}>
                {subscriptionStatus.isActive 
                  ? subscriptionStatus.isLifetime 
                    ? "Lifetime" 
                    : "Gate2Go Pro"
                  : "Free"}
              </ThemedText>
            </View>
            {subscriptionStatus.expirationDate ? (
              <View style={styles.row}>
                <ThemedText>Renews</ThemedText>
                <ThemedText style={{ color: theme.textSecondary }}>
                  {new Date(subscriptionStatus.expirationDate).toLocaleDateString()}
                </ThemedText>
              </View>
            ) : null}
          </View>
          {subscriptionStatus.isActive ? (
            <Pressable
              onPress={handleManageSubscription}
              style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
              disabled={isLoadingCustomerCenter}
            >
              {isLoadingCustomerCenter ? (
                <ActivityIndicator color={theme.accent} size="small" />
              ) : (
                <>
                  <Feather name="settings" size={18} color={theme.accent} />
                  <ThemedText style={[styles.buttonText, { color: theme.accent }]}>
                    Manage Subscription
                  </ThemedText>
                </>
              )}
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleRestorePurchases}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={theme.accent} size="small" />
            ) : (
              <>
                <Feather name="refresh-cw" size={18} color={theme.accent} />
                <ThemedText style={[styles.buttonText, { color: theme.accent }]}>
                  Restore Purchases
                </ThemedText>
              </>
            )}
          </Pressable>
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
            <View style={styles.logoSection}>
              <ThemedText style={styles.logoLabel}>Company Logo</ThemedText>
              <View style={styles.logoContainer}>
                {settings.brandingLogoUri ? (
                  <Pressable onPress={handlePickLogo}>
                    <Image
                      source={{ uri: settings.brandingLogoUri }}
                      style={styles.logoImage}
                    />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handlePickLogo}
                    style={[
                      styles.logoPlaceholder,
                      { backgroundColor: theme.backgroundTertiary },
                    ]}
                  >
                    <Feather name="image" size={32} color={theme.textSecondary} />
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>
                      Tap to add logo
                    </ThemedText>
                  </Pressable>
                )}
                {settings.brandingLogoUri ? (
                  <Pressable onPress={handleRemoveLogo} style={styles.removeLogoButton}>
                    <Feather name="x" size={16} color={theme.error} />
                  </Pressable>
                ) : null}
              </View>
            </View>
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
  logoSection: {
    gap: Spacing.sm,
  },
  logoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  logoContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  removeLogoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
