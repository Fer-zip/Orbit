import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

interface FinanceWidgetProps {
  balance: number;
  syncState: 'idle' | 'syncing' | 'error';
  onAddExpense: () => void;
}

export function FinanceWidget({ balance, syncState, onAddExpense }: FinanceWidgetProps) {
  const getSyncColor = () => {
    switch(syncState) {
      case 'idle': return '#4CAF50'; // Verde (OK)
      case 'syncing': return '#FFC107'; // Amarillo
      case 'error': return '#F44336'; // Rojo
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.balanceContainer}>
        <View style={styles.syncRow}>
          <ThemedText style={styles.label}>Saldo Actual</ThemedText>
          <View style={[styles.syncDot, { backgroundColor: getSyncColor() }]} />
        </View>
        <ThemedText style={styles.balanceText}>
          ${balance.toFixed(2)}
        </ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.addButton} onPress={onAddExpense}>
        <ThemedText style={styles.addButtonText}>- Gastar</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: Spacing.four,
  },
  balanceContainer: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  label: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  balanceText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
