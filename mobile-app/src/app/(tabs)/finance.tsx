import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore } from "@/store";
import { TransactionModal } from "@/components/TransactionModal";
import { FixedExpenseModal } from "@/components/FixedExpenseModal";
import { FinanceChart } from "@/components/FinanceChart";

export default function FinanceScreen() {
  const {
    expenses,
    fixedExpenses,
    balance,
    budget,
    setBudget,
    addExpense,
    deleteFixedExpense,
    loadFixedExpenses,
    loadExpenses,
  } = useAppStore();
  const accentColor = useAppStore((state) => state.accentColor);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(
    budget ? budget.monthly_limit.toString() : "",
  );
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [fixedModalVisible, setFixedModalVisible] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadFixedExpenses();
  }, []);

  const [showHistory, setShowHistory] = useState(false);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const thisMonthExpenses = expenses.filter(
    (e) => e.created_at >= startOfMonth,
  );
  const pastExpenses = expenses
    .filter((e) => e.created_at < startOfMonth)
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 30);

  const displayedExpenses = showHistory ? pastExpenses : thisMonthExpenses;

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val)) {
      await setBudget(val);
      setIsEditingBudget(false);
    }
  };

  const handleSaveTransaction = async (
    amount: number,
    desc: string,
    type: "ingreso" | "gasto",
  ) => {
    const finalAmount = type === "gasto" ? amount : -amount;
    const finalDesc = `[${type === "gasto" ? "💸" : "💰"}] ${desc}`;
    await addExpense(finalAmount, finalDesc);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <ThemedText style={styles.balanceLabel}>SALDO DISPONIBLE</ThemedText>
          <ThemedText
            style={styles.balanceValue}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            S/. {balance.toFixed(2)}
          </ThemedText>

          {isEditingBudget ? (
            <View style={styles.budgetEditRow}>
              <TextInput
                style={styles.budgetInput}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="Presupuesto"
                placeholderTextColor="#888"
                autoFocus
              />
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={handleSaveBudget}
              >
                <ThemedText style={styles.budgetButtonText}>OK</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingBudget(true)}
              style={styles.budgetDisplay}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.budgetLabel}>
                Presupuesto Mensual: S/. {budget ? budget.monthly_limit : "0"}
              </ThemedText>
              <ThemedText style={styles.budgetEditIcon}>✎</ThemedText>
            </TouchableOpacity>
          )}

          {/* Action Buttons inside Card */}
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: accentColor }]}
              onPress={() => setTxModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconWrapper}>
                <ThemedText style={styles.actionIcon}>+</ThemedText>
              </View>
              <ThemedText style={styles.actionText}>
                Añadir Movimiento
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FinanceChart />

          {/* Gastos Fijos Section */}
          <View style={styles.sectionHeader}>
            <ThemedText style={(styles.sectionTitle, { padding: 0 })}>
              Gastos Fijos
            </ThemedText>
            <TouchableOpacity onPress={() => setFixedModalVisible(true)}>
              <ThemedText style={(styles.addFixedText, { color: accentColor })}>
                + Añadir
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fixedScroll}
          >
            {fixedExpenses.length === 0 ? (
              <ThemedText style={styles.emptyFixed}>
                No tienes gastos fijos registrados.
              </ThemedText>
            ) : (
              fixedExpenses.map((f) => (
                <View key={f.id} style={styles.fixedCard}>
                  <TouchableOpacity
                    style={styles.deleteFixedBtn}
                    onPress={() => deleteFixedExpense(f.id)}
                  >
                    <ThemedText style={styles.deleteFixedText}>✕</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.fixedIcon}>
                    {f.icon || "📌"}{" "}
                    {/*CONTEMPLAR LA ELIMINACION DE ESTE ICONO*/}
                  </ThemedText>
                  <ThemedText style={styles.fixedName} numberOfLines={1}>
                    {f.name}
                  </ThemedText>
                  <ThemedText style={styles.fixedAmount}>
                    S/. {f.amount.toFixed(2)}
                  </ThemedText>
                </View>
              ))
            )}
            <View style={{ width: 20 }} />
          </ScrollView>

          {/* Últimos Movimientos */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
            <ThemedText style={[styles.sectionTitle, { padding: 0 }]}>
              {showHistory ? "Historial (Anteriores)" : "Movimientos del Mes"}
            </ThemedText>
            <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
              <ThemedText style={[styles.addFixedText, { color: accentColor }]}>
                {showHistory ? "Ver Mes Actual" : "Ver Historial"}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.historyList}>
            {displayedExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  Sin movimientos recientes.
                </ThemedText>
              </View>
            ) : (
              [...displayedExpenses].reverse().map((exp) => {
                const isIncome = exp.amount < 0;
                const displayAmount = isIncome
                  ? `+S/. ${Math.abs(exp.amount).toFixed(2)}`
                  : `-S/. ${exp.amount.toFixed(2)}`;

                const match = exp.description.match(/\[(.*?)\] (.*)/);
                const emoji = match
                  ? match[1].split(" ")[0]
                  : isIncome
                    ? "💰"
                    : "💸";
                const cleanDesc = match ? match[2] : exp.description;

                const date = new Date(exp.created_at);
                const timeString = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <View key={exp.id} style={styles.expenseItem}>
                    <View style={styles.expenseIconWrapper}>
                      <ThemedText style={styles.expenseIcon}>
                        {emoji}
                      </ThemedText>
                    </View>
                    <View style={styles.expenseInfo}>
                      <ThemedText style={styles.expenseDesc} numberOfLines={1}>
                        {cleanDesc}
                      </ThemedText>
                      <ThemedText style={styles.expenseDate}>
                        {date.toLocaleDateString()} • {timeString}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.expenseAmount,
                        isIncome && { color: "#4CAF50" },
                      ]}
                    >
                      {displayAmount}
                    </ThemedText>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Modales */}
        <TransactionModal
          visible={txModalVisible}
          onClose={() => setTxModalVisible(false)}
          onSave={handleSaveTransaction}
        />
        <FixedExpenseModal
          visible={fixedModalVisible}
          onClose={() => setFixedModalVisible(false)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingTop: Spacing.two },

  heroCard: {
    // backgroundColor: "#2A2A35",
    marginHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: Spacing.two,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginVertical: Spacing.three,
    letterSpacing: -2,
  },

  budgetDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    marginBottom: Spacing.one,
  },
  budgetLabel: { fontSize: 14, color: "#888", fontWeight: "600" },
  budgetEditIcon: { fontSize: 14, color: "#888", marginLeft: Spacing.two },

  budgetEditRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  budgetInput: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    width: 120,
    textAlign: "center",
    fontSize: 16,
  },
  budgetButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    justifyContent: "center",
  },
  budgetButtonText: { color: "#000", fontWeight: "bold" },

  heroActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#4E5AFE", // Accent moderno
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: 30,
    gap: Spacing.three,
  },
  actionIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  actionText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  scrollContent: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    marginTop: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    // paddingHorizontal: Spacing.four,
  },
  addFixedText: { color: "#4E5AFE", fontWeight: "bold", fontSize: 14 },

  fixedScroll: {
    paddingLeft: Spacing.four,
  },
  emptyFixed: {
    color: "#888",
    fontSize: 14,
    fontStyle: "italic",
  },
  fixedCard: {
    backgroundColor: "#1E1E24",
    padding: Spacing.four,
    borderRadius: 20,
    marginRight: Spacing.three,
    width: 130,
    position: "relative",
  },
  deleteFixedBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  deleteFixedText: { color: "#888", fontSize: 10, fontWeight: "bold" },
  fixedIcon: { fontSize: 20, marginBottom: Spacing.one },
  fixedName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  fixedAmount: { color: "#F44336", fontSize: 16, fontWeight: "bold" },

  historyList: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    marginVertical: Spacing.three,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
  },
  emptyText: { color: "#888", fontSize: 16 },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.three,
    marginBottom: Spacing.three,
    backgroundColor: "#1E1E24",
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
  },
  expenseIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.three,
  },
  expenseIcon: { fontSize: 12 },
  expenseInfo: { flex: 1 },
  expenseDesc: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  expenseDate: { fontSize: 12, color: "#888" },
  expenseAmount: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "bold",
    marginLeft: Spacing.two,
  },
});
