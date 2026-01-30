import React, { useEffect, useState } from "react";
import { StyleSheet, View, Alert, Pressable, Image, ActivityIndicator, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as AppleAuthentication from "expo-apple-authentication";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import * as storage from "@/lib/storage";
import { reloadAppAsync } from "expo";
import { restorePurchases, presentCustomerCenter } from "@/lib/subscriptions";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { settings, updateSettings, refreshData, subscriptionStatus, refreshSubscriptionStatus } = useApp();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingCustomerCenter, setIsLoadingCustomerCenter] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === "ios");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (Platform.OS !== "ios") {
      setIsAppleAvailable(false);
      return undefined;
    }

    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (isMounted) {
          setIsAppleAvailable(available);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAppleAvailable(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleAppleSignIn = async () => {
    if (isSigningIn) return;
    if (!isAppleAvailable) {
      Alert.alert("Unavailable", "Sign in with Apple is only available on iOS devices.");
      return;
    }

    setIsSigningIn(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(" ");

      await updateSettings({
        hasCompletedAuth: true,
        appleUserId: credential.user,
        appleEmail: credential.email ?? "",
        appleFullName: fullName,
      });
    } catch (error: any) {
      if (error?.code !== "ERR_CANCELED") {
        Alert.alert("Sign in failed", "Unable to sign in with Apple. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSettings({
      appleUserId: "",
      appleEmail: "",
      appleFullName: "",
    });
  };

  const handleFullReset = () => {
    Alert.alert(
      "Reset Entire App",
      "This will reset all settings, show onboarding again, and clear subscription status. Use this to test the full app flow.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await storage.resetAllSettings();
            await storage.clearAllData();
            reloadAppAsync();
          },
        },
      ]
    );
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
          <SectionHeader title="Account" />
          <View
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.row}>
              <ThemedText>Status</ThemedText>
              <ThemedText
                style={{
                  color: settings.appleUserId ? theme.success : theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {settings.appleUserId ? "Signed in" : "Not signed in"}
              </ThemedText>
            </View>
            {settings.appleFullName ? (
              <View style={styles.row}>
                <ThemedText>Name</ThemedText>
                <ThemedText style={{ color: theme.textSecondary }}>
                  {settings.appleFullName}
                </ThemedText>
              </View>
            ) : null}
            {settings.appleEmail ? (
              <View style={styles.row}>
                <ThemedText>Email</ThemedText>
                <ThemedText style={{ color: theme.textSecondary }}>
                  {settings.appleEmail}
                </ThemedText>
              </View>
            ) : null}
            {settings.appleUserId ? (
              <Pressable
                onPress={handleSignOut}
                style={[styles.button, { backgroundColor: theme.backgroundTertiary }]}
              >
                <Feather name="log-out" size={18} color={theme.textSecondary} />
                <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
              </Pressable>
            ) : Platform.OS === "ios" ? (
              isAppleAvailable ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={BorderRadius.sm}
                  style={styles.appleButton}
                  onPress={isSigningIn ? undefined : handleAppleSignIn}
                />
              ) : (
                <ThemedText style={{ color: theme.textSecondary }}>
                  Sign in with Apple is not available on this device.
                </ThemedText>
              )
            ) : (
              <ThemedText style={{ color: theme.textSecondary }}>
                Sign in with Apple is only available on iOS devices.
              </ThemedText>
            )}
          </View>
        </View>

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
            {settings.designCredits > 0 ? (
              <View style={styles.row}>
                <ThemedText>Design Credits</ThemedText>
                <ThemedText style={{ color: theme.accent, fontWeight: "600" }}>
                  {settings.designCredits}
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
          <Pressable
            onPress={handleFullReset}
            style={[styles.button, { backgroundColor: theme.error + "15" }]}
          >
            <Feather name="refresh-cw" size={18} color={theme.error} />
            <ThemedText style={[styles.buttonText, { color: theme.error }]}>
              Reset Entire App (Test Flow)
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
  appleButton: {
    width: "100%",
    height: Spacing.buttonHeight,
  },
});
