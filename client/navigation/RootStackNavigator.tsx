import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import NewCaseScreen from "@/screens/NewProjectScreen";
import CaseDetailScreen from "@/screens/ProjectWorkspaceScreen";
import RecoveryPlanScreen from "@/screens/DesignGalleryScreen";
import PlanStepScreen from "@/screens/DesignDetailScreen";
import TrustCenterScreen from "@/screens/ModalScreen";
import PaywallScreen from "@/screens/PaywallScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  NewCase: undefined;
  CaseDetail: { caseId: string };
  RecoveryPlan: { caseId: string };
  PlanStep: { caseId: string; stepId: string };
  TrustCenter: undefined;
  Membership: undefined;
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
        name="NewCase"
        component={NewCaseScreen}
        options={{
          headerTitle: "New Recovery Case",
        }}
      />
      <Stack.Screen
        name="CaseDetail"
        component={CaseDetailScreen}
        options={{
          headerTitle: "Case Details",
        }}
      />
      <Stack.Screen
        name="RecoveryPlan"
        component={RecoveryPlanScreen}
        options={{
          headerTitle: "Recovery Plan",
        }}
      />
      <Stack.Screen
        name="PlanStep"
        component={PlanStepScreen}
        options={{
          headerTitle: "Plan Step",
        }}
      />
      <Stack.Screen
        name="TrustCenter"
        component={TrustCenterScreen}
        options={{
          headerTitle: "Trust Center",
        }}
      />
      <Stack.Screen
        name="Membership"
        component={PaywallScreen}
        options={{
          headerTitle: "Membership",
        }}
      />
    </Stack.Navigator>
  );
}
