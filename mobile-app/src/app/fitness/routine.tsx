import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  KeyboardEvent,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useFitnessStore } from "@/store/fitness";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Exercise, Routine } from "@/models/Fitness";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const COLORS = [
  "#FFA500",
  "#F44336",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#00BCD4",
];

export default function RoutineEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { routines, addRoutine, updateRoutine } = useFitnessStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onShow,
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onHide,
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFocus = (index: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, index * 200),
        animated: true,
      });
    }, 150);
  };

  useEffect(() => {
    if (id) {
      const existing = routines.find((r) => r.id === id);
      if (existing) {
        setName(existing.name);
        setColor(existing.color);
        setExercises(existing.exercises);
      }
    }
  }, [id]);

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: generateId(),
      name: "",
      sets: 3,
      reps: 10,
      restSeconds: 90,
    };
    setExercises([...exercises, newEx]);
  };

  const handleUpdateExercise = (index: number, updates: Partial<Exercise>) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], ...updates };
    setExercises(updated);
  };

  const handleDeleteExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Debes ponerle un nombre a la rutina");
      return;
    }

    // Clean empty exercises
    const cleanExercises = exercises.filter((e) => e.name.trim() !== "");

    if (id) {
      await updateRoutine(id, { name, color, exercises: cleanExercises });
    } else {
      const newId = await addRoutine(name, color);
      await updateRoutine(newId, { exercises: cleanExercises });
    }
    router.back();
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 },
      ]}
    >
      <View style={styles.fixedTopSection}>
        <View style={styles.headerBlock}>
          <ThemedText style={styles.label}>Nombre de la Rutina</ThemedText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Día de Pierna"
            placeholderTextColor="#666"
          />

          <ThemedText style={styles.label}>Color</ThemedText>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.exercisesHeader}>
          <ThemedText style={styles.sectionTitle}>Ejercicios</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleAddExercise}
              style={styles.addExBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <ThemedText style={styles.addExText}>Añadir</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveExBtn, { backgroundColor: color }]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-outline" size={20} color="#FFF" />
              <ThemedText style={styles.saveExText}>Guardar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ÚNICO contenedor scrolleable: Lista de Ejercicios */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              Platform.OS === "ios" && keyboardHeight > 0
                ? keyboardHeight + 40
                : 100,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={40} color="#555" />
            <ThemedText style={styles.emptyText}>
              No hay ejercicios todavía.
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Toca "+ Añadir" arriba para agregar tu primer ejercicio.
            </ThemedText>
          </View>
        ) : (
          exercises.map((ex, index) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exTopRow}>
                <TextInput
                  style={styles.exNameInput}
                  value={ex.name}
                  onChangeText={(txt) =>
                    handleUpdateExercise(index, { name: txt })
                  }
                  onFocus={() => handleFocus(index)}
                  placeholder="Nombre del Ejercicio"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  onPress={() => handleDeleteExercise(index)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>

              <View style={styles.exConfigRow}>
                <View style={styles.configItem}>
                  <ThemedText style={styles.configLabel}>Sets</ThemedText>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={ex.sets.toString()}
                    onFocus={() => handleFocus(index)}
                    onChangeText={(txt) =>
                      handleUpdateExercise(index, { sets: parseInt(txt) || 0 })
                    }
                  />
                </View>
                <View style={styles.configItem}>
                  <ThemedText style={styles.configLabel}>Reps</ThemedText>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={ex.reps.toString()}
                    onFocus={() => handleFocus(index)}
                    onChangeText={(txt) =>
                      handleUpdateExercise(index, { reps: parseInt(txt) || 0 })
                    }
                  />
                </View>
                <View style={styles.configItem}>
                  <ThemedText style={styles.configLabel}>Peso</ThemedText>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor="#666"
                    value={ex.weight ? ex.weight.toString() : ""}
                    onFocus={() => handleFocus(index)}
                    onChangeText={(txt) =>
                      handleUpdateExercise(index, {
                        weight: txt ? parseFloat(txt) : undefined,
                      })
                    }
                  />
                </View>
                <View style={styles.configItem}>
                  <ThemedText style={styles.configLabel}>
                    Descanso (s)
                  </ThemedText>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={ex.restSeconds.toString()}
                    onFocus={() => handleFocus(index)}
                    onChangeText={(txt) =>
                      handleUpdateExercise(index, {
                        restSeconds: parseInt(txt) || 0,
                      })
                    }
                  />
                </View>
              </View>

              <TextInput
                style={styles.notesInput}
                value={ex.notes || ""}
                onFocus={() => handleFocus(index)}
                onChangeText={(txt) =>
                  handleUpdateExercise(index, { notes: txt })
                }
                placeholder="Notas opcionales..."
                placeholderTextColor="#666"
              />
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  fixedTopSection: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  scrollArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    // paddingBottom: 100,
  },
  headerBlock: {
    backgroundColor: "rgba(30,30,30,0.8)",
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  label: { color: "#888", fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: "#111",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: Spacing.four,
  },
  colorRow: { flexDirection: "row", gap: 12 },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
  colorSelected: { borderWidth: 2, borderColor: "#FFF" },

  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "center",
  },
  addExBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  addExText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },
  saveExBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  saveExText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  exerciseCard: {
    backgroundColor: "rgba(40,40,40,0.8)",
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  exTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exNameInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    padding: 0,
  },

  exConfigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  configItem: { flex: 1, alignItems: "center" },
  configLabel: { color: "#888", fontSize: 12, marginBottom: 4 },
  configInput: {
    backgroundColor: "#222",
    color: "#FFF",
    width: "100%",
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
  },

  notesInput: {
    backgroundColor: "#222",
    color: "#FFF",
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 40,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    color: "#AAA",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubText: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 240,
  },
});
