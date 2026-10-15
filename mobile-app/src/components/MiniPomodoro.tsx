import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import React, { useState, useEffect } from "react";
import { ThemedText } from "./themed-text";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { SuccessModal } from "./SuccessModal";
import { FocusSessionConfig } from "@/models/FocusSession";

export function MiniPomodoro() {
  const {
    focusState,
    startFocusSession,
    endFocusSession,
    accentColor,
    focusTemplates,
  } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [totalMins, setTotalMins] = useState("120");
  const [breakMins, setBreakMins] = useState("30");
  const [breakDur, setBreakDur] = useState("10");
  const [selectedTemplate, setSelectedTemplate] = useState("Estudio");
  const [showSuccess, setShowSuccess] = useState(false);

  const TEMPLATES = [
    ...focusTemplates,
    {
      id: "Editar", //DEJAR EN EDITAR
      label: "Editar",
      total: parseInt(totalMins) || 120, // Usa el valor del estado totalMins
      icon: "options-outline",
      color: "#888",
    },
  ];

  const currentTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  const handleEmpezar = () => {
    if (selectedTemplate === "Editar") {
      setModalVisible(true);
    } else {
      startTemplate(currentTemplate);
    }
  };

  const startTemplate = async (template: (typeof TEMPLATES)[0]) => {
    const isCustom = selectedTemplate === "Editar";
    const config: FocusSessionConfig = {
      id: Math.random().toString(36).substring(7),
      title: isCustom ? "Personalizado" : template.label,
      total_duration_minutes: isCustom
        ? parseInt(totalMins) || 120
        : template.total,
      break_interval_minutes: isCustom
        ? parseInt(breakMins) || 30
        : template.breakInt,
      break_duration_minutes: isCustom
        ? parseInt(breakDur) || 10
        : template.breakDur,
      created_at: Date.now(),
    };
    await startFocusSession(config);
    setModalVisible(false);
  };

  const handleCustomStart = async () => {
    const config: FocusSessionConfig = {
      id: Math.random().toString(36).substring(7),
      title: "SuperTarea",
      total_duration_minutes: parseInt(totalMins) || 120,
      break_interval_minutes: parseInt(breakMins) || 30,
      break_duration_minutes: parseInt(breakDur) || 10,
      created_at: Date.now(),
    };
    await startFocusSession(config);
    setModalVisible(false);
  };

  const handleStop = async () => {
    await endFocusSession();
  };

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Lógica de intervalo para la SuperTarea (notificaciones / finalizar)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusState.isActive && focusState.started_at && focusState.config) {
      // Fuerza un render inicial
      setElapsedMinutes(
        Math.floor((Date.now() - focusState.started_at) / 60000),
      );

      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - focusState.started_at!) / 60000);

        setElapsedMinutes(elapsed);

        // Check if finished
        if (elapsed >= focusState.config.total_duration_minutes) {
          endFocusSession();
          setShowSuccess(true);
        }
      }, 5000); // chequear cada 5 segundos
    } else {
      setElapsedMinutes(0);
    }
    return () => clearInterval(interval);
  }, [focusState.isActive, focusState.started_at, focusState.config]);

  // Cálculos de Descanso
  let isOnBreak = false;
  let statusText = "Enfoque profundo";
  let statusColor = accentColor;

  if (focusState.isActive && focusState.config) {
    const { break_interval_minutes, break_duration_minutes } =
      focusState.config;
    const cycleDuration = break_interval_minutes + break_duration_minutes;
    const positionInCycle = elapsedMinutes % cycleDuration;

    if (positionInCycle >= break_interval_minutes) {
      isOnBreak = true;
      statusText = "¡Tiempo de descanso! ☕";
      statusColor = "#4CAF50"; // Verde para el descanso
    }
  }

  return (
    <>
      <View
        style={[
          styles.glassCard,
          focusState.isActive
            ? {
                padding: Spacing.five,
                borderColor: accentColor,
                borderWidth: 1,
              }
            : {
                shadowColor: accentColor,
                shadowOpacity: 0.15,
                shadowRadius: 20,
              },
        ]}
      >
        {focusState.isActive && focusState.config ? (
          <View style={styles.activeContainer}>
            <View style={styles.superTaskHeader}>
              <View>
                <ThemedText
                  style={[
                    styles.superTaskTitle,
                    isOnBreak && { color: statusColor },
                  ]}
                >
                  {focusState.config.title}
                </ThemedText>
                <ThemedText
                  style={{
                    color: statusColor,
                    fontSize: 13,
                    marginTop: 2,
                    fontWeight: "600",
                  }}
                >
                  {statusText}
                </ThemedText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Spacing.three,
                }}
              >
                <View
                  style={[styles.pulseDot, { backgroundColor: statusColor }]}
                />
                <TouchableOpacity
                  onPress={handleStop}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
            <ThemedText style={styles.superTaskTime}>
              {new Date(focusState.started_at!).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(
                focusState.started_at! +
                  focusState.config.total_duration_minutes * 60 * 1000,
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </ThemedText>

            {/* Barra de progreso */}
            <View
              style={{
                height: 4,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                marginTop: Spacing.three,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  backgroundColor: statusColor,
                  width: `${Math.min(100, (elapsedMinutes / focusState.config.total_duration_minutes) * 100)}%`,
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.launcherContainer}>
            {/* <ThemedText>Modo Enfoque</ThemedText> */}

            {/* ScrollView Horizontal para Plantillas */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesScroll}
            >
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <TouchableOpacity
                    key={tpl.id}
                    onPress={() => {
                      setSelectedTemplate(tpl.id);
                      if (tpl.id === "Editar") {
                        setModalVisible(true);
                      }
                    }}
                    style={[
                      styles.templateCard,
                      {
                        borderColor: isSelected
                          ? tpl.color
                          : "rgba(255,255,255,0.05)",
                      },
                      isSelected && { backgroundColor: `${tpl.color}15` },
                    ]}
                  >
                    <View style={styles.templateIconRow}>
                      <Ionicons
                        name={tpl.icon as any}
                        size={24}
                        color={isSelected ? tpl.color : "#888"}
                      />
                      <ThemedText
                        style={[
                          styles.templateTitle,
                          { color: isSelected ? "#FFF" : "#888" },
                        ]}
                      >
                        {tpl.label}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.templateDuration}>
                      {tpl.total}m
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Botón Empezar */}
            <TouchableOpacity
              style={[
                styles.mainBtn,
                {
                  backgroundColor: `${accentColor}`,
                  borderColor: "#262626ff",
                  borderWidth: 1,
                },
              ]}
              onPress={handleEmpezar}
            >
              <ThemedText style={styles.mainBtnText}>¡A Trabajar!</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Configurar Enfoque
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Tiempo Total (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={totalMins}
                onChangeText={setTotalMins}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Avisarme cada (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={breakMins}
                onChangeText={setBreakMins}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Duración del descanso (minutos)
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: accentColor }]}
                keyboardType="numeric"
                value={breakDur}
                onChangeText={setBreakDur}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              onPress={handleCustomStart}
            >
              <ThemedText style={styles.saveBtnText}>
                Guardar e Iniciar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Enfoque Finalizado!"
        message="¡Gran trabajo! Has completado tu sesión de enfoque profundo. Tómate un merecido descanso."
      />
    </>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    // backgroundColor: "rgba(30,30,30,0.8)",
    borderRadius: 24,
    // padding: Spacing.five,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: { fontSize: 18, color: "#FFF", fontWeight: "bold" },
  activeContainer: {
    // estilos adaptados para SuperTarea activa
    width: "100%",
  },
  superTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.three,
  },
  superTaskTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    maxWidth: "80%",
  },
  superTaskTime: {
    fontSize: 16,
    color: "#CCC",
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
  },
  pickerText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  inlineDropdownMenu: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",

    position: "absolute",
    top: 73,
    width: "100%",
  },
  dropdownItem: {
    padding: Spacing.four,
  },
  dropdownItemText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

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
    fontSize: 20,
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
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    padding: Spacing.three,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  saveBtn: {
    padding: Spacing.four,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Launcher Styles
  launcherContainer: {
    gap: Spacing.three,
  },
  templatesScroll: {
    gap: Spacing.three,
  },
  templateCard: {
    width: 130,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  templateIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  templateDuration: {
    fontSize: 14,
    color: "#888",
  },
  customizeBtn: {
    width: "100%",
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    alignItems: "center",
  },
  customizeBtnText: {
    fontSize: 16,
    color: "#AAA",
    fontWeight: "500",
  },
  mainBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  mainBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
});
