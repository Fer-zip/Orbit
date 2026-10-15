import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function OrbitFocusWidget({ focusState, templates = [], selectedTemplateId }: { focusState?: any, templates?: any[], selectedTemplateId?: string }) {
  const isActive = focusState && focusState.isActive;
  
  // Calculate end time if active
  let endTimeStr = "";
  if (isActive && focusState.started_at && focusState.config) {
    const endMs = focusState.started_at + (focusState.config.total_duration_minutes * 60 * 1000);
    const endDate = new Date(endMs);
    endTimeStr = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333333',
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget text="Modo Enfoque" style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }} />
        <TextWidget text={isActive ? "🔥" : "🍅"} style={{ fontSize: 20 }} />
      </FlexWidget>

      <FlexWidget style={{ marginTop: 8 }}>
        {isActive ? (
          <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <FlexWidget>
              <TextWidget text="¡En progreso!" style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }} />
              <TextWidget text={`Termina a las ${endTimeStr}`} style={{ color: '#AAAAAA', fontSize: 12, marginTop: 2 }} />
            </FlexWidget>
            <FlexWidget 
              style={{ backgroundColor: '#F44336', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
              clickAction="STOP_FOCUS"
            >
              <TextWidget text="Detener" style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }} />
            </FlexWidget>
          </FlexWidget>
        ) : (
          <FlexWidget>
            {/* Opciones de plantilla */}
            <FlexWidget style={{ flexDirection: 'row', marginBottom: 12 }}>
              {templates.map((t, index) => {
                if (index > 2) return null; // Solo mostrar los primeros 3 para no saturar el widget
                const isSelected = t.id === activeTemplate?.id;
                return (
                  <FlexWidget 
                    key={t.id}
                    style={{ 
                      backgroundColor: isSelected ? '#4CAF50' : '#333333', 
                      paddingHorizontal: 12, 
                      paddingVertical: 6, 
                      borderRadius: 16,
                      marginRight: 8
                    }}
                    clickAction="SELECT_TEMPLATE"
                    clickActionData={{ id: t.id }}
                  >
                    <TextWidget text={`${t.total}m`} style={{ color: isSelected ? '#FFFFFF' : '#AAAAAA', fontSize: 13, fontWeight: 'bold' }} />
                  </FlexWidget>
                )
              })}
            </FlexWidget>
            
            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextWidget text={`Plantilla: ${activeTemplate?.label || 'Estudio'}`} style={{ color: '#888888', fontSize: 13 }} />
              <FlexWidget 
                style={{ backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
                clickAction="START_FOCUS"
              >
                <TextWidget text="Iniciar" style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }} />
              </FlexWidget>
            </FlexWidget>
          </FlexWidget>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
