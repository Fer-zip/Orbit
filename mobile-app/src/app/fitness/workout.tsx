import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFitnessStore } from "@/store/fitness";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { routines, activeWorkout, completeSet, skipRest, endWorkout } =
    useFitnessStore();
  const [timeLeft, setTimeLeft] = useState(0);

  const routine = activeWorkout
    ? routines.find((r) => r.id === activeWorkout.routineId)
    : null;
  const currentExercise =
    routine && activeWorkout
      ? routine.exercises[activeWorkout.activeExerciseIndex]
      : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeWorkout?.isResting && activeWorkout.restEndTime) {
      interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((activeWorkout.restEndTime! - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining === 0) {
          // Timer finished
          useFitnessStore.setState((state) => ({
            activeWorkout: state.activeWorkout
              ? { ...state.activeWorkout, isResting: false }
              : null,
          }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout?.isResting, activeWorkout?.restEndTime]);

  if (!activeWorkout || !routine || !currentExercise) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={{ color: "#FFF" }}>
          Entrenamiento finalizado o no encontrado.
        </ThemedText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backBtnText}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleComplete = () => {
    completeSet();
  };

  const handleEnd = () => {
    endWorkout();
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.routineName}>{routine.name}</ThemedText>
        <TouchableOpacity onPress={handleEnd} style={styles.endBtn}>
          <ThemedText style={styles.endBtnText}>Finalizar</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* CURRENT EXERCISE INFO */}
        <View style={[styles.card, { borderColor: routine.color }]}>
          <ThemedText style={styles.exerciseName}>
            {currentExercise.name}
          </ThemedText>
          {currentExercise.notes && (
            <ThemedText style={styles.notes}>
              {currentExercise.notes}
            </ThemedText>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statLabel}>Set</ThemedText>
              <ThemedText style={styles.statValue}>
                {activeWorkout.currentSet}{" "}
                <ThemedText style={{ fontSize: 16, color: "#888" }}>
                  / {currentExercise.sets}
                </ThemedText>
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statLabel}>Reps</ThemedText>
              <ThemedText style={styles.statValue}>
                {currentExercise.reps}
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statLabel}>Peso</ThemedText>
              <ThemedText style={styles.statValue}>
                {currentExercise.weight || "-"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* REST TIMER OR ACTION BUTTON */}
        <View style={styles.actionArea}>
          {activeWorkout.isResting ? (
            <View style={styles.restContainer}>
              <View style={styles.timerCircle}>
                <ThemedText style={styles.timerText}>
                  {formatTime(timeLeft)}
                </ThemedText>
                <ThemedText style={styles.restLabel}>Descansando</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={skipRest}
              >
                <ThemedText style={styles.skipBtnText}>
                  Saltar Descanso
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: routine.color }]}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-done" size={48} color="#FFF" />
              <ThemedText style={styles.completeText}>Completar Set</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  backBtnText: { color: "#FFF", fontWeight: "bold" },

  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#111",
  },
  routineName: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  endBtn: {
    backgroundColor: "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  endBtnText: { color: "#FFF", fontWeight: "bold" },

  content: { padding: 20, paddingBottom: 60 },

  card: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 40,
    alignItems: "center",
  },
  exerciseName: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  notes: { color: "#AAA", fontSize: 14, textAlign: "center", marginBottom: 20 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  statBox: { alignItems: "center" },
  statLabel: { color: "#888", fontSize: 14, marginBottom: 4 },
  statValue: { color: "#FFF", fontSize: 28, fontWeight: "900" },

  actionArea: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },

  completeBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  completeText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },

  restContainer: { alignItems: "center" },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  restLabel: { color: "#4CAF50", fontSize: 16, fontWeight: "bold" },

  skipBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 12,
  },
  skipBtnText: { color: "#FFF" },
});
