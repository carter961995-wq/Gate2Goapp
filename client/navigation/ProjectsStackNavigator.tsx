import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import ProjectsListScreen from "@/screens/ProjectsListScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type ProjectsStackParamList = {
  ProjectsList: undefined;
};

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProjectsStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleNewProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("NewProject");
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{
          headerTitle: "Projects",
          headerRight: () => (
            <Pressable onPress={handleNewProject} hitSlop={8}>
              <Feather name="plus" size={24} color={theme.accent} />
            </Pressable>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
