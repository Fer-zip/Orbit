import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // kept for reference, but we won't use it
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore } from "@/store";
import { NoteList } from "@/models/NoteList";
import { ListOptionsModal } from "@/components/ListOptionsModal";
import { ListEditorModal } from "@/components/ListEditorModal";
import { Ionicons } from "@expo/vector-icons";

const DEFAULT_COLOR = "#4CAF50"; // Verde por defecto

export default function ListsScreen() {
  const { noteLists, loadNoteLists, addNoteList } = useAppStore();
  const accentColor = useAppStore((state) => state.accentColor);

  const [selectedListEditor, setSelectedListEditor] = useState<NoteList | null>(
    null,
  );
  const [selectedListOptions, setSelectedListOptions] =
    useState<NoteList | null>(null);
  const [actionMenuList, setActionMenuList] = useState<{
    list: NoteList;
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [deleteConfirmList, setDeleteConfirmList] = useState<NoteList | null>(
    null,
  );
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    loadNoteLists();
  }, []);

  const handleAddList = () => {
    setIsCreatingList(true);
  };

  const submitNewList = () => {
    const title = newListName.trim() || "Nueva Lista";
    addNoteList(title, accentColor); // Usamos el color de acento por defecto para que combine
    setNewListName("");
    setIsCreatingList(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.subHeader}>
            <ThemedText style={styles.subtitle}>
              {noteLists.length}{" "}
              {noteLists.length === 1 ? "lista activa" : "listas activas"}
            </ThemedText>
            <TouchableOpacity
              style={styles.addBtnRect}
              onPress={handleAddList}
              activeOpacity={0.7}
            >
              <ThemedText
                style={(styles.addBtnRectText, { color: accentColor })}
              >
                + Añadir
              </ThemedText>
            </TouchableOpacity>
          </View>
          {noteLists.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                Tu bloc de notas está vacío.
              </ThemedText>
              <ThemedText style={styles.emptySubText}>
                Toca el botón [+] arriba para crear tu primera lista rápida.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {noteLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listCard,
                    {
                      borderColor: `${list.color}50`, // Brillo del color de la lista
                      shadowColor: list.color,
                    },
                  ]}
                  onPress={() => setSelectedListEditor(list)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.cardHeader,
                      { backgroundColor: `${list.color}20` },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.optionsBtn]}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (
                          actionMenuList &&
                          actionMenuList.list.id === list.id
                        ) {
                          setActionMenuList(null);
                        } else {
                          const isLeftColumn = e.nativeEvent.pageX < 200; // rough estimate
                          setActionMenuList({
                            list,
                            top: e.nativeEvent.pageY,
                            ...(isLeftColumn
                              ? { left: e.nativeEvent.pageX - 20 }
                              : { right: 27 }),
                          });
                        }
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={list.color}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.listTitle} numberOfLines={2}>
                      {list.title}
                    </ThemedText>
                    <ThemedText style={styles.listDate}>
                      {new Date(list.updated_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Menu (Editar / Eliminar) */}
        <Modal
          visible={!!actionMenuList}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActionMenuList(null)}
        >
          <TouchableWithoutFeedback onPress={() => setActionMenuList(null)}>
            <View style={styles.actionMenuOverlayPopover}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.actionMenuContentPopover,
                    {
                      top: (actionMenuList?.top || 0) - 5,
                      left: actionMenuList?.left,
                      right: actionMenuList?.left
                        ? undefined
                        : actionMenuList?.right || 27,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.actionMenuItemPopover}
                    onPress={() => {
                      if (actionMenuList)
                        setSelectedListOptions(actionMenuList.list);
                      setActionMenuList(null);
                    }}
                  >
                    <ThemedText style={styles.actionMenuTextPopover}>
                      Editar
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionMenuItemPopover}
                    onPress={() => {
                      if (actionMenuList)
                        setDeleteConfirmList(actionMenuList.list);
                      setActionMenuList(null);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.actionMenuTextPopover,
                        { color: "#F44336" },
                      ]}
                    >
                      Eliminar Lista
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* New List Modal */}
        <Modal
          visible={isCreatingList}
          transparent
          animationType="fade"
          onRequestClose={() => setIsCreatingList(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                Crear Nueva Lista
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de la lista"
                placeholderTextColor="#888"
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
                onSubmitEditing={submitNewList}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    { backgroundColor: "rgba(255,255,255,0.1)" },
                  ]}
                  onPress={() => setIsCreatingList(false)}
                >
                  <ThemedText style={styles.modalBtnText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: accentColor }]}
                  onPress={submitNewList}
                >
                  <ThemedText
                    style={[
                      styles.modalBtnText,
                      { color: "#000", fontWeight: "bold" },
                    ]}
                  >
                    Crear
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={!!deleteConfirmList}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteConfirmList(null)}
        >
          <TouchableOpacity
            style={styles.actionMenuOverlay}
            activeOpacity={1}
            onPress={() => setDeleteConfirmList(null)}
          >
            <View style={styles.confirmModalContent}>
              <ThemedText style={styles.confirmTitle}>
                ¿Eliminar lista?
              </ThemedText>
              <ThemedText style={styles.confirmText}>
                Esta acción no se puede deshacer.
              </ThemedText>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => setDeleteConfirmList(null)}
                >
                  <ThemedText style={styles.confirmBtnText}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: "#F44336" }]}
                  onPress={async () => {
                    if (deleteConfirmList) {
                      await useAppStore
                        .getState()
                        .deleteNoteList(deleteConfirmList.id);
                    }
                    setDeleteConfirmList(null);
                  }}
                >
                  <ThemedText
                    style={[styles.confirmBtnText, { color: "#FFF" }]}
                  >
                    Eliminar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modales */}
        <ListOptionsModal
          visible={!!selectedListOptions}
          list={selectedListOptions}
          onClose={() => setSelectedListOptions(null)}
        />

        <ListEditorModal
          visible={!!selectedListEditor}
          list={selectedListEditor}
          onClose={() => setSelectedListEditor(null)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
  },
  addBtnRect: {
    backgroundColor: "rgba(145, 145, 145, 0.15)",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  addBtnRectText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    // paddingTop: Spacing.two,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: Spacing.six,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  emptySubText: {
    color: "#555",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  actionMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    height: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  actionMenuOverlayPopover: {
    flex: 1,
    backgroundColor: "transparent",
  },
  actionMenuContentPopover: {
    position: "absolute",
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    width: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionMenuItemPopover: {
    padding: Spacing.four,
    paddingVertical: Spacing.three,
  },
  actionMenuTextPopover: {
    fontSize: 16,
    color: "#FFF",
  },
  confirmModalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: Spacing.five,
    width: "80%",
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.two,
  },
  confirmText: {
    color: "#888",
    marginBottom: Spacing.five,
    textAlign: "center",
  },
  confirmActions: {
    flexDirection: "row",
    gap: Spacing.four,
    width: "100%",
  },
  confirmBtn: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#333",
  },
  confirmBtnText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  listCard: {
    width: "47%",
    height: 180,
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  cardHeader: {
    padding: Spacing.three,
    alignItems: "flex-end",
  },
  optionsBtn: {
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
  },
  cardInfo: {
    padding: Spacing.four,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: Spacing.one,
  },
  listDate: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.four,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    padding: Spacing.four,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: Spacing.five,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  modalBtn: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFF",
    fontSize: 16,
  },
});
