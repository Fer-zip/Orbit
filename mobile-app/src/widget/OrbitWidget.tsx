import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function OrbitWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
      }}
    >
      <TextWidget
        text="Orbit"
        style={{
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#ffffff',
        }}
      />
      <TextWidget
        text="Añadir +"
        style={{
          fontSize: 14,
          color: '#4CAF50',
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
}
