import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { presentPaywall, restorePurchases } from "@/lib/subscriptions";

const FEATURES = [
  { icon: "grid", label: "All gate styles and materials" },
  { icon: "image", label: "Visual designer with live preview" },
  { icon: "file-text", label: "Unlimited projects and proposals" },
  { icon: "star", label: "Priority support" },
];

export default function PaywallScreen() {
  const { theme } = useTheme();
  const { updateSettings, refreshSubscriptionStatus } = useApp();
  const [isLoading, setIsLoading] = useState(false);
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
          <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
            <Feather name="star" size={48} color={theme.accent} />
          </View>
          <ThemedText style={styles.title}>Gate2Go Pro</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Unlock all features and take your gate business to the next level.
          </ThemedText>
        </View>

        <View
          style={[
            styles.featuresCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText style={styles.featuresTitle}>What's included</ThemedText>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.checkIcon, { backgroundColor: theme.success + "20" }]}>
                <Feather name="check" size={14} color={theme.success} />
              </View>
              <ThemedText style={styles.featureText}>
                {feature.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.plansCard, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={styles.plansTitle}>Choose your plan</ThemedText>
          
          <View style={styles.planOption}>
            <View>
              <ThemedText style={styles.planName}>Monthly</ThemedText>
              <ThemedText style={[styles.planDetail, { color: theme.textSecondary }]}>
                Billed monthly, cancel anytime
              </ThemedText>
            </View>
          </View>
          
          <View style={[styles.planDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.planOption}>
            <View>
              <ThemedText style={styles.planName}>Yearly</ThemedText>
              <ThemedText style={[styles.planDetail, { color: theme.textSecondary }]}>
                Best value - save over 30%
              </ThemedText>
            </View>
            <View style={[styles.saveBadge, { backgroundColor: theme.success }]}>
              <ThemedText style={styles.saveText}>Best Value</ThemedText>
            </View>
          </View>
          
          <View style={[styles.planDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.planOption}>
            <View>
              <ThemedText style={styles.planName}>Lifetime</ThemedText>
              <ThemedText style={[styles.planDetail, { color: theme.textSecondary }]}>
                One-time purchase, forever access
              </ThemedText>
            </View>
          </View>
        </View>

        <Button onPress={handleSubscribe} style={styles.ctaButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            "View Subscription Options"
          )}
        </Button>
        
        <ThemedText style={[styles.billingNote, { color: theme.textSecondary }]}>
          Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
        </ThemedText>

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
    padding: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
  },
  header: {
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  featuresCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  plansCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  planOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
  },
  planDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  planDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  saveBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  saveText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ctaButton: {
    marginBottom: Spacing.md,
  },
  billingNote: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
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
