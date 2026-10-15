import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "./themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAppStore } from "@/store";
import { Task } from "@/models/Task";

interface TaskEditModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export function TaskEditModal({ visible, task, onClose }: TaskEditModalProps) {
  const { updateTask, deleteTask } = useAppStore();
  const [recurrenceType, setRecurrenceType] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeVal, setTimeVal] = useState<Date>(new Date());

  useEffect(() => {
    if (task && task.recurrence_rule) {
      try {
        const rule = JSON.parse(task.recurrence_rule);
        setRecurrenceType(rule.type);
      } catch (e) {
        setRecurrenceType(null);
      }
    } else {
      setRecurrenceType(null);
    }

    if (task?.due_date && task.has_time) {
      setTimeVal(new Date(task.due_date));
    } else {
      setTimeVal(new Date());
    }
  }, [task]);

  if (!task) return null;

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  const setRecurrence = async (type: "days" | "weeks" | "months") => {
    let interval = 1;
    if (type === "days") interval = 1;
    if (type === "weeks") interval = 1;
    if (type === "months") interval = 1;

    const ruleStr = JSON.stringify({ type, interval });
    await updateTask(task.id, { recurrence_rule: ruleStr });
    setRecurrenceType(type);
  };

  const removeRecurrence = async () => {
    await updateTask(task.id, { recurrence_rule: undefined });
    setRecurrenceType(null);
  };

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && event.type !== "dismissed") {
      setTimeVal(selectedDate);
      await updateTask(task.id, {
        due_date: selectedDate.toISOString(),
        has_time: true,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>Editar Tarea</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <ThemedText style={styles.closeBtnText}>X</ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>

              <ThemedText style={styles.sectionTitle}>
                Hora de la tarea
              </ThemedText>
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setShowTimePicker(true)}
                >
                  <ThemedText style={styles.timeBtnText}>
                    {task?.has_time && task.due_date
                      ? new Date(task.due_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Todo el día (Añadir hora)"}
                  </ThemedText>
                </TouchableOpacity>
                {task?.has_time && (
                  <TouchableOpacity
                    style={styles.removeTimeBtn}
                    onPress={() => updateTask(task.id, { has_time: false })}
                  >
                    <ThemedText
                      style={{ color: "#F44336", fontWeight: "bold" }}
                    >
                      X
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={timeVal}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                />
              )}

              <ThemedText style={styles.sectionTitle}>
                Hacer Recurrente
              </ThemedText>
              <View style={styles.recurrenceRow}>
                <TouchableOpacity
                  style={[
                    styles.recBtn,
                    recurrenceType === "days" && styles.recBtnActive,
                  ]}
                  onPress={() => setRecurrence("days")}
                >
                  <ThemedText style={styles.recBtnText}>Diario</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.recBtn,
                    recurrenceType === "weeks" && styles.recBtnActive,
                  ]}
                  onPress={() => setRecurrence("weeks")}
                >
                  <ThemedText style={styles.recBtnText}>Semanal</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.recBtn,
                    recurrenceType === "months" && styles.recBtnActive,
                  ]}
                  onPress={() => setRecurrence("months")}
                >
                  <ThemedText style={styles.recBtnText}>Mensual</ThemedText>
                </TouchableOpacity>
              </View>

              {recurrenceType && (
                <TouchableOpacity
                  onPress={removeRecurrence}
                  style={styles.removeRecBtn}
                >
                  <ThemedText style={{ color: "#F44336", textAlign: "center" }}>
                    Quitar repetición
                  </ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <ThemedText style={styles.deleteBtnText}>
                  Eliminar Tarea
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
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.five,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeBtn: {
    padding: Spacing.two,
  },
  closeBtnText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskTitle: {
    fontSize: 18,
    color: Colors.dark.tint,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: Spacing.two,
  },
  recurrenceRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  recBtn: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  recBtnActive: {
    backgroundColor: Colors.dark.tint,
  },
  recBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  removeRecBtn: {
    marginBottom: Spacing.six,
  },
  deleteBtn: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderWidth: 1,
    borderColor: "#F44336",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
    marginTop: Spacing.four,
  },
  deleteBtnText: {
    color: "#F44336",
    fontWeight: "bold",
  },
  timeRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.four,
    alignItems: "center",
  },
  timeBtn: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  timeBtnText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  removeTimeBtn: {
    padding: Spacing.three,
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: "#F44336",
  },
});
