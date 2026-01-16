import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { VisualCard } from "@/components/VisualCard";
import { GateStyleCard } from "@/components/GateStyleCard";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  GateStyle,
  Material,
  GateDesign,
  GateDesignDraft,
  GATE_STYLES,
  GATE_STYLE_IMAGES,
  MATERIALS,
} from "@/types/gate2go";
import { calculateBasePrice, calculateTotalPrice, formatMoney } from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

type RouteType = RouteProp<RootStackParamList, "ProjectWorkspace">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProjectWorkspaceScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { projects, settings, addDesign, updateProject, isPremiumLocked } = useApp();
  const { projectId } = route.params;

  const project = projects.find((p) => p.id === projectId);

  const [activeTab, setActiveTab] = useState<"design" | "pricing">("design");
  const [draft, setDraft] = useState<GateDesignDraft>({
    gateStyle: "single_swing",
    material: "steel",
    widthFeet: 12,
    heightFeet: 6,
    params: {},
    addons: [],
    basePriceCents: 0,
    totalPriceCents: 0,
    laborCents: settings.defaultLaborCents,
    markupPercent: settings.defaultMarkupPercent,
    taxPercent: settings.defaultTaxPercent,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const updateDraft = useCallback((updates: Partial<GateDesignDraft>) => {
    setDraft((prev) => {
      const newDraft = { ...prev, ...updates };
      if (
        updates.gateStyle !== undefined ||
        updates.material !== undefined ||
        updates.widthFeet !== undefined ||
        updates.heightFeet !== undefined
      ) {
        newDraft.basePriceCents = calculateBasePrice(
          newDraft.gateStyle,
          newDraft.material,
          newDraft.widthFeet,
          newDraft.heightFeet
        );
      }
      newDraft.totalPriceCents = calculateTotalPrice(
        newDraft.basePriceCents,
        newDraft.addons,
        newDraft.laborCents,
        newDraft.markupPercent,
        newDraft.taxPercent
      );
      return newDraft;
    });
  }, []);

  useEffect(() => {
    const basePrice = calculateBasePrice(
      draft.gateStyle,
      draft.material,
      draft.widthFeet,
      draft.heightFeet
    );
    updateDraft({ basePriceCents: basePrice });
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updateDraft({ generatedImageUri: project?.sitePhotoUri });
    setIsGenerating(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveVersion = async () => {
    if (!project) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const now = new Date().toISOString();
    const design: GateDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: project.id,
      gateStyle: draft.gateStyle,
      material: draft.material,
      widthFeet: draft.widthFeet,
      heightFeet: draft.heightFeet,
      params: draft.params,
      addons: draft.addons,
      basePriceCents: draft.basePriceCents,
      totalPriceCents: draft.totalPriceCents,
      generatedImageUri: draft.generatedImageUri,
      thumbnailUri: draft.generatedImageUri,
      selectedByClient: false,
      createdAt: now,
      updatedAt: now,
    };

    await addDesign(design);
    await updateProject({ ...project, updatedAt: now });
  };

  const handleViewGallery = () => {
    navigation.navigate("DesignGallery", { projectId });
  };

  if (!project) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Project not found"
          description="This project may have been deleted."
        />
      </ThemedView>
    );
  }

  const getStyleInfo = (style: GateStyle) =>
    GATE_STYLES.find((s) => s.value === style);
  const getMaterialInfo = (material: Material) =>
    MATERIALS.find((m) => m.value === material);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab("design")}
          style={[
            styles.tab,
            activeTab === "design" && { borderBottomColor: theme.accent },
          ]}
        >
          <Feather
            name="layers"
            size={18}
            color={activeTab === "design" ? theme.accent : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "design" && { color: theme.accent },
            ]}
          >
            Design
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("pricing")}
          style={[
            styles.tab,
            activeTab === "pricing" && { borderBottomColor: theme.accent },
          ]}
        >
          <Feather
            name="dollar-sign"
            size={18}
            color={activeTab === "pricing" ? theme.accent : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "pricing" && { color: theme.accent },
            ]}
          >
            Options + Price
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + 60,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "design" ? (
          <>
            <View style={styles.previewSection}>
              <SectionHeader title="Live Preview" />
              <View
                style={[
                  styles.previewCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Image
                  source={{ uri: project.sitePhotoUri }}
                  style={styles.previewImage}
                />
                <View
                  style={[
                    styles.previewBadge,
                    { backgroundColor: theme.backgroundDefault },
                  ]}
                >
                  <ThemedText style={styles.previewBadgeText}>
                    {getStyleInfo(draft.gateStyle)?.label} {" \u2022 "}
                    {getMaterialInfo(draft.material)?.label}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Gate Style" />
              <View style={styles.gateStylesGrid}>
                {GATE_STYLES.map((style) => (
                  <View key={style.value} style={styles.gateStyleWrapper}>
                    <GateStyleCard
                      title={style.label}
                      subtitle={style.tier === "premium" ? "Premium" : undefined}
                      image={GATE_STYLE_IMAGES[style.value]}
                      isSelected={draft.gateStyle === style.value}
                      isLocked={isPremiumLocked(style.tier)}
                      onPress={() => updateDraft({ gateStyle: style.value })}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Material" />
              <View style={styles.cardsGrid}>
                {MATERIALS.map((material) => (
                  <View key={material.value} style={styles.cardWrapper}>
                    <VisualCard
                      title={material.label}
                      subtitle={material.tier === "premium" ? "Premium" : "Essential"}
                      icon={material.icon}
                      isSelected={draft.material === material.value}
                      isLocked={isPremiumLocked(material.tier)}
                      onPress={() => updateDraft({ material: material.value })}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Size" />
              <View
                style={[
                  styles.sizeCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View style={styles.sizeRow}>
                  <ThemedText>Width (ft)</ThemedText>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() =>
                        updateDraft({ widthFeet: Math.max(4, draft.widthFeet - 1) })
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundTertiary },
                      ]}
                    >
                      <Feather name="minus" size={18} color={theme.text} />
                    </Pressable>
                    <ThemedText style={styles.stepperValue}>
                      {draft.widthFeet}
                    </ThemedText>
                    <Pressable
                      onPress={() =>
                        updateDraft({ widthFeet: Math.min(30, draft.widthFeet + 1) })
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundTertiary },
                      ]}
                    >
                      <Feather name="plus" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.sizeRow}>
                  <ThemedText>Height (ft)</ThemedText>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() =>
                        updateDraft({ heightFeet: Math.max(3, draft.heightFeet - 1) })
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundTertiary },
                      ]}
                    >
                      <Feather name="minus" size={18} color={theme.text} />
                    </Pressable>
                    <ThemedText style={styles.stepperValue}>
                      {draft.heightFeet}
                    </ThemedText>
                    <Pressable
                      onPress={() =>
                        updateDraft({ heightFeet: Math.min(12, draft.heightFeet + 1) })
                      }
                      style={[
                        styles.stepperButton,
                        { backgroundColor: theme.backgroundTertiary },
                      ]}
                    >
                      <Feather name="plus" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <Button onPress={handleGenerate} disabled={isGenerating}>
                <View style={styles.buttonContent}>
                  {isGenerating ? (
                    <ThemedText style={{ color: "#FFFFFF" }}>
                      Generating...
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText style={{ color: "#FFFFFF" }}>
                        Photoreal Generate
                      </ThemedText>
                      <Feather name="zap" size={18} color="#FFFFFF" />
                    </>
                  )}
                </View>
              </Button>
              <Button
                onPress={handleSaveVersion}
                style={{ backgroundColor: theme.backgroundSecondary }}
              >
                <View style={styles.buttonContent}>
                  <ThemedText>Save Version</ThemedText>
                  <Feather name="save" size={18} color={theme.text} />
                </View>
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <SectionHeader title="Add-ons" />
              <View
                style={[
                  styles.comingSoonCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="package" size={24} color={theme.textSecondary} />
                <ThemedText style={{ color: theme.textSecondary }}>
                  Add-ons configuration coming soon
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Pricing" />
              <View
                style={[
                  styles.pricingCard,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View style={styles.pricingRow}>
                  <ThemedText>Base price</ThemedText>
                  <ThemedText style={styles.pricingValue}>
                    {formatMoney(draft.basePriceCents)}
                  </ThemedText>
                </View>
                <View style={styles.pricingRow}>
                  <ThemedText>Labor</ThemedText>
                  <ThemedText style={styles.pricingValue}>
                    {formatMoney(draft.laborCents)}
                  </ThemedText>
                </View>
                <View style={styles.pricingRow}>
                  <ThemedText>Markup</ThemedText>
                  <ThemedText style={styles.pricingValue}>
                    {draft.markupPercent}%
                  </ThemedText>
                </View>
                <View style={styles.pricingRow}>
                  <ThemedText>Tax</ThemedText>
                  <ThemedText style={styles.pricingValue}>
                    {draft.taxPercent}%
                  </ThemedText>
                </View>
                <View style={[styles.pricingRow, styles.totalRow]}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: theme.accent }]}>
                    {formatMoney(draft.totalPriceCents)}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Button
              onPress={() => {}}
              style={{ backgroundColor: theme.backgroundSecondary }}
            >
              <View style={styles.buttonContent}>
                <ThemedText>Export Proposal</ThemedText>
                <Feather name="share" size={18} color={theme.text} />
              </View>
            </Button>
          </>
        )}

        <Pressable onPress={handleViewGallery} style={styles.galleryLink}>
          <Feather name="grid" size={18} color={theme.accent} />
          <ThemedText style={[styles.galleryLinkText, { color: theme.accent }]}>
            View Design Gallery
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 10,
    paddingTop: 100,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  previewSection: {
    marginBottom: Spacing.xl,
  },
  previewCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
  },
  previewBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  cardWrapper: {
    width: (width - Spacing.lg * 2 - Spacing.sm) / 2,
  },
  sizeCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  comingSoonCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  pricingCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pricingValue: {
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  galleryLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  galleryLinkText: {
    fontSize: 15,
    fontWeight: "500",
  },
  gateStylesGrid: {
    gap: Spacing.md,
  },
  gateStyleWrapper: {
    width: "100%",
  },
});
