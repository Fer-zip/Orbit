import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  useColorScheme as useNativeColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore, ThemeMode } from "@/store";

const ACCENT_COLORS = [
  { color: "#2196F3", name: "Retro Blue" },
  { color: "#E91E63", name: "Rose Gold Bloom" },
  { color: "#4CAF50", name: "Cyber Green" },
  { color: "#9C27B0", name: "Violet Glow" },
  { color: "#FFC107", name: "Neon Yellow" },
  { color: "#F44336", name: "Crimson Red" },
  { color: "#FFFFFF", name: "Pure White" },
];

export default function SettingsScreen() {
  const {
    accentColor,
    themeMode,
    alarmSound,
    focusTemplates,
    setAccentColor,
    setThemeMode,
    setAlarmSound,
    updateFocusTemplate,
  } = useAppStore();

  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [editBreakInt, setEditBreakInt] = useState("");
  const [editBreakDur, setEditBreakDur] = useState("");

  const openTemplateEdit = (tpl: any) => {
    setEditingTemplate(tpl);
    setEditLabel(tpl.label);
    setEditTotal(tpl.total.toString());
    setEditBreakInt(tpl.breakInt?.toString() || "30");
    setEditBreakDur(tpl.breakDur?.toString() || "5");
  };

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      await updateFocusTemplate(editingTemplate.id, {
        label: editLabel,
        total: parseInt(editTotal) || editingTemplate.total,
        breakInt: parseInt(editBreakInt) || 30,
        breakDur: parseInt(editBreakDur) || 5,
      });
      setEditingTemplate(null);
    }
  };

  return (
    <ThemedView style={[styles.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Modo de Interfaz</ThemedText>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                themeMode === "light" && {
                  borderColor: accentColor,
                  borderWidth: 1,
                  backgroundColor: `${accentColor}15`,
                },
              ]}
              onPress={() => setThemeMode("light")}
            >
              <Ionicons
                name="sunny-outline"
                size={20}
                color={themeMode === "light" ? accentColor : "#888"}
              />
              <ThemedText
                style={[
                  styles.segmentBtnText,
                  themeMode === "light" && { color: accentColor },
                ]}
              >
                Claro
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                themeMode === "dark" && {
                  borderColor: accentColor,
                  borderWidth: 1,
                  backgroundColor: `${accentColor}15`,
                },
              ]}
              onPress={() => setThemeMode("dark")}
            >
              <Ionicons
                name="moon-outline"
                size={20}
                color={themeMode === "dark" ? accentColor : "#888"}
              />
              <ThemedText
                style={[
                  styles.segmentBtnText,
                  themeMode === "dark" && { color: accentColor },
                ]}
              >
                Oscuro
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Color de Acento</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorGrid}
          >
            {ACCENT_COLORS.map((item) => {
              const isSelected = accentColor === item.color;
              return (
                <View key={item.color} style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    style={[
                      styles.colorCard,
                      { backgroundColor: "rgba(30,30,30,0.7)" },
                      isSelected && {
                        borderColor: item.color,
                        borderWidth: 1,
                        backgroundColor: `${item.color}15`,
                      },
                      !isSelected && {
                        borderColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setAccentColor(item.color)}
                  >
                    <View style={styles.mockupHeader}>
                      <ThemedText style={{ fontSize: 6, color: "#FFF" }}>
                        Orbit
                      </ThemedText>
                      <Ionicons name="moon" size={6} color="#888" />
                    </View>
                    <View style={styles.mockupContent}>
                      <View
                        style={[
                          styles.mockupCircle,
                          { borderColor: item.color },
                        ]}
                      />
                      <View
                        style={[
                          styles.mockupCircle,
                          { borderColor: item.color },
                        ]}
                      />
                    </View>
                    {isSelected && (
                      <View
                        style={[
                          styles.selectedCheck,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <ThemedText style={styles.colorName}>{item.name}</ThemedText>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sonido de Alarma</ThemedText>
          <View style={styles.glassList}>
            {[
              {
                id: "digital",
                name: "Digital",
                icon: "hardware-chip-outline" as const,
              },
              {
                id: "default",
                name: "Sistema",
                icon: "options-outline" as const,
              },
              {
                id: "bell",
                name: "Campana",
                icon: "notifications-outline" as const,
              },
            ].map((sound, idx) => {
              const isSelected = alarmSound === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[styles.soundItem, idx < 2 && styles.borderBottom]}
                  onPress={() => setAlarmSound(sound.id)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: Spacing.four,
                    }}
                  >
                    <Ionicons
                      name={sound.icon}
                      size={28}
                      color={isSelected ? accentColor : "#888"}
                    />
                    <ThemedText
                      style={[
                        styles.soundText,
                        isSelected && { color: accentColor },
                      ]}
                    >
                      {sound.name}
                    </ThemedText>
                  </View>
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={18} color="#888" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Plantillas Modo Enfoque
          </ThemedText>
          <View style={styles.glassList}>
            {focusTemplates.map((tpl: any, idx: number) => (
              <TouchableOpacity
                key={tpl.id}
                style={[
                  styles.soundItem,
                  idx < focusTemplates.length - 1 && styles.borderBottom,
                ]}
                onPress={() => openTemplateEdit(tpl)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.four,
                  }}
                >
                  <Ionicons name={tpl.icon} size={28} color={tpl.color} />
                  <View>
                    <ThemedText style={styles.soundText}>
                      {tpl.label}
                    </ThemedText>
                    <ThemedText style={{ color: "#888", fontSize: 12 }}>
                      {tpl.total} minutos
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.playBtn}>
                  <Ionicons name="pencil" size={18} color="#888" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Padding final para evitar que la barra lo tape */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal para Editar Plantilla */}
      <Modal visible={!!editingTemplate} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditingTemplate(null)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Editar Plantilla
              </ThemedText>
              <TouchableOpacity onPress={() => setEditingTemplate(null)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nombre</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                value={editLabel}
                onChangeText={setEditLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Duración Total (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={editTotal}
                onChangeText={setEditTotal}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Avisar cada (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={editBreakInt}
                onChangeText={setEditBreakInt}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Duración del descanso (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={editBreakDur}
                onChangeText={setEditBreakDur}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              onPress={handleSaveTemplate}
            >
              <ThemedText style={styles.saveBtnText}>
                Guardar Cambios
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.four,
    color: "#E0E0E0",
  },
  // Resto de estilos...
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.five,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    color: "#CCC",
    marginBottom: Spacing.two,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    padding: Spacing.three,
    borderRadius: 12,
    fontSize: 16,
  },
  saveBtn: {
    padding: Spacing.four,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    borderRadius: 26,
    gap: Spacing.two,
  },
  segmentBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
  },
  colorGrid: {
    gap: Spacing.four,
    paddingRight: Spacing.four,
  },
  colorCard: {
    width: 120,
    height: 120,
    borderRadius: 20,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  mockupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mockupContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
  },
  mockupCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    opacity: 0.6,
  },
  selectedCheck: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  colorName: {
    fontSize: 12,
    color: "#888",
  },
  glassList: {
    backgroundColor: "rgba(30,30,30,0.7)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.five,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  soundText: {
    fontSize: 18,
    color: "#E0E0E0",
    fontWeight: "500",
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  glassCardBase: {
    backgroundColor: "rgba(30,30,30,0.7)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
