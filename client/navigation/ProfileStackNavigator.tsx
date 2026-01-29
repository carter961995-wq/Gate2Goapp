import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SupportScreen from "@/screens/ProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type SupportStackParamList = {
  Support: undefined;
};

const Stack = createNativeStackNavigator<SupportStackParamList>();

export default function SupportStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: "Support",
        }}
      />
    </Stack.Navigator>
  );
}
