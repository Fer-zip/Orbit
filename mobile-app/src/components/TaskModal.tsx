import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/store";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TaskModal({ visible, onClose }: TaskModalProps) {
  const { createTodo } = useAppStore();
  const accentColor = useAppStore((state) => state.accentColor);
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM",
  );
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (title.trim()) {
      await createTodo(title.trim(), date.getTime(), importance);
      setTitle("");
      setDate(new Date());
      setImportance("MEDIUM");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>Nueva Tarea</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <ThemedText style={styles.closeBtnText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Ej: Comprar postre"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <ThemedText style={styles.label}>Importancia</ThemedText>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    importance === "LOW" && { backgroundColor: "#4CAF50" },
                  ]}
                  onPress={() => setImportance("LOW")}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      importance === "LOW" && { color: "#FFF" },
                    ]}
                  >
                    Baja
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    importance === "MEDIUM" && { backgroundColor: "#FFC107" },
                  ]}
                  onPress={() => setImportance("MEDIUM")}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      importance === "MEDIUM" && { color: "#000" },
                    ]}
                  >
                    Media
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    importance === "HIGH" && { backgroundColor: "#F44336" },
                  ]}
                  onPress={() => setImportance("HIGH")}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      importance === "HIGH" && { color: "#FFF" },
                    ]}
                  >
                    Alta
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.label}>Fecha</ThemedText>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.datePickerText}>
                  {date.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: accentColor }]}
                onPress={handleSave}
              >
                <ThemedText style={styles.saveBtnText}>
                  Guardar Tarea
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1E1E24",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.five,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "bold" },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFF",
    padding: Spacing.four,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: Spacing.four,
  },
  label: {
    color: "#888",
    marginBottom: Spacing.two,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  chip: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  chipText: {
    color: "#888",
    fontWeight: "bold",
  },
  datePickerBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: Spacing.four,
    borderRadius: 12,
    marginBottom: Spacing.four,
  },
  datePickerText: {
    color: "#FFF",
    fontSize: 16,
  },
  saveBtn: {
    // backgroundColor: "#4E5AFE",
    padding: Spacing.four,
    borderRadius: 30,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});
