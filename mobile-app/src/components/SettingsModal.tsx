import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/store';

export function SettingsModal() {
  const { isSettingsVisible, setSettingsVisible } = useAppStore();

  const onClose = () => setSettingsVisible(false);

  return (
    <Modal
      visible={isSettingsVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.title}>Configuración</ThemedText>
          
          <TouchableOpacity style={styles.optionBtn}>
            <ThemedText style={styles.optionText}>🎨 Tema / Colores (Próximamente)</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionBtn}>
            <ThemedText style={styles.optionText}>🔤 Cambiar Fuente (Próximamente)</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionBtn}>
            <ThemedText style={styles.optionText}>☁️ Forzar Sincronización</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <ThemedText style={styles.closeBtnText}>Cerrar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1E1E24',
    borderRadius: 24,
    padding: Spacing.six,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: Spacing.six,
    textAlign: 'center',
  },
  optionBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
  },
  closeBtn: {
    marginTop: Spacing.four,
    padding: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});
