import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SampleCardProps {
  title: string;
}

export const SampleCard = ({ title }: SampleCardProps) => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardCount}>Count: {count}</Text>
      <Pressable style={styles.button} onPress={() => setCount((c) => c + 1)}>
        <Text style={styles.buttonText}>Increment</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#61dafb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
});
