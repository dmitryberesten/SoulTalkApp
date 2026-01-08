import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Alert, SafeAreaView, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import { AnimatedBackground } from './components/AnimatedBackground';
import { QuestionCard } from './components/QuestionCard';
import { CategorySelector } from './components/CategorySelector';
import { healthKitService } from './services/HealthKitService';
import { CATEGORIES, Category, SOUL_QUESTIONS, getQuestionOfTheDay } from './data/categories';

// Налаштування сповіщень
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // 1. Запит дозволів на сповіщення
    await requestNotificationPermissions();

    // 2. Запит дозволів на Apple Health
    await requestHealthKitPermissions();

    // 3. Моніторинг інтернету
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // 4. Встановити час початку сесії
    setSessionStartTime(new Date());

    return () => unsubscribe();
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        // Щоденне сповіщення о 20:00 (може не працювати в Expo Go)
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💝 SoulTalk',
              body: 'Час для SoulTalk! Задайте сьогоднішнє питання своїй парі',
              sound: true,
              data: { question: getQuestionOfTheDay() },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: 20,
              minute: 0,
              repeats: true,
            },
          });
        } catch (scheduleError) {
          console.log('⚠️ Scheduled notifications not supported in Expo Go');
        }
      }
    } catch (error) {
      console.log('⚠️ Notifications not fully supported in Expo Go');
    }
  };

  const requestHealthKitPermissions = async () => {
    if (healthKitService.isAvailable()) {
      const granted = await healthKitService.requestPermissions();
      if (granted) {
        console.log('✅ HealthKit дозволи надано');
      }
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwipeLeft = () => {
    if (!selectedCategory) return;
    const randomIndex = Math.floor(Math.random() * selectedCategory.questions.length);
    setCurrentQuestionIndex(randomIndex);
  };

  const handleSwipeRight = () => {
    if (!selectedCategory) return;
    const randomIndex = Math.floor(Math.random() * selectedCategory.questions.length);
    setCurrentQuestionIndex(randomIndex);

    // Якщо пройшло 10+ хвилин - зберегти в HealthKit
    checkAndSaveMindfulSession();
  };

  const checkAndSaveMindfulSession = async () => {
    const now = new Date();
    const sessionDuration = (now.getTime() - sessionStartTime.getTime()) / 60000; // в хвилинах

    if (sessionDuration >= 10) {
      const saved = await healthKitService.saveMindfulSession(sessionStartTime, now);
      
      if (saved) {
        Alert.alert(
          '💚 Mindful Minutes',
          `Ваша ${Math.floor(sessionDuration)}-хвилинна сесія SoulTalk збережена в Apple Health!`,
          [{ text: 'Чудово!', style: 'default' }]
        );
      }

      // Скинути таймер сесії
      setSessionStartTime(new Date());
    }
  };

  // Функція для запрошення партнера через контакти
  const invitePartner = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          // Відкриваємо системне меню поділитись
          const message = `💝 Приєднуйся до SoulTalk!\n\nДавай поглиблювати наші стосунки через щоденні значущі розмови.\n\nСьогоднішнє запитання: "${SOUL_QUESTIONS[currentQuestionIndex]}"\n\nЗавантаж SoulTalk та давай розпочнемо! ❤️`;
          
          await Share.share({
            message: message,
            title: 'Запрошення до SoulTalk',
          });
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert(
            '📱 Контакти',
            'У вас немає збережених контактів',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.log('Contacts error:', error);
    }
  };

  // Функція для планування сесії в календарі
  const scheduleSession = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find((cal) => cal.allowsModifications);

        if (defaultCalendar) {
          // Створюємо подію на завтра о 20:00
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(20, 0, 0, 0);
          
          const endTime = new Date(tomorrow);
          endTime.setMinutes(endTime.getMinutes() + 30);

          const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
            title: '💝 SoulTalk Session',
            startDate: tomorrow,
            endDate: endTime,
            notes: `Час для глибокої розмови з партнером через SoulTalk\n\nЗапитання: ${SOUL_QUESTIONS[currentQuestionIndex]}`,
            alarms: [{ relativeOffset: -15 }],
          });

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          Alert.alert(
            '✅ Заплановано!',
            `SoulTalk сесію додано до календаря на завтра о 20:00.\n\nВідкрийте додаток Календар щоб змінити час за потреби.`,
            [{ text: 'Чудово!' }]
          );
        }
      }
    } catch (error) {
      console.log('Calendar error:', error);
      Alert.alert(
        '📅 Календар',
        'Не вдалося створити подію. Перевірте дозволи в Налаштуваннях.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <AnimatedBackground />
      
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        
        <View style={[styles.content, isTablet && styles.contentTablet]}>
          {/* Показник підключення */}
          {!isOnline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>📡 Офлайн режим</Text>
            </View>
          )}

          {/* Вибір категорії або картка запитання */}
          {!selectedCategory ? (
            <CategorySelector
              categories={CATEGORIES}
              onSelectCategory={handleSelectCategory}
            />
          ) : (
            <>
              {/* Кнопка назад */}
              <TouchableOpacity
                onPress={handleBackToCategories}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Категорії</Text>
              </TouchableOpacity>

              {/* Картка запитання */}
              <QuestionCard
                question={selectedCategory.questions[currentQuestionIndex]}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                index={currentQuestionIndex}
              />

              {/* Додаткові кнопки */}
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={invitePartner} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>👥 Запросити</Text>
                </TouchableOpacity>
            
                <TouchableOpacity onPress={scheduleSession} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>📅 Запланувати</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentTablet: {
    paddingHorizontal: 80,
  },
  offlineBanner: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(255, 0, 110, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  offlineText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
