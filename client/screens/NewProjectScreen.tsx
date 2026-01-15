import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { InputField } from "@/components/InputField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing } from "@/constants/theme";
import { Project } from "@/types/gate2go";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NewProjectScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { addProject } = useApp();

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = projectName.trim().length > 0 && photoUri !== null;

  const handleCreate = async () => {
    if (!canCreate || isCreating) return;

    setIsCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const now = new Date().toISOString();
      const project: Project = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: projectName.trim(),
        clientName: clientName.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        sitePhotoUri: photoUri!,
        createdAt: now,
        updatedAt: now,
      };

      await addProject(project);
      navigation.replace("ProjectWorkspace", { projectId: project.id });
    } catch (error) {
      Alert.alert("Error", "Failed to create project. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <SectionHeader title="Jobsite Photo (required)" />
        <PhotoPicker imageUri={photoUri} onImageSelected={setPhotoUri} />
        {!photoUri ? (
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            A jobsite photo is required to start a project.
          </ThemedText>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Project" />
          <InputField
            label="Project name"
            placeholder="Enter project name"
            value={projectName}
            onChangeText={setProjectName}
          />
          <InputField
            label="Notes"
            placeholder="Optional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Client (optional)" />
          <InputField
            label="Client name"
            placeholder="Enter client name"
            value={clientName}
            onChangeText={setClientName}
          />
          <InputField
            label="Phone"
            placeholder="Enter phone number"
            value={clientPhone}
            onChangeText={setClientPhone}
            keyboardType="phone-pad"
          />
          <InputField
            label="Email"
            placeholder="Enter email address"
            value={clientEmail}
            onChangeText={setClientEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button
          onPress={handleCreate}
          disabled={!canCreate || isCreating}
          style={styles.createButton}
        >
          {isCreating ? "Creating..." : "Create Project"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  hint: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  createButton: {
    marginTop: Spacing.xl,
  },
});
