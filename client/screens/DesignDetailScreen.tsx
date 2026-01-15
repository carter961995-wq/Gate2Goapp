import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Image, Switch } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { GATE_STYLES, MATERIALS } from "@/types/gate2go";
import { formatMoney } from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "DesignDetail">;

export default function DesignDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { designs, updateDesign, addDesign, projects } = useApp();
  const { projectId, designId } = route.params;

  const design = designs.find((d) => d.id === designId);
  const project = projects.find((p) => p.id === projectId);

  const [showOriginal, setShowOriginal] = useState(false);

  if (!design) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Design not found"
          description="This design may have been deleted."
        />
      </ThemedView>
    );
  }

  const getStyleLabel = (style: string) =>
    GATE_STYLES.find((s) => s.value === style)?.label ?? style;

  const getMaterialLabel = (material: string) =>
    MATERIALS.find((m) => m.value === material)?.label ?? material;

  const handleToggleSelected = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateDesign({
      ...design,
      selectedByClient: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicate = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date().toISOString();
    const copy = {
      ...design,
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      selectedByClient: false,
      createdAt: now,
      updatedAt: now,
    };
    await addDesign(copy);
  };

  const displayImageUri = showOriginal
    ? project?.sitePhotoUri
    : design.generatedImageUri;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.imageHeader}>
            <SectionHeader title="Render" />
            <View style={styles.toggleRow}>
              <ThemedText style={[styles.toggleLabel, { color: theme.textSecondary }]}>
                Original
              </ThemedText>
              <Switch
                value={showOriginal}
                onValueChange={setShowOriginal}
                trackColor={{ false: theme.backgroundTertiary, true: theme.accent }}
              />
            </View>
          </View>
          {displayImageUri ? (
            <Image source={{ uri: displayImageUri }} style={styles.image} />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>
                {showOriginal ? "Original photo shown in Workspace" : "No generated render yet"}
              </ThemedText>
            </View>
          )}
        </View>

        <View
          style={[
            styles.selectionCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText>Selected by client</ThemedText>
          <Switch
            value={design.selectedByClient}
            onValueChange={handleToggleSelected}
            trackColor={{ false: theme.backgroundTertiary, true: theme.success }}
          />
        </View>

        <View
          style={[styles.detailsCard, { backgroundColor: theme.backgroundSecondary }]}
        >
          <ThemedText style={styles.detailsTitle}>
            {getStyleLabel(design.gateStyle)} {"\u2022"} {getMaterialLabel(design.material)}
          </ThemedText>
          <ThemedText style={[styles.detailsSize, { color: theme.textSecondary }]}>
            Size: {design.widthFeet}' W x {design.heightFeet}' H
          </ThemedText>
          <ThemedText style={[styles.detailsTotal, { color: theme.accent }]}>
            Total: {formatMoney(design.totalPriceCents)}
          </ThemedText>
        </View>

        <View style={styles.actionsRow}>
          <Button
            onPress={handleDuplicate}
            style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.buttonContent}>
              <Feather name="copy" size={18} color={theme.text} />
              <ThemedText>Duplicate</ThemedText>
            </View>
          </Button>
          <Button onPress={() => {}} style={styles.actionButton}>
            <View style={styles.buttonContent}>
              <Feather name="share" size={18} color="#FFFFFF" />
              <ThemedText style={{ color: "#FFFFFF" }}>Export</ThemedText>
            </View>
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  imageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: 14,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.md,
  },
  imagePlaceholder: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  detailsSize: {
    fontSize: 15,
  },
  detailsTotal: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
