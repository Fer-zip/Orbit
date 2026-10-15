import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { useAppStore } from "@/store";

interface FixedExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FixedExpenseModal({
  visible,
  onClose,
}: FixedExpenseModalProps) {
  const { addFixedExpense } = useAppStore();
  const accentColor = useAppStore((state) => state.accentColor);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (name.trim() && !isNaN(val) && val > 0) {
      await addFixedExpense(name.trim(), val);
      setName("");
      setAmount("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ThemedText style={styles.title}>Nuevo Gasto Fijo</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nombre (ej. Netflix, Luz)"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <TextInput
            style={styles.input}
            placeholder="Monto Mensual"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveBtnText}>Añadir</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  sheet: {
    backgroundColor: "#1E1E24",
    width: "100%",
    borderRadius: 24,
    padding: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.five,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFF",
    padding: Spacing.four,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: Spacing.four,
  },
  btnRow: {
    flexDirection: "row",
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cancelBtnText: {
    color: "#888",
    fontWeight: "bold",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
