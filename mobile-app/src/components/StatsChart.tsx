import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from './themed-text';
import { useAppStore } from '@/store';
import { Spacing } from '@/constants/theme';

const screenWidth = Dimensions.get("window").width;

export function StatsChart() {
  const timeSessions = useAppStore(state => state.timeSessions);
  const accentColor = useAppStore(state => state.accentColor);

  // Generar datos de los últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = last7Days.map(date => {
    const dayStart = new Date(date).setHours(0,0,0,0);
    const dayEnd = new Date(date).setHours(23,59,59,999);
    
    const minutes = timeSessions
      .filter(s => s.created_at >= dayStart && s.created_at <= dayEnd)
      .reduce((acc, curr) => acc + curr.duration_minutes, 0);
      
    return minutes;
  });

  // Nombres cortos de los días en español (lun, mar, mié, etc)
  const labels = last7Days.map(date => 
    date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3)
  );

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Enfoque (Últimos 7 días)</ThemedText>
      <LineChart
        data={{
          labels,
          datasets: [{ data: data.some(d => d > 0) ? data : [0,0,0,0,0,0,0] }]
        }}
        width={screenWidth - Spacing.four * 2}
        height={220}
        yAxisSuffix="m"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#1a1a1a',
          backgroundGradientFrom: '#1a1a1a',
          backgroundGradientTo: '#1a1a1a',
          decimalPlaces: 0,
          color: (opacity = 1) => {
            // Conversor simple de HEX a RGBA para el gráfico
            let hex = accentColor.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const r = parseInt(hex.substring(0, 2), 16) || 156;
            const g = parseInt(hex.substring(2, 4), 16) || 39;
            const b = parseInt(hex.substring(4, 6), 16) || 176;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          },
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "4", strokeWidth: "2", stroke: accentColor }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.four,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  }
});
