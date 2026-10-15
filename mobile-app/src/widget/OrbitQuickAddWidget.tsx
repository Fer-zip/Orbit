import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function OrbitQuickAddWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#208AEF',
        borderRadius: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget text="+" style={{ fontSize: 24, color: '#FFFFFF', marginRight: 8, fontWeight: 'bold' }} />
      <TextWidget text="Añadir Rápido" style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }} />
    </FlexWidget>
  );
}
