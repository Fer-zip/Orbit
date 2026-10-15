import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import { Colors, Spacing } from "@/constants/theme";
import { NoteList } from "@/models/NoteList";
import { useAppStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";

interface ListEditorModalProps {
  visible: boolean;
  list: NoteList | null;
  onClose: () => void;
}

export function ListEditorModal({
  visible,
  list,
  onClose,
}: ListEditorModalProps) {
  const { updateNoteList } = useAppStore();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (list) {
      setContent(list.content || "");
    }
  }, [list, visible]);

  if (!list) return null;

  const handleSave = async () => {
    if (content !== list.content) {
      await updateNoteList(list.id, { content });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleSave} // Save when physical back button is pressed
    >
      <SafeAreaView style={[styles.container, { backgroundColor: "#1E1E1E" }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[styles.header, { borderBottomColor: `${list.color}50` }]}
          >
            <TouchableOpacity onPress={handleSave} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={list.color} />
            </TouchableOpacity>
            <ThemedText style={styles.title} numberOfLines={1}>
              {list.title}
            </ThemedText>
            <View style={{ width: 44 }} /> {/* Spacer */}
          </View>

          <TextInput
            style={styles.editor}
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="Escribe tus notas aquí..."
            placeholderTextColor="#888"
            autoFocus
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 20,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.four,
    borderBottomWidth: 1,
    backgroundColor: "rgba(30, 30, 30, 0.9)", // slightly translucent
  },
  backBtn: {
    padding: Spacing.one,
    width: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  editor: {
    flex: 1,
    padding: Spacing.five,
    fontSize: 18,
    color: "#FFF",
    lineHeight: 32,
    fontWeight: "400",
    backgroundColor: "#1E1E1E",
  },
});
