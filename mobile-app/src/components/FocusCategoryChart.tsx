import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { ThemedText } from "./themed-text";
import { useAppStore } from "@/store";
import { Spacing } from "@/constants/theme";

const screenWidth = Dimensions.get("window").width;

export function FocusCategoryChart() {
  const timeSessions = useAppStore((state) => state.timeSessions);
  const accentColor = useAppStore((state) => state.accentColor);
  const templates = useAppStore((state) => state.focusTemplates);

  // Obtener fecha de inicio del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtrar sesiones del mes actual
  const thisMonthSessions = timeSessions.filter(
    (s) => s.created_at >= startOfMonth,
  );

  // Mapear categorías (templates) y sumar minutos o contar veces
  // En este caso, sumaremos los minutos totales por cada categoría
  const categoryStats: Record<string, number> = {};
  templates.forEach((t) => (categoryStats[t.id] = 0));

  thisMonthSessions.forEach((s) => {
    if (s.task_title && categoryStats[s.task_title] !== undefined) {
      // Sumamos la duración (o podemos sumar 1 para contar "veces")
      // El usuario pidió "cuántas veces se hizo enfoque", pero minutos es más valioso.
      // Mostraremos las "veces" (sesiones completadas).
      categoryStats[s.task_title] += 1;
    }
  });

  const labels = Object.keys(categoryStats).map((key) => key.substring(0, 3)); // Ej: "Est", "Eje", "Lec"
  const data = Object.values(categoryStats);

  const hasData = data.some((d) => d > 0);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Enfoque por Categoría (Mes)</ThemedText>
      <BarChart
        data={{
          labels,
          datasets: [{ data: hasData ? data : [0, 0, 0, 0] }],
        }}
        width={screenWidth - Spacing.four * 2}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        chartConfig={{
          backgroundColor: "#1E1E1E",
          backgroundGradientFrom: "#1E1E1E",
          backgroundGradientTo: "#1E1E1E",
          decimalPlaces: 0, // No decimales para "veces"
          color: (opacity = 1) => {
            const hex = accentColor.replace("#", "");
            const r =
              parseInt(
                hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2),
                16,
              ) || 156;
            const g =
              parseInt(
                hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4),
                16,
              ) || 39;
            const b =
              parseInt(
                hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6),
                16,
              ) || 176;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          },
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.05)",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.four,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacing.two,
  },
});
