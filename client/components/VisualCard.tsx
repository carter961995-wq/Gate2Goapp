import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface VisualCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  isSelected: boolean;
  isLocked?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VisualCard({
  title,
  subtitle,
  icon,
  isSelected,
  isLocked = false,
  onPress,
}: VisualCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    if (!isLocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: isSelected ? theme.accent : theme.cardBorder,
          borderWidth: isSelected ? 2 : 1,
          opacity: isLocked ? 0.6 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather
            name={icon as any}
            size={20}
            color={isSelected ? theme.accent : theme.textSecondary}
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      {isLocked ? (
        <View style={styles.lockIcon}>
          <Feather name="lock" size={14} color={theme.textSecondary} />
        </View>
      ) : null}
      {isSelected ? (
        <View style={[styles.checkIcon, { backgroundColor: theme.accent }]}>
          <Feather name="check" size={12} color="#FFFFFF" />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 88,
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
  },
  lockIcon: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  checkIcon: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
