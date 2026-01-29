import React from "react";
import { StyleSheet, View, FlatList, Image, Pressable } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { GateDesign, GATE_STYLES, MATERIALS } from "@/types/gate2go";
import { formatMoney } from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteType = RouteProp<RootStackParamList, "DesignGallery">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DesignGalleryScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { getProjectDesigns } = useApp();
  const { projectId } = route.params;

  const designs = getProjectDesigns(projectId);

  const handleDesignPress = (design: GateDesign) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("DesignDetail", {
      projectId,
      designId: design.id,
    });
  };

  const getStyleLabel = (style: string) =>
    GATE_STYLES.find((s) => s.value === style)?.label ?? style;

  const getMaterialLabel = (material: string) =>
    MATERIALS.find((m) => m.value === material)?.label ?? material;

  const renderDesignCard = ({ item }: { item: GateDesign }) => (
    <Pressable
      onPress={() => handleDesignPress(item)}
      style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
    >
      {item.thumbnailUri ? (
        <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
      ) : (
        <View
          style={[
            styles.thumbnail,
            styles.placeholderThumbnail,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="image" size={24} color={theme.textSecondary} />
        </View>
      )}
      {item.selectedByClient ? (
        <View style={[styles.selectedBadge, { backgroundColor: theme.success }]}>
          <Feather name="check" size={12} color="#FFFFFF" />
        </View>
      ) : null}
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {getStyleLabel(item.gateStyle)} {"\u2022"} {getMaterialLabel(item.material)}
        </ThemedText>
        <ThemedText style={[styles.cardPrice, { color: theme.textSecondary }]}>
          Total: {formatMoney(item.totalPriceCents)}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={designs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        columnWrapperStyle={styles.row}
        renderItem={renderDesignCard}
        ListEmptyComponent={
          <EmptyState
            icon="grid"
            title="No Designs Yet"
            description="Save a version from the Design tab to see it here."
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
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 120,
  },
  placeholderThumbnail: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardPrice: {
    fontSize: 12,
  },
});
