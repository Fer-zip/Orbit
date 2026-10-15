import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/store";
import DateTimePicker from "@react-native-community/datetimepicker";

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EventModal({ visible, onClose }: EventModalProps) {
  const { createEvent } = useAppStore();
  const accentColor = useAppStore((state) => state.accentColor);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [recurrence, setRecurrence] = useState<string>("NONE");
  const [customDays, setCustomDays] = useState<number[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (title.trim()) {
      let finalRecurrence = recurrence;
      if (recurrence === "CUSTOM") {
        if (customDays.length === 0) return; // Must select at least one day
        finalRecurrence = `CUSTOM:${customDays.sort().join(",")}`;
      }

      const eventTitle = title.trim();
      const eventTime = date.getTime();

      // Cierre inmediato del modal para respuesta instantánea (0ms lag)
      setTitle("");
      setDate(new Date());
      setRecurrence("NONE");
      setCustomDays([]);
      onClose();

      // Ejecutar creación en background
      createEvent(eventTitle, eventTime, finalRecurrence);
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
                <ThemedText style={styles.title}>
                  Nuevo Evento (Horario)
                </ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <ThemedText style={styles.closeBtnText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Ej: Entrenar en el gym"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <View style={styles.dateTimeRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>Día</ThemedText>
                  <TouchableOpacity
                    style={styles.datePickerBtn}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <ThemedText style={styles.datePickerText}>
                      {date.toLocaleDateString()}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={{ width: Spacing.four }} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>Hora</ThemedText>
                  <TouchableOpacity
                    style={styles.datePickerBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <ThemedText style={styles.datePickerText}>
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

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

              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <ThemedText style={styles.label}>Repetición</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: Spacing.four }}
              >
                {["NONE", "DAILY", "MONTHLY", "YEARLY", "CUSTOM"].map((rec) => {
                  const labels: Record<string, string> = {
                    NONE: "Una vez",
                    DAILY: "Diario",
                    MONTHLY: "Mensual",
                    YEARLY: "Anual",
                    CUSTOM: "Personalizado",
                  };
                  const isActive = recurrence === rec;
                  return (
                    <TouchableOpacity
                      key={rec}
                      style={[
                        styles.chip,
                        isActive && { backgroundColor: accentColor },
                      ]}
                      onPress={() => {
                        setRecurrence(rec);
                        if (rec !== "CUSTOM") setCustomDays([]);
                      }}
                    >
                      <ThemedText
                        style={[styles.chipText, isActive && { color: "#FFF" }]}
                      >
                        {labels[rec]}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {recurrence === "CUSTOM" && (
                <View style={styles.customDaysRow}>
                  {[
                    { label: "L", value: 1 },
                    { label: "M", value: 2 },
                    { label: "X", value: 3 },
                    { label: "J", value: 4 },
                    { label: "V", value: 5 },
                    { label: "S", value: 6 },
                    { label: "D", value: 0 },
                  ].map((day) => {
                    const isSelected = customDays.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={day.value}
                        style={[
                          styles.dayBubble,
                          isSelected && { backgroundColor: accentColor },
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setCustomDays(
                              customDays.filter((d) => d !== day.value),
                            );
                          } else {
                            setCustomDays([...customDays, day.value]);
                          }
                        }}
                      >
                        <ThemedText
                          style={[
                            styles.dayBubbleText,
                            isSelected && { color: "#FFF" },
                          ]}
                        >
                          {day.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: accentColor }]}
                onPress={handleSave}
              >
                <ThemedText style={styles.saveBtnText}>
                  Guardar en Horario
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
    padding: Spacing.four,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 20,
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
  dateTimeRow: {
    flexDirection: "row",
    marginBottom: Spacing.four,
  },
  label: {
    color: "#888",
    marginBottom: Spacing.two,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  chip: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginRight: 18,
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
  },
  datePickerText: {
    color: "#FFF",
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#4E5AFE",
    padding: Spacing.four,
    borderRadius: 30,
    alignItems: "center",
  },
  customDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  dayBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  dayBubbleText: {
    color: "#888",
    fontWeight: "bold",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});
