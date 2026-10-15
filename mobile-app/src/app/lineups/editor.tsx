import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useLineupsStore, FORMATIONS } from "@/store/lineups";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore } from "@/store";
import { Player, Lineup } from "@/models/Lineup";

const { width } = Dimensions.get("window");
const PITCH_WIDTH = width - 40;
const PITCH_HEIGHT = PITCH_WIDTH * 1.5; // Aspect ratio of a football pitch

export default function LineupEditor() {
  const accentColor = useAppStore((state) => state.accentColor);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { lineups, saveLineup } = useLineupsStore();

  const [name, setName] = useState("Mi Alineación");
  const [formationId, setFormationId] = useState(FORMATIONS[0].id);
  const [players, setPlayers] = useState<Player[]>([]);

  // For modal to edit player name
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (id) {
      const existing = lineups.find((l) => l.id === id);
      if (existing) {
        setName(existing.name);
        setFormationId(existing.formationId);
        setPlayers(existing.players);
      }
    } else {
      // Load default formation
      applyFormation(FORMATIONS[0].id);
    }
  }, [id]);

  const applyFormation = (fId: string) => {
    const formation = FORMATIONS.find((f) => f.id === fId);
    if (!formation) return;

    // Map current names to new positions if possible, or reset
    // For simplicity, we just keep names by index if they exist, or clear them
    const newPlayers = formation.players.map((p, index) => ({
      ...p,
      name: players[index]?.name || "",
    }));

    setFormationId(fId);
    setPlayers(newPlayers);
  };

  const handleClear = () => {
    Alert.alert("Limpiar Nombres", "¿Borrar todos los nombres?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        onPress: () => {
          setPlayers(players.map((p) => ({ ...p, name: "" })));
        },
        style: "destructive",
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Debes darle un nombre a tu equipo.");
      return;
    }

    await saveLineup({
      id,
      name,
      formationId,
      players,
    });

    router.back();
  };

  const openPlayerEditor = (player: Player) => {
    setEditingPlayer(player);
    setTempName(player.name);
  };

  const savePlayerName = () => {
    if (editingPlayer) {
      setPlayers(
        players.map((p) =>
          p.id === editingPlayer.id ? { ...p, name: tempName.trim() } : p,
        ),
      );
      setEditingPlayer(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Bar: Name and Formation */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del Equipo"
          placeholderTextColor="#888"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.formationSelector}
        >
          {FORMATIONS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.formationChip,
                formationId === f.id && {
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                },
              ]}
              onPress={() => applyFormation(f.id)}
            >
              <ThemedText
                style={[
                  styles.formationText,
                  formationId === f.id && styles.formationTextActive,
                ]}
              >
                {f.id}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* The Pitch */}
      <View style={styles.pitchContainer}>
        <View
          style={[styles.pitch, { width: PITCH_WIDTH, height: PITCH_HEIGHT }]}
        >
          {/* Field Lines (Simple css drawing) */}
          <View style={styles.centerLine} />
          <View style={styles.centerCircle} />
          <View style={styles.penaltyAreaTop} />
          <View style={styles.penaltyAreaBottom} />

          {/* Players */}
          {players.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.playerTokenContainer,
                { top: `${p.top}%`, left: `${p.left}%` },
              ]}
              onPress={() => openPlayerEditor(p)}
            >
              <View style={styles.playerToken}>
                <ThemedText style={styles.playerPosition}>
                  {p.position}
                </ThemedText>
              </View>
              {p.name ? (
                <View style={styles.playerNameTag}>
                  <ThemedText style={styles.playerName} numberOfLines={1}>
                    {p.name}
                  </ThemedText>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
          <ThemedText style={styles.clearText}>Limpiar</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            ...styles.saveBtn,
            backgroundColor: accentColor,
          }}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={24} color="#FFF" />
          <ThemedText style={styles.saveBtnText}>Guardar</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Player Editor Modal */}
      <Modal visible={!!editingPlayer} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Editar {editingPlayer?.position}
            </ThemedText>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Nombre del Jugador"
              placeholderTextColor="#666"
              autoFocus
              onSubmitEditing={savePlayerName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setEditingPlayer(null)}
                style={{ padding: 12 }}
              >
                <ThemedText style={{ color: "#888" }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={savePlayerName}
                style={styles.modalSaveBtn}
              >
                <ThemedText style={{ color: "#FFF", fontWeight: "bold" }}>
                  OK
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  topBar: { padding: 16, backgroundColor: "#111" },
  nameInput: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  formationSelector: { flexDirection: "row" },
  formationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#222",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  formationChipActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  formationText: { color: "#AAA", fontWeight: "bold" },
  formationTextActive: { color: "#FFF" },

  pitchContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E",
  },
  pitch: {
    backgroundColor: "#2E7D32",
    borderWidth: 2,
    borderColor: "#FFF",
    position: "relative",
    overflow: "hidden",
  },

  // Field markings
  centerLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FFF",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFF",
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  penaltyAreaTop: {
    position: "absolute",
    top: 0,
    left: "25%",
    right: "25%",
    height: "15%",
    borderWidth: 2,
    borderColor: "#FFF",
    borderTopWidth: 0,
  },
  penaltyAreaBottom: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: "15%",
    borderWidth: 2,
    borderColor: "#FFF",
    borderBottomWidth: 0,
  },

  // Players
  playerTokenContainer: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }], // Center it based on top/left
    width: 40,
    zIndex: 10,
  },
  playerToken: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFA500",
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  playerPosition: { fontSize: 10, fontWeight: "bold", color: "#000" },
  playerNameTag: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    width: 50,
    maxWidth: 200,
  },
  playerName: { color: "#FFF", fontSize: 10, textAlign: "center" },

  // Actions
  actionsBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#111",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  clearText: { color: "#F44336", fontWeight: "bold" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  saveBtnText: { color: "#FFF", fontWeight: "bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#111",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  modalSaveBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
