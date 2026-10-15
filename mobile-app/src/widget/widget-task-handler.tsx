import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrbitFocusWidget } from './OrbitFocusWidget';
import { OrbitCalendarWidget } from './OrbitCalendarWidget';
import { OrbitQuickAddWidget } from './OrbitQuickAddWidget';

import { useAppStore, DEFAULT_FOCUS_TEMPLATES } from '../store';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const WidgetInfo = props.WidgetInfo;

  const renderWidget = async () => {
    switch (widgetInfo.widgetName) {
      case 'OrbitFocusWidget':
        try {
          const focusStateData = await AsyncStorage.getItem('focusState');
          const focusState = focusStateData ? JSON.parse(focusStateData) : null;
          
          const templatesData = await AsyncStorage.getItem('focusTemplates');
          const templates = templatesData ? JSON.parse(templatesData) : DEFAULT_FOCUS_TEMPLATES;
          
          const selectedId = await AsyncStorage.getItem('widgetSelectedTemplateId') || templates[0]?.id;
          
          props.renderWidget(<OrbitFocusWidget focusState={focusState} templates={templates} selectedTemplateId={selectedId} />);
        } catch (e) {
          props.renderWidget(<OrbitFocusWidget templates={DEFAULT_FOCUS_TEMPLATES} selectedTemplateId="Estudio" />);
        }
        break;
      case 'OrbitCalendarWidget':
        try {
          const tasksData = await AsyncStorage.getItem('tasks');
          const tasks = tasksData ? JSON.parse(tasksData) : [];
          props.renderWidget(<OrbitCalendarWidget tasks={tasks} />);
        } catch (e) {
          props.renderWidget(<OrbitCalendarWidget tasks={[]} />);
        }
        break;
      case 'OrbitQuickAddWidget':
        props.renderWidget(<OrbitQuickAddWidget />);
        break;
      default:
        break;
    }
  };

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      await renderWidget();
      break;

    case 'WIDGET_CLICK':
      if (props.clickAction === 'START_FOCUS') {
        const selectedId = await AsyncStorage.getItem('widgetSelectedTemplateId') || 'Estudio';
        const templatesData = await AsyncStorage.getItem('focusTemplates');
        const templates = templatesData ? JSON.parse(templatesData) : DEFAULT_FOCUS_TEMPLATES;
        const template = templates.find((t: any) => t.id === selectedId) || templates[0];
        
        if (template) {
          const store = useAppStore.getState();
          await store.startFocusSession({
            template_id: template.id,
            total_duration_minutes: template.total,
            break_interval_minutes: template.breakInt,
            break_duration_minutes: template.breakDur,
          });
        }
        await renderWidget();
      } else if (props.clickAction === 'STOP_FOCUS') {
        const store = useAppStore.getState();
        await store.endFocusSession();
        await renderWidget();
      } else if (props.clickAction === 'SELECT_TEMPLATE' && props.clickActionData?.id) {
        await AsyncStorage.setItem('widgetSelectedTemplateId', props.clickActionData.id as string);
        await renderWidget();
      }
      break;

    default:
      break;
  }
}
