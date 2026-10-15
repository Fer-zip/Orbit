import { Stack } from "expo-router";
import React from "react";

export default function LineupsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Mis Alineaciones",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#FFF",
        }}
      />
      <Stack.Screen
        name="editor"
        options={{
          title: "Pizarra Táctica",
          // headerStyle: { backgroundColor: '#2E7D32' }, // Green header for pitch
          headerTintColor: "#FFF",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
