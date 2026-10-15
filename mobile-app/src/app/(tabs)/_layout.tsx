import { Tabs, Link } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "react-native";
import { useAppStore } from "@/store";
import { Platform, View, Dimensions, TouchableOpacity } from "react-native";
const { width } = Dimensions.get("window");

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const accentColor = useAppStore((state) => state.accentColor);

  return (
    <>
      <View
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: accentColor,
            tabBarInactiveTintColor: "#888",
            tabBarStyle: {
              backgroundColor: "#232323ff",
              borderWidth: 1,
              borderColor: "#252525ff",
              position: "absolute",
              width: "85%",
              height: "auto",
              bottom: 25,
              borderRadius: 20,
              marginHorizontal: 30,
            },
            headerShown: true,
            headerStyle: {
              backgroundColor: "#000",
              // backgroundColor: "red",
              shadowColor: "transparent", // Remove border shadow on iOS
              elevation: 0, // Remove shadow on Android
            },
            headerTitleStyle: {
              color: "#fff",
              fontSize: 32,
              fontWeight: "900",
              letterSpacing: -0.5,
              marginLeft: 14,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
               title: "Orbit",
               tabBarLabel: "Hoy",
               headerRight: () => (
                 <Link href="/settings" asChild>
                   <TouchableOpacity style={{ marginRight: 16 }}>
                     <Ionicons name="settings-outline" size={28} color="#FFF" />
                   </TouchableOpacity>
                 </Link>
               ),
               tabBarIcon: ({ color, focused }) => (
                 <Ionicons
                   name={focused ? "home" : "home-outline"}
                   size={24}
                   color={color}
                 />
               ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
               title: "Calendario",
               tabBarIcon: ({ color, focused }) => (
                 <Ionicons
                   name={focused ? "calendar" : "calendar-outline"}
                   size={24}
                   color={color}
                 />
               ),
            }}
          />
          <Tabs.Screen
            name="lists"
            options={{
               title: "Mis Listas",
               tabBarLabel: "Listas",
               tabBarIcon: ({ color, focused }) => (
                 <Ionicons
                   name={focused ? "list" : "list-outline"}
                   size={24}
                   color={color}
                 />
               ),
            }}
          />
          <Tabs.Screen
            name="finance"
            options={{
               title: "Finanzas",
               tabBarIcon: ({ color, focused }) => (
                 <Ionicons
                   name={focused ? "wallet" : "wallet-outline"}
                   size={24}
                   color={color}
                 />
               ),
            }}
          />
          <Tabs.Screen
            name="hub"
            options={{
               title: "Otras Funciones",
               tabBarLabel: "Más",
               tabBarIcon: ({ color, focused }) => (
                 <Ionicons
                   name={focused ? "apps" : "apps-outline"}
                   size={24}
                   color={color}
                 />
               ),
            }}
          />
        </Tabs>
      </View>
    </>
  );
}
