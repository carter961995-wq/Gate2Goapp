import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function AuthScreen() {
  const { theme } = useTheme();
  const { updateSettings } = useApp();
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

  const handleContinue = async () => {
    await updateSettings({ hasCompletedAuth: true });
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

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={styles.title}>Welcome to Gate2Go</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in with Apple to get started. You can continue without signing in.
        </ThemedText>

        <View style={styles.actions}>
          {Platform.OS === "ios" && isAppleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={BorderRadius.sm}
              style={styles.appleButton}
              onPress={isSigningIn ? undefined : handleAppleSignIn}
            />
          ) : (
            <View
              style={[
                styles.unavailable,
                { borderColor: theme.border, backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>
                Sign in with Apple is only available on iOS devices.
              </ThemedText>
            </View>
          )}

          <Button onPress={handleContinue} style={styles.continueButton}>
            Continue without signing in
          </Button>
        </View>

        <ThemedText style={[styles.footer, { color: theme.textSecondary }]}>
          You can update your sign-in choice anytime in Settings.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing["2xl"],
    justifyContent: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    gap: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.md,
  },
  appleButton: {
    height: Spacing.buttonHeight,
    width: "100%",
  },
  continueButton: {
    width: "100%",
  },
  unavailable: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: "center",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
  },
});
