import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { NoteList } from "@/models/NoteList";
import { useAppStore } from "@/store";

interface ListOptionsModalProps {
  visible: boolean;
  list: NoteList | null;
  onClose: () => void;
}

const COLOR_PALETTE = [
  "#4CAF50", // Green
  "#F44336", // Red
  "#FFEB3B", // Yellow
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#FF9800", // Orange
];

export function ListOptionsModal({
  visible,
  list,
  onClose,
}: ListOptionsModalProps) {
  const { updateNoteList } = useAppStore();
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (list) {
      setEditTitle(list.title);
    }
  }, [list]);

  if (!list) return null;

  const handleSaveName = async () => {
    if (editTitle.trim() && editTitle !== list.title) {
      await updateNoteList(list.id, { title: editTitle.trim() });
    }
    onClose();
  };

  const handleChangeColor = async (color: string) => {
    await updateNoteList(list.id, { color });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.sectionTitle}>Renombrar Lista</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholderTextColor="#888"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                  <ThemedText style={styles.saveBtnText}>Guardar</ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.sectionTitle}>Cambiar Color</ThemedText>
              <View style={styles.colorRow}>
                {COLOR_PALETTE.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      list.color === c && styles.colorCircleSelected,
                    ]}
                    onPress={() => handleChangeColor(c)}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1E1E1E",
    borderRadius: Spacing.four,
    padding: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: Spacing.two,
    marginTop: Spacing.four,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#FFF",
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  saveBtn: {
    backgroundColor: Colors.dark.tint,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFF",
  },
  cancelBtn: {
    marginTop: Spacing.four,
    alignItems: "center",
    padding: Spacing.three,
  },
  cancelBtnText: {
    color: "#888",
    fontWeight: "bold",
  },
});
