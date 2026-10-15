import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessModal({ visible, onClose, title, message }: SuccessModalProps) {
  const accentColor = useAppStore((state) => state.accentColor);
  
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0.8);
      opacityValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
              borderColor: accentColor,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: accentColor + "20" }]}>
            <Ionicons name="trophy" size={48} color={accentColor} />
          </View>
          
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={onClose}
          >
            <ThemedText style={styles.buttonText}>¡Entendido!</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  modalContainer: {
    backgroundColor: "#1E1E24",
    borderRadius: 24,
    padding: Spacing.six,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: Spacing.two,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
    marginBottom: Spacing.six,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
