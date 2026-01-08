import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Category } from '../data/categories';

interface CategorySelectorProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelectCategory,
}) => {
  const handlePress = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      {/* Логотип та назва */}
      <View style={styles.header}>
        <Text style={styles.logo}>💝</Text>
        <Text style={styles.appName}>SoulTalk</Text>
        <Text style={styles.subtitle}>Оберіть категорію для розмови</Text>
      </View>

      {/* Категорії */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category, index) => (
          <View key={category.id}>
            <TouchableOpacity
              onPress={() => handlePress(category)}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} tint="dark" style={styles.categoryCard}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View
                  style={[
                    styles.categoryIndicator,
                    { backgroundColor: category.color },
                  ]}
                />
              </BlurView>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  categoriesContainer: {
    paddingBottom: 40,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  categoryEmoji: {
    fontSize: 36,
    marginRight: 15,
  },
  categoryName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
