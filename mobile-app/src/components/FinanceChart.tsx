import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ThemedText } from './themed-text';
import { useAppStore } from '@/store';
import { Spacing } from '@/constants/theme';

const screenWidth = Dimensions.get("window").width;

export function FinanceChart() {
  const expenses = useAppStore(state => state.expenses);

  // Agrupar gastos por categoría
  const categories: Record<string, number> = {
    'Transporte': 0,
    'Entretenimiento': 0,
    'Comida': 0,
    'Servicios': 0,
    'Otros': 0
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  expenses.forEach(e => {
    if (e.amount > 0 && e.created_at >= startOfMonth) { // Solo gastos del mes actual
      if (e.description.includes('[🚕 Transporte]')) categories['Transporte'] += e.amount;
      else if (e.description.includes('[🎬 Entretenimiento]')) categories['Entretenimiento'] += e.amount;
      else if (e.description.includes('[🍔 Comida]')) categories['Comida'] += e.amount;
      else if (e.description.includes('[💡 Servicios]')) categories['Servicios'] += e.amount;
      else categories['Otros'] += e.amount;
    }
  });

  const chartData = [
    { name: 'Transporte', population: categories['Transporte'], color: '#FFC107', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Ocio', population: categories['Entretenimiento'], color: '#E91E63', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Comida', population: categories['Comida'], color: '#4CAF50', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Servicios', population: categories['Servicios'], color: '#2196F3', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Otros', population: categories['Otros'], color: '#9E9E9E', legendFontColor: '#FFF', legendFontSize: 12 },
  ].filter(item => item.population > 0);

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={{ color: '#888' }}>Aún no hay suficientes datos para el gráfico de gastos.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Gastos por Categoría</ThemedText>
      <PieChart
        data={chartData}
        width={screenWidth - Spacing.four * 2}
        height={200}
        chartConfig={{
          backgroundColor: '#1E1E1E',
          backgroundGradientFrom: '#1E1E1E',
          backgroundGradientTo: '#1E1E1E',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"0"}
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  emptyContainer: {
    marginVertical: Spacing.four,
    padding: Spacing.four,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
