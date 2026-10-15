import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export function OrbitCalendarWidget({ tasks = [] }: { tasks?: any[] }) {
  const todos = tasks
    .filter(
      (t) =>
        t.status !== "COMPLETED" && t.type !== "EVENT" && t.type !== "HABIT",
    )
    .slice(0, 3);

  const events = tasks
    .filter((t) => t.status !== "COMPLETED" && t.type === "EVENT")
    .sort((a, b) => a.due_date - b.due_date)
    .slice(0, 3);

  // Formatear la fecha actual
  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#181818",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#333333",
      }}
      clickAction="OPEN_APP"
    >
      {/* HEADER */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        <TextWidget
          text="Agenda de Hoy"
          style={{ fontSize: 24, color: "#4CAF50", fontWeight: "bold" }}
        />
        <TextWidget
          text={formattedDate}
          style={{ fontSize: 14, color: "#AAAAAA" }}
        />
      </FlexWidget>

      {/* COLUMNAS */}
      <FlexWidget style={{ flexDirection: "row", flex: 1 }}>
        {/* COLUMNA IZQUIERDA: PENDIENTES */}
        <FlexWidget style={{ flex: 1, marginRight: 8 }}>
          <FlexWidget
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: "#333333",
              paddingBottom: 6,
              marginBottom: 8,
            }}
          >
            <TextWidget
              text="PENDIENTES"
              style={{ color: "#4CAF50", fontSize: 13, fontWeight: "bold" }}
            />
            <TextWidget text="✅" style={{ fontSize: 12 }} />
          </FlexWidget>

          {todos.length === 0 ? (
            <TextWidget
              text="Todo listo 🎉"
              style={{ color: "#888", fontSize: 13, marginTop: 4 }}
            />
          ) : (
            todos.map((t) => (
              <FlexWidget
                key={t.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <TextWidget
                  text="⬜"
                  style={{ color: "#888", fontSize: 14, marginRight: 8 }}
                />
                <TextWidget
                  text={t.title}
                  style={{ color: "#FFFFFF", fontSize: 14, flex: 1 }}
                  maxLines={1}
                  truncate="END"
                />
              </FlexWidget>
            ))
          )}
        </FlexWidget>

        {/* COLUMNA DERECHA: HORARIO */}
        <FlexWidget style={{ flex: 1, marginLeft: 8 }}>
          <FlexWidget
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderColor: "#333333",
              paddingBottom: 6,
              marginBottom: 8,
            }}
          >
            <TextWidget
              text="HORARIO"
              style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}
            />
            <TextWidget text="📅" style={{ fontSize: 12 }} />
          </FlexWidget>

          <FlexWidget
            style={{
              borderLeftWidth: 2,
              borderColor: "#333333",
              paddingLeft: 8,
              flex: 1,
            }}
          >
            {events.length === 0 ? (
              <TextWidget
                text="Sin eventos"
                style={{ color: "#888", fontSize: 13, marginTop: 4 }}
              />
            ) : (
              events.map((e) => {
                const date = new Date(e.due_date);
                const timeStr = date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <FlexWidget key={e.id} style={{ marginBottom: 10 }}>
                    <TextWidget
                      text={`${timeStr} - ${e.title}`}
                      style={{ color: "#DDDDDD", fontSize: 13 }}
                      maxLines={2}
                      truncate="END"
                    />
                  </FlexWidget>
                );
              })
            )}
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
