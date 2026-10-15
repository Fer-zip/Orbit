import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widget/widget-task-handler';

// Register the widget task handler
registerWidgetTaskHandler(widgetTaskHandler);

export function App() {
  // eslint-disable-next-line no-undef
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
