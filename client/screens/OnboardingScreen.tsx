import React, { useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "camera",
    title: "Design gates on-site",
    description:
      "Take a jobsite photo, choose a style and material, then customize with options and pricing.",
  },
  {
    icon: "dollar-sign",
    title: "Pricing & Proposals",
    description:
      "Add options like keypads, latches, drop rods, and openers. Generate professional proposals instantly.",
  },
  {
    icon: "folder",
    title: "Manage Projects",
    description:
      "Save design versions, track client preferences, and keep all your gate projects organized.",
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { updateSettings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      updateSettings({ hasCompletedOnboarding: true });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        key={currentSlide}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.slideContainer}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name={slide.icon as any} size={48} color={theme.accent} />
        </View>
        <ThemedText style={styles.title}>{slide.title}</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {slide.description}
        </ThemedText>
      </Animated.View>

      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentSlide ? theme.accent : theme.backgroundTertiary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        {currentSlide > 0 ? (
          <Button
            onPress={handleBack}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText>Back</ThemedText>
          </Button>
        ) : (
          <View style={styles.button} />
        )}
        <Button onPress={handleNext} style={styles.button}>
          {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  slideContainer: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing["4xl"],
    marginBottom: Spacing["3xl"],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
