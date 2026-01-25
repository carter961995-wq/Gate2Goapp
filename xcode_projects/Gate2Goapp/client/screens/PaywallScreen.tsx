import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { presentPaywall, restorePurchases, purchaseSingleDesign } from "@/lib/subscriptions";

const PRO_FEATURES = [
  { icon: "grid", label: "All gate styles and materials" },
  { icon: "image", label: "Visual designer with live preview" },
  { icon: "file-text", label: "Unlimited projects and proposals" },
  { icon: "star", label: "Priority support" },
];

const SINGLE_FEATURES = [
  { icon: "check", label: "Create 1 complete gate design" },
  { icon: "file-text", label: "Generate professional PDF proposal" },
  { icon: "share-2", label: "Share with your client" },
];

export default function PaywallScreen() {
  const { theme } = useTheme();
  const { settings, updateSettings, refreshSubscriptionStatus } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyingSingle, setIsBuyingSingle] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    try {
      const result = await presentPaywall();
      
      if (result.purchased) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshSubscriptionStatus();
        updateSettings({
          hasActiveSubscription: true,
          subscriptionTier: "premium",
        });
      }
    } catch (error) {
      console.error("Paywall error:", error);
      Alert.alert("Error", "Unable to load subscription options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuySingleDesign = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBuyingSingle(true);
    
    try {
      const result = await purchaseSingleDesign();
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const currentCredits = settings.designCredits || 0;
        await updateSettings({ designCredits: currentCredits + 1 });
        Alert.alert(
          "Purchase Complete",
          "You now have 1 design credit. Create your gate design and generate a proposal!",
          [{ text: "Let's Go" }]
        );
      }
    } catch (error) {
      console.error("Single design purchase error:", error);
      Alert.alert("Error", "Unable to complete purchase. Please try again.");
    } finally {
      setIsBuyingSingle(false);
    }
  };

  const handleRestore = async () => {
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Choose Your Option</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Design professional gates and create proposals for your clients.
          </ThemedText>
        </View>

        <View
          style={[
            styles.optionCard,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.accent },
          ]}
        >
          <View style={styles.optionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
              <Feather name="star" size={24} color={theme.accent} />
            </View>
            <View style={styles.optionTitleContainer}>
              <ThemedText style={styles.optionTitle}>Gate2Go Pro</ThemedText>
              <ThemedText style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                For contractors and professionals
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featuresList}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
                  <Feather name="check" size={12} color={theme.success} />
                </View>
                <ThemedText style={styles.featureText}>
                  {feature.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <Button onPress={handleSubscribe} style={styles.optionButton} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              "View Pro Plans"
            )}
          </Button>
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>or</ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <View
          style={[
            styles.optionCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.optionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.success + "20" }]}>
              <Feather name="home" size={24} color={theme.success} />
            </View>
            <View style={styles.optionTitleContainer}>
              <View style={styles.priceRow}>
                <ThemedText style={styles.optionTitle}>Single Design</ThemedText>
                <ThemedText style={[styles.priceTag, { color: theme.success }]}>$2.99</ThemedText>
              </View>
              <ThemedText style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                Perfect for homeowners
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featuresList}>
            {SINGLE_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
                  <Feather name="check" size={12} color={theme.success} />
                </View>
                <ThemedText style={styles.featureText}>
                  {feature.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <Pressable 
            onPress={handleBuySingleDesign} 
            style={[styles.secondaryButton, { borderColor: theme.accent }]}
            disabled={isBuyingSingle}
          >
            {isBuyingSingle ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <ThemedText style={[styles.secondaryButtonText, { color: theme.accent }]}>
                Buy Single Design - $2.99
              </ThemedText>
            )}
          </Pressable>
        </View>

        <Pressable onPress={handleRestore} style={styles.restoreButton} disabled={isRestoring}>
          {isRestoring ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <ThemedText style={[styles.restoreText, { color: theme.accent }]}>
              Restore Purchases
            </ThemedText>
          )}
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
    padding: Spacing.xl,
    paddingTop: Spacing["2xl"],
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  optionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceTag: {
    fontSize: 18,
    fontWeight: "700",
  },
  featuresList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  optionButton: {
    marginTop: Spacing.xs,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  restoreButton: {
    alignItems: "center",
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
