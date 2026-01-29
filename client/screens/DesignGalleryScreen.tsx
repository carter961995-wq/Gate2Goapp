import React from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { STEP_STATUS_LABELS } from "@/types/recovery";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "RecoveryPlan">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DesignGalleryScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { getCaseSteps, cases } = useRecovery();
  const { caseId } = route.params;

  const recoveryCase = cases.find((c) => c.id === caseId);
  const steps = getCaseSteps(caseId);

  const handleStepPress = (stepId: string) => {
    navigation.navigate("PlanStep", {
      caseId,
      stepId,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={steps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {recoveryCase?.deviceModel || "Recovery Plan"}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Official, consent-based steps tailored to this case.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleStepPress(item.id)}
            style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Feather name="check-circle" size={18} color={theme.accent} />
                <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              </View>
              <View style={[styles.statusPill, { borderColor: theme.border }]}>
                <ThemedText style={styles.statusText}>
                  {STEP_STATUS_LABELS[item.status]}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.cardDescription, { color: theme.textSecondary }]}>
              {item.description}
            </ThemedText>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="list"
            title="No recovery plan yet"
            description="Complete intake to generate a recovery plan."
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
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
  separator: {
    height: Spacing.sm,
  },
});
