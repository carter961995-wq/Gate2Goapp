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
import { RecoveryCase, RECOVERY_STATUS_LABELS } from "@/types/recovery";

interface CaseCardProps {
  recoveryCase: RecoveryCase;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CaseCard({ recoveryCase, onPress }: CaseCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const statusColor =
    recoveryCase.status === "completed"
      ? theme.success
      : recoveryCase.status === "on_hold"
      ? theme.warning
      : theme.accent;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="smartphone" size={18} color={theme.textSecondary} />
          <ThemedText style={styles.name} numberOfLines={1}>
            {recoveryCase.deviceModel}
          </ThemedText>
        </View>
        <View style={[styles.statusPill, { borderColor: statusColor }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {RECOVERY_STATUS_LABELS[recoveryCase.status]}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.caseTitle, { color: theme.textSecondary }]}>
        {recoveryCase.title}
      </ThemedText>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="user" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            {recoveryCase.ownerName || "Owner not set"}
          </ThemedText>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            {formatDate(recoveryCase.updatedAt)}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  caseTitle: {
    fontSize: 13,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
  },
});
