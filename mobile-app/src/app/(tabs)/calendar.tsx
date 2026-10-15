import React, { useState, useMemo } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarProvider,
  ExpandableCalendar,
  LocaleConfig,
} from "react-native-calendars";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, Colors } from "@/constants/theme";
import { useAppStore } from "@/store";
import { TaskEditModal } from "@/components/TaskEditModal";
import { EventModal } from "@/components/EventModal";
import { Task } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";

// Configurar calendario en español
LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul.",
    "Ago",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

function matchesDate(task: Task, targetDateStr: string) {
  if (!task.due_date) return false;

  const targetParts = targetDateStr.split("-");
  const targetDate = new Date(
    Number(targetParts[0]),
    Number(targetParts[1]) - 1,
    Number(targetParts[2]),
  );
  const startDate = new Date(task.due_date);

  targetDate.setHours(0, 0, 0, 0);
  const startNormalized = new Date(startDate);
  startNormalized.setHours(0, 0, 0, 0);

  if (targetDate.getTime() < startNormalized.getTime()) return false;

  if (!task.recurrence_rule || task.recurrence_rule === "NONE") {
    return targetDate.getTime() === startNormalized.getTime();
  }

  if (task.recurrence_rule === "DAILY") return true;
  if (task.recurrence_rule === "WEEKLY") {
    return targetDate.getDay() === startNormalized.getDay();
  }
  if (task.recurrence_rule === "MONTHLY") {
    return targetDate.getDate() === startNormalized.getDate();
  }
  if (task.recurrence_rule.startsWith("CUSTOM:")) {
    const daysStr = task.recurrence_rule.replace("CUSTOM:", "");
    const validDays = daysStr.split(",").map(Number);
    return validDays.includes(targetDate.getDay());
  }

  return false;
}

export default function CalendarScreen() {
  const tasks = useAppStore((state) => state.tasks);
  const completeCurrentTask = useAppStore((state) => state.completeCurrentTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const accentColor = useAppStore((state) => state.accentColor);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  const tasksWithDates = useMemo(
    () => tasks.filter((t) => t.due_date && t.status === "PENDING"),
    [tasks]
  );

  // Calcular puntos para una ventana de tiempo (-30 a +60 días) memoizado
  const markedDates = useMemo(() => {
    const marks: any = {
      [selectedDate]: { selected: true, selectedColor: accentColor },
    };

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);
    for (let i = 0; i < 90; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      const hasTasks = tasksWithDates.some((t) => matchesDate(t, dateStr));
      if (hasTasks) {
        if (dateStr === selectedDate) {
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dotColor: "#000",
          };
        } else {
          marks[dateStr] = { marked: true, dotColor: accentColor };
        }
      }
    }
    return marks;
  }, [tasksWithDates, selectedDate, accentColor]);

  // Tareas para el día seleccionado memoizadas
  const selectedTasks = useMemo(() => {
    return tasksWithDates
      .filter((t) => matchesDate(t, selectedDate))
      .sort((a, b) => {
        const timeA =
          a.has_time && a.due_date
            ? new Date(a.due_date).getHours() * 60 +
              new Date(a.due_date).getMinutes()
            : -1;
        const timeB =
          b.has_time && b.due_date
            ? new Date(b.due_date).getHours() * 60 +
              new Date(b.due_date).getMinutes()
            : -1;
        return timeA - timeB;
      });
  }, [tasksWithDates, selectedDate]);

  const completeTask = async (id: string) => {
    useAppStore.setState({
      currentTask: tasks.find((t) => t.id === id) || null,
    });
    await completeCurrentTask();
  };

  return (
    <ThemedView style={[styles.container]}>
      <View style={styles.safeArea}>
        <CalendarProvider
          date={selectedDate}
          onDateChanged={(date: string) => setSelectedDate(date)}
          showTodayButton={false}
        >
          <View style={styles.calendarCard}>
            <ExpandableCalendar
              firstDay={1}
              markedDates={markedDates}
              theme={{
                backgroundColor: "#121212",
                calendarBackground: "#000",
                textSectionTitleColor: "#888",
                selectedDayBackgroundColor: accentColor,
                selectedDayTextColor: "#FFF",
                todayTextColor: accentColor,
                dayTextColor: "#FFF",
                textDisabledColor: "#444",
                dotColor: accentColor,
                selectedDotColor: "#FFF",
                monthTextColor: "#FFF",
                arrowColor: accentColor,
                "stylesheet.expandable.main": {
                  containerWrapper: {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                },
              }}
              allowShadow={false}
            />
          </View>

          <View style={styles.subHeader}>
            <ThemedText style={styles.sectionTitle}>
              Pendientes de este día
            </ThemedText>
            <TouchableOpacity
              style={styles.addBtnRect}
              onPress={() => setEventModalVisible(true)}
            >
              <ThemedText
                style={(styles.addBtnRectText, { color: accentColor })}
              >
                + Añadir
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedTasks.length === 0 ? (
              <ThemedText
                style={{ color: "#888", textAlign: "center", marginTop: 20 }}
              >
                Día libre 🍻
              </ThemedText>
            ) : (
              selectedTasks.map((task) => {
                const isEvent = task.type === "EVENT";

                return (
                  <View
                    key={task.id}
                    style={[
                      styles.taskCard,
                      {
                        borderColor: `${accentColor}65`,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <View style={styles.timeColumn}>
                      {isEvent && task.due_date ? (
                        <>
                          <ThemedText style={styles.timeText}>
                            {new Date(task.due_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </ThemedText>
                        </>
                      ) : (
                        <ThemedText style={styles.timeText}>Tarea</ThemedText>
                      )}
                    </View>
                    <View
                      style={[
                        styles.cardDivider,
                        { backgroundColor: accentColor },
                      ]}
                    />
                    <View style={styles.taskInfo}>
                      <ThemedText style={styles.taskCardTitle}>
                        {task.title}
                      </ThemedText>
                      {task.recurrence_rule && (
                        <ThemedText style={styles.recurrenceBadge}>
                          🔄 {task.recurrence_rule}
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      {isEvent ? (
                        <TouchableOpacity
                          style={[
                            styles.iconBtn,
                            { backgroundColor: "rgba(255,255,255,0.1)" },
                          ]}
                          onPress={() => setSelectedTask(task)}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={20}
                            color="#FFF"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => completeTask(task.id)}
                        >
                          <Ionicons
                            name="checkmark-outline"
                            size={22}
                            color={accentColor}
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#F44336"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </CalendarProvider>

        <EventModal
          visible={eventModalVisible}
          onClose={() => setEventModalVisible(false)}
        />

        <TaskEditModal
          visible={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingTop: Spacing.two,
  },
  calendarCard: {
    overflow: "hidden",
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  addBtnRect: {
    // backgroundColor: "rgba(145, 145, 145, 0.15)",
    paddingLeft: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    // borderWidth: 1,
    // borderColor: "rgba(255,255,255,0.2)",
  },
  addBtnRectText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    paddingBottom: 70,
  },
  taskCard: {
    backgroundColor: "rgba(30,30,30,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: Spacing.four,
    minHeight: 80,
  },
  timeColumn: {
    width: 80,
    alignItems: "flex-start",
  },
  timeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardDivider: {
    width: 2,
    height: "80%",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: Spacing.three,
  },
  taskInfo: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  recurrenceBadge: {
    fontSize: 10,
    color: "#AAA",
    marginTop: Spacing.one,
    textTransform: "uppercase",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
});
