import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import NewProjectScreen from "@/screens/NewProjectScreen";
import ProjectWorkspaceScreen from "@/screens/ProjectWorkspaceScreen";
import DesignGalleryScreen from "@/screens/DesignGalleryScreen";
import DesignDetailScreen from "@/screens/DesignDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  NewProject: undefined;
  ProjectWorkspace: { projectId: string };
  DesignGallery: { projectId: string };
  DesignDetail: { projectId: string; designId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewProject"
        component={NewProjectScreen}
        options={{
          headerTitle: "New Project",
        }}
      />
      <Stack.Screen
        name="ProjectWorkspace"
        component={ProjectWorkspaceScreen}
        options={{
          headerTitle: "Project",
        }}
      />
      <Stack.Screen
        name="DesignGallery"
        component={DesignGalleryScreen}
        options={{
          headerTitle: "Design Gallery",
        }}
      />
      <Stack.Screen
        name="DesignDetail"
        component={DesignDetailScreen}
        options={{
          headerTitle: "Design Detail",
        }}
      />
    </Stack.Navigator>
  );
}
