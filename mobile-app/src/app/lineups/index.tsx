import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useLineupsStore } from "@/store/lineups";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LineupsDashboard() {
  const router = useRouter();
  const { lineups, loadLineups, deleteLineup } = useLineupsStore();

  useEffect(() => {
    loadLineups();
  }, []);

  const handleCreate = () => {
    router.push("/lineups/editor");
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Alineación",
      "¿Estás seguro de que deseas eliminar esta alineación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: () => deleteLineup(id),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Mis Equipos</ThemedText>
          <TouchableOpacity onPress={handleCreate} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {lineups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="football-outline" size={64} color="#555" />
            <ThemedText style={styles.emptyText}>
              No tienes alineaciones todavía.
            </ThemedText>
            <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
              <ThemedText style={styles.createBtnText}>
                Crear mi primer 11
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          lineups.map((lineup) => (
            <TouchableOpacity 
              key={lineup.id} 
              style={styles.card}
              onPress={() => router.push(`/lineups/editor?id=${lineup.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                  <ThemedText style={styles.cardName}>{lineup.name}</ThemedText>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleDelete(lineup.id)}
                    style={styles.iconBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText style={styles.formationText}>
                Formación: {lineup.formationId}
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  addBtn: { backgroundColor: "#333", padding: 8, borderRadius: 20 },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 16,
  },
  emptyText: { color: "#888", fontSize: 16 },
  createBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  card: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  actions: { flexDirection: "row", gap: 12 },
  iconBtn: { padding: 4 },
  formationText: { color: "#888", fontSize: 14 },
});
