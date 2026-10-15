import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HubScreen() {
  const router = useRouter();
  const accentColor = useAppStore((state) => state.accentColor);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText style={styles.subtitle}>
          Explora plantillas especializadas y herramientas para potenciar tu
          organización.
        </ThemedText>

        <View style={styles.grid}>
          {/* Tarjeta 1: Fitness Tracker */}
          <TouchableOpacity
            style={[styles.card, { borderColor: "rgba(255, 165, 0, 0.3)" }]}
            onPress={() => router.push('/fitness')}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(255, 165, 0, 0.15)" },
              ]}
            >
              <Ionicons name="barbell-outline" size={36} color="#FFA500" />
            </View>
            <ThemedText style={styles.cardTitle}>Fitness Tracker</ThemedText>
            <ThemedText style={styles.cardDesc}>
              Planes de entrenamiento, rutinas y temporizadores.
            </ThemedText>
          </TouchableOpacity>

          {/* Tarjeta 2: Plantillas Deportivas */}
          <TouchableOpacity
            style={[styles.card, { borderColor: "rgba(76, 175, 80, 0.3)" }]}
            onPress={() => router.push('/lineups')}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(76, 175, 80, 0.15)" },
              ]}
            >
              <Ionicons name="football-outline" size={36} color="#4CAF50" />
            </View>
            <ThemedText style={styles.cardTitle}>Alineaciones</ThemedText>
            <ThemedText style={styles.cardDesc}>
              Estrategias, plantillas y pizarras tácticas.
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.four,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: Spacing.five,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    borderRadius: 20,
    padding: Spacing.four,
    width: "48%", // 2 columns
    borderWidth: 1,
    marginBottom: Spacing.three,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.one,
  },
  cardDesc: {
    fontSize: 12,
    color: "#888",
    lineHeight: 18,
  },
});
