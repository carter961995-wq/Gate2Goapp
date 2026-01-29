import React, { useState } from "react";
import { StyleSheet, View, FlatList, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { CaseCard } from "@/components/CaseCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useRecovery } from "@/context/RecoveryContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProjectsListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { cases } = useRecovery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = cases.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.title.toLowerCase().includes(query) ||
      c.deviceModel.toLowerCase().includes(query) ||
      (c.ownerName?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleCasePress = (caseId: string) => {
    navigation.navigate("CaseDetail", { caseId });
  };

  const handleNewCase = () => {
    navigation.navigate("NewCase");
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        ListHeaderComponent={
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search cases, device, owner..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        renderItem={({ item }) => (
          <CaseCard
            recoveryCase={item}
            onPress={() => handleCasePress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title="No Recovery Cases"
            description="Start a new intake to build a consent-based recovery plan."
            actionLabel="Start Recovery"
            onAction={handleNewCase}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  separator: {
    height: Spacing.sm,
  },
});
