import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import CasesListScreen from "@/screens/ProjectsListScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type CasesStackParamList = {
  CasesList: undefined;
};

const Stack = createNativeStackNavigator<CasesStackParamList>();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CasesStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleNewCase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("NewCase");
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CasesList"
        component={CasesListScreen}
        options={{
          headerTitle: "Recovery Cases",
          headerRight: () => (
            <Pressable onPress={handleNewCase} hitSlop={8}>
              <Feather name="plus" size={24} color={theme.accent} />
            </Pressable>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
