import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store';

export function QuickCaptureModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const { addTask, addExpense } = useAppStore();

  const handleSave = async () => {
    if (!text.trim()) return;
    const lower = text.toLowerCase();
    // Autodetección simple de gasto vs tarea
    if (lower.startsWith('gasto') || lower.startsWith('ingreso') || lower.startsWith('compré') || lower.startsWith('pagué')) {
      // Extraer primer número
      const match = text.match(/\d+(\.\d+)?/);
      const amount = match ? parseFloat(match[0]) : 0;
      await addExpense(lower.includes('ingreso') ? -amount : amount, text);
    } else {
      await addTask(text, 'TODO');
    }
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.title}>Captura Rápida</ThemedText>
          <TextInput
            style={styles.input}
            placeholder='Ej: "Lavar coche mañana" o "Gasto $15 netflix"'
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            autoFocus
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <ThemedText style={styles.saveText}>Guardar</ThemedText>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: Spacing.four,
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: Spacing.four,
    borderRadius: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.six,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.four,
  },
  cancelBtn: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  cancelText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
  },
  saveText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  }
});
