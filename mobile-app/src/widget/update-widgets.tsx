import { requestWidgetUpdate } from 'react-native-android-widget';
import { OrbitFocusWidget } from './OrbitFocusWidget';
import { OrbitCalendarWidget } from './OrbitCalendarWidget';
import { OrbitQuickAddWidget } from './OrbitQuickAddWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function updateAllWidgets() {
  try {
    // Focus Widget
    const focusStateData = await AsyncStorage.getItem('focusState');
    const focusState = focusStateData ? JSON.parse(focusStateData) : null;
    await requestWidgetUpdate({
      widgetName: 'OrbitFocusWidget',
      renderWidget: () => <OrbitFocusWidget focusState={focusState} />
    });

    // Calendar Widget
    const tasksData = await AsyncStorage.getItem('tasks');
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    await requestWidgetUpdate({
      widgetName: 'OrbitCalendarWidget',
      renderWidget: () => <OrbitCalendarWidget tasks={tasks} />
    });

    // Quick Add
    await requestWidgetUpdate({
      widgetName: 'OrbitQuickAddWidget',
      renderWidget: () => <OrbitQuickAddWidget />
    });
  } catch (error) {
    console.log('Error updating widgets', error);
  }
}
