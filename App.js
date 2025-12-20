import React, { useState } from "react";
import {
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

export default function App() {
  // Стан для відстеження завантаження сайту
  const [isLoading, setIsLoading] = useState(true);

  // Отримання поточної колірної схеми (світла/темна)
  const colorScheme = useColorScheme();

  // Визначення кольору фону залежно від теми
  const backgroundColor = colorScheme === "dark" ? "#000000" : "#ffffff";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Статус-бар з автоматичним стилем */}
      <StatusBar style="auto" />

      {/* Індикатор завантаження, показується поки сайт завантажується */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#ffffff" : "#000000"}
          />
        </View>
      )}

      {/* WebView для відображення сайту */}
      <WebView
        source={{ uri: "https://dmitryberesten.github.io/SoulTalk" }}
        style={styles.webview}
        // Дозволяє навігацію назад/вперед жестами на iOS
        allowsBackForwardNavigationGestures={true}
        // Вимикає горизонтальний свайп (bounce effect)
        overScrollMode="never"
        // Обробники для індикатора завантаження
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </SafeAreaView>
  );
}

// Стилі для компонентів
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Щоб індикатор був поверх WebView
  },
  webview: {
    flex: 1,
  },
});
