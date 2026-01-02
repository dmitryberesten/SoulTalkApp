import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";
import * as Contacts from "expo-contacts";
import * as Calendar from "expo-calendar";
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";
import * as Sharing from "expo-sharing";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    const requestPermissionsAndSetup = async () => {
      // Request notification permissions and schedule daily notification
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();
      if (notificationStatus === "granted") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "SoulTalk",
            body: "Час для SoulTalk! Задайте сьогоднішнє питання своїй парі",
          },
          trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
          },
        });
      } else {
        Alert.alert("Дозволи", "Дозволи на сповіщення не надані.");
      }
    };

    requestPermissionsAndSetup();

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadApp = async () => {
      // Play heartbeat sound
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/heartbeat.mp3")
      );
      await sound.playAsync();

      // Start Lottie animation
      lottieRef.current?.play();

      // Haptic feedback at animation peak (assuming 2s animation)
      // setTimeout(() => {
      //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // }, 2000);

      // Fade in WebView after animation
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setIsLoading(false);
        });
      }, 2500);
    };

    loadApp();
  }, [fadeAnim]);

  const openContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      setContacts(data);
      setShowContacts(true);
    } else {
      Alert.alert("Дозволи", "Дозволи на контакти не надані.");
    }
  };

  const addCalendarEvent = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === "granted") {
      setShowDatePicker(true);
    } else {
      Alert.alert("Дозволи", "Дозволи на календар не надані.");
    }
  };

  const createEvent = async (date) => {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const defaultCalendar = calendars.find((cal) => cal.allowsModifications);
    if (defaultCalendar) {
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: "Час для розмови в SoulTalk",
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour later
        timeZone: "Europe/Kiev",
      });
      Alert.alert("Календар", "Подія додана до календаря!");
    } else {
      Alert.alert("Помилка", "Не знайдено календаря для модифікації.");
    }
  };

  const onDateConfirm = (date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    createEvent(date);
  };

  const onDateCancel = () => {
    setShowDatePicker(false);
  };

  const inviteContact = async (contact) => {
    const phoneNumber =
      contact.phoneNumbers && contact.phoneNumbers[0]
        ? contact.phoneNumbers[0].number
        : null;
    if (phoneNumber) {
      const message = `Привіт! Спробуй додаток SoulTalk для глибших розмов: https://apps.apple.com/app/soultalk/idYOUR_APP_ID`;
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
    } else {
      Alert.alert("Помилка", "Номер телефону не знайдено.");
    }
  };

  if (!isOnline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Офлайн-режим</Text>
          <Text style={styles.offlineSubtext}>
            Перевірте інтернет-з'єднання та спробуйте знову.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={lottieRef}
            source={require("./assets/heart.json")}
            style={styles.lottie}
            loop={false}
          />
        </View>
      )}

      <Animated.View style={[styles.webviewContainer, { opacity: fadeAnim }]}>
        <WebView
          source={{ uri: "https://dmitryberesten.github.io/SoulTalk" }}
          style={styles.webview}
          allowsBackForwardNavigationGestures={true}
          overScrollMode="never"
          onLoadEnd={() => setShowConfetti(true)}
        />

        {/* Overlay with native buttons */}
        <View style={styles.overlay}>
          <TouchableOpacity onPress={openContacts} style={styles.button}>
            <Text style={styles.buttonText}>Запросити пару</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addCalendarEvent} style={styles.button}>
            <Text style={styles.buttonText}>Запланувати час для розмови</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* {showConfetti && (
        <ConfettiCannon
          count={500}
          origin={{ x: width / 2, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )} */}

      {/* {showDatePicker && (
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="datetime"
          onConfirm={onDateConfirm}
          onCancel={onDateCancel}
          minimumDate={new Date()}
        />
      )} */}

      {showContacts && (
        <View style={styles.contactsContainer}>
          <TouchableOpacity
            onPress={() => setShowContacts(false)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <Text style={styles.contactName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => inviteContact(item)}
                  style={styles.inviteButton}
                >
                  <Text style={styles.inviteButtonText}>Запросити</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {showDatePicker && (
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="datetime"
          onConfirm={onDateConfirm}
          onCancel={onDateCancel}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#ff6b6b",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contactsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    zIndex: 10,
    paddingTop: 120,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 10,
    padding: 10,
    backgroundColor: "#ff6b6b",
    borderRadius: 5,
    zIndex: 11,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  contactName: {
    fontSize: 18,
    color: "#ffffff",
  },
  inviteButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
  },
  inviteButtonText: {
    color: "#ffffff",
  },
});
