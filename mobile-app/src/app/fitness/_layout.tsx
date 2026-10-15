import { Stack } from "expo-router";
import React from "react";

export default function FitnessLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Fitness Tracker",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#FFF",
        }}
      />
      <Stack.Screen
        name="routine"
        options={{
          title: "Editor de Rutina",
          headerStyle: { backgroundColor: "#1E1E1E" },
          headerTintColor: "#FFF",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="workout"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
