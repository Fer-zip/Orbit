import React, { useEffect, useState } from "react";
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
import { MiniPomodoro } from "@/components/MiniPomodoro";
import { TaskModal } from "@/components/TaskModal";
import { StatsChart } from "@/components/StatsChart";
import { FocusCategoryChart } from "@/components/FocusCategoryChart";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuperTaskBanner, setShowSuperTaskBanner] = useState(true);
  const tasks = useAppStore((state) => state.tasks);
  const expenses = useAppStore((state) => state.expenses);
  const timeSessions = useAppStore((state) => state.timeSessions);
  const accentColor = useAppStore((state) => state.accentColor);
  const completeTask = useAppStore((state) => state.completeCurrentTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const focusState = useAppStore((state) => state.focusState);

  // Estadísticas (Resumen)
  const completedTasksCount = tasks.filter((t) => t.status === "DONE").length;
  const totalPendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const totalFocusMinutes = timeSessions.reduce(
    (acc, curr) => acc + curr.duration_minutes,
    0,
  );
  const totalFocusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainderMins = totalFocusMinutes % 60;

  const pendingTasks = tasks
    .filter((t) => t.status === "PENDING" && t.type === "TODO")
    .sort((a, b) => (a.due_date || Infinity) - (b.due_date || Infinity))
    .slice(0, 3);

  const recentExpenses = expenses
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 3);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.safeArea]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* 1. Mini Pomodoro */}
          <MiniPomodoro />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
            style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
            decelerationRate="fast"
            snapToInterval={Dimensions.get("window").width}
          >
            <View style={{ width: Dimensions.get("window").width - 32 }}>
              <StatsChart />
            </View>
            <View style={{ width: Dimensions.get("window").width - 20 }}>
              <FocusCategoryChart />
            </View>
          </ScrollView>
          {/* 3. Próximas Tareas */}
          <ThemedText style={styles.sectionTitle}>Próximas Tareas</ThemedText>
          <View
            style={[
              styles.glassCard,
              { shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 15 },
            ]}
          >
            {pendingTasks.length === 0 ? (
              <ThemedText
                style={{ color: "#888", textAlign: "center", padding: 10 }}
              >
                Todo al día.
              </ThemedText>
            ) : (
              pendingTasks.map((t, idx) => {
                const getImportanceColor = (imp?: string) => {
                  if (imp === "HIGH") return "#F44336";
                  if (imp === "LOW") return "#4CAF50";
                  return "#FFC107"; // MEDIUM
                };

                return (
                  <View
                    key={t.id}
                    style={[
                      styles.listItem,
                      idx < pendingTasks.length - 1 && styles.borderBottom,
                    ]}
                  >
                    <View
                      style={[
                        styles.importanceIndicator,
                        { backgroundColor: getImportanceColor(t.importance) },
                      ]}
                    />

                    <View style={styles.taskInfo}>
                      <ThemedText style={styles.itemTitle}>
                        {t.title}
                      </ThemedText>
                      {t.due_date && (
                        <ThemedText style={styles.itemMeta}>
                          {new Date(t.due_date).toLocaleDateString()}
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={async () => {
                          useAppStore.setState({ currentTask: t });
                          await completeTask();
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={26}
                          color="#4CAF50"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => deleteTask(t.id)}
                      >
                        <Ionicons name="trash-outline" size={24} color="#888" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* 4. Últimos Movimientos */}
          <ThemedText style={styles.sectionTitle}>
            Últimos Movimientos
          </ThemedText>
          <View
            style={[
              styles.glassCard,
              { shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 15 },
            ]}
          >
            {recentExpenses.length === 0 ? (
              <ThemedText
                style={{ color: "#888", textAlign: "center", padding: 10 }}
              >
                Sin gastos recientes.
              </ThemedText>
            ) : (
              recentExpenses.map((e, idx) => (
                <View
                  key={e.id}
                  style={[
                    styles.listItem,
                    idx < recentExpenses.length - 1 && styles.borderBottom,
                  ]}
                >
                  <ThemedText style={styles.itemTitle}>
                    {e.description}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.itemMeta,
                      e.amount < 0 && { color: "#4CAF50" },
                    ]}
                  >
                    {e.amount > 0
                      ? `-S/. ${e.amount.toFixed(2)}`
                      : `+S/. ${Math.abs(e.amount).toFixed(2)}`}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Botón Flotante (FAB) */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: accentColor, shadowColor: accentColor },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>

        <TaskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  scroll: { flexGrow: 1, paddingBottom: 80 },
  sectionTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  glassCard: {
    backgroundColor: "rgba(30,30,30,0.8)",
    borderRadius: 20,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.three,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  importanceIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: Spacing.three,
  },
  taskInfo: {
    flex: 1,
    justifyContent: "center",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginLeft: Spacing.two,
  },
  actionBtn: {
    padding: Spacing.one,
  },
  itemTitle: {
    color: "#FFF",
    fontSize: 14,
  },
  itemMeta: {
    color: "#888",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.four,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "300",
  },
});
