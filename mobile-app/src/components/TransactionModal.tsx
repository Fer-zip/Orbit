import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { ThemedText } from "./themed-text";
import { Colors, Spacing } from "@/constants/theme";

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    amount: number,
    description: string,
    type: "ingreso" | "gasto",
  ) => void;
}

export function TransactionModal({
  visible,
  onClose,
  onSave,
}: TransactionModalProps) {
  const [amountStr, setAmountStr] = useState("0");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"ingreso" | "gasto">("gasto");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const EXPENSE_CATEGORIES = [
    { id: "Comida", label: "🍔 Comida" },
    { id: "Transporte", label: "🚕 Transporte" },
    { id: "Entretenimiento", label: "🎬 Ocio" },
    { id: "Servicios", label: "💡 Servicios" },
    { id: "Otros", label: "📦 Otros" },
  ];

  const INCOME_CATEGORIES = [
    { id: "Salario", label: "💼 Salario" },
    { id: "Ventas", label: "📈 Ventas" },
    { id: "Regalos", label: "🎁 Regalos" },
    { id: "Otros", label: "💵 Otros" },
  ];

  const currentCategories =
    type === "gasto" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleKeyPress = (val: string) => {
    if (val === "back") {
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (val === ".") {
      if (!amountStr.includes(".")) setAmountStr((prev) => prev + ".");
    } else {
      setAmountStr((prev) => (prev === "0" ? val : prev + val));
    }
  };

  const handleSave = () => {
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      let finalDesc = description;
      if (!finalDesc) {
        // Seleccionar el primero por defecto si no eligió nada
        finalDesc =
          type === "gasto" ? "[📦 Otros] Gasto" : "[💵 Otros] Ingreso";
      } else {
        // Formatear usando la etiqueta elegida
        finalDesc = `[${description}] ${type === "gasto" ? "Gasto" : "Ingreso"}`;
      }

      onSave(amount, finalDesc, type);
      // Reset
      setAmountStr("0");
      setDescription("");
      onClose();
    }
  };

  const renderKey = (val: string) => (
    <TouchableOpacity
      key={val}
      style={styles.keyBtn}
      onPress={() => handleKeyPress(val)}
    >
      <ThemedText style={styles.keyText}>
        {val === "back" ? "⌫" : val}
      </ThemedText>
    </TouchableOpacity>
  );

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
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <ThemedText style={styles.closeBtnText}>✕</ThemedText>
                </TouchableOpacity>
                <View style={styles.typeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      type === "gasto" && styles.typeBtnActiveGasto,
                    ]}
                    onPress={() => setType("gasto")}
                  >
                    <ThemedText
                      style={[
                        styles.typeText,
                        type === "gasto" && { color: "#FFF" },
                      ]}
                    >
                      Gasto
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      type === "ingreso" && styles.typeBtnActiveIngreso,
                    ]}
                    onPress={() => setType("ingreso")}
                  >
                    <ThemedText
                      style={[
                        styles.typeText,
                        type === "ingreso" && { color: "#FFF" },
                      ]}
                    >
                      Ingreso
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={{ width: 40 }} />
              </View>
              <View style={styles.amountContainer}>
                <ThemedText style={styles.currencySymbol}>S/. </ThemedText>
                <ThemedText
                  style={styles.amountText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {amountStr}
                </ThemedText>
              </View>
              <View style={styles.categoriesContainer}>
                <ThemedText style={styles.categoriesLabel}>
                  Selecciona una categoría:
                </ThemedText>
                <View style={styles.categoriesWrapper}>
                  {currentCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        description === cat.label && {
                          backgroundColor:
                            type === "gasto" ? "#F44336" : "#4CAF50",
                          borderColor: type === "gasto" ? "#F44336" : "#4CAF50",
                        },
                      ]}
                      onPress={() => setDescription(cat.label)}
                    >
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          description === cat.label && {
                            color: "#FFF",
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {cat.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>{" "}
              {!isKeyboardVisible && (
                <View style={styles.keypad}>
                  <View style={styles.keypadRow}>
                    {["1", "2", "3"].map(renderKey)}
                  </View>
                  <View style={styles.keypadRow}>
                    {["4", "5", "6"].map(renderKey)}
                  </View>
                  <View style={styles.keypadRow}>
                    {["7", "8", "9"].map(renderKey)}
                  </View>
                  <View style={styles.keypadRow}>
                    {[".", "0", "back"].map(renderKey)}
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  isKeyboardVisible && { marginTop: Spacing.four },
                ]}
                onPress={handleSave}
              >
                <ThemedText style={styles.saveBtnText}>
                  Guardar Movimiento
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1E1E24",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.four,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: Spacing.four,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 4,
  },
  typeBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 16,
  },
  typeBtnActiveGasto: {
    backgroundColor: "#F44336",
  },
  typeBtnActiveIngreso: {
    backgroundColor: "#4CAF50",
  },
  typeText: {
    color: "#888",
    fontWeight: "bold",
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Spacing.four,
  },
  currencySymbol: {
    fontSize: 32,
    color: "#888",
    marginRight: 4,
    fontWeight: "300",
  },
  amountText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -2,
  },
  descInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFF",
    textAlign: "center",
    fontSize: 18,
    padding: Spacing.four,
    borderRadius: 16,
    // marginBottom: Spacing.six,
    marginBottom: Spacing.four,
  },
  keypad: {
    gap: Spacing.two,
    // marginBottom: Spacing.six,
    marginBottom: Spacing.four,
  },
  keypadRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  keyBtn: {
    flex: 1,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
  },
  saveBtn: {
    backgroundColor: "#4E5AFE", // Color accent moderno (como el morado de la ref)
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoriesContainer: {
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  categoriesLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  categoriesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.two,
  },
  categoryChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  categoryChipText: {
    color: "#CCC",
    fontSize: 14,
  },
});
