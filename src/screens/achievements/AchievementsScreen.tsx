// src/screens/achievements/AchievementsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector } from '../../hooks/redux';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export default function AchievementsScreen() {
  const { user } = useAppSelector(state => state.auth);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/users/${user?.id}/achievements`);
      // setAchievements(response.data);

      // Mock data
      setAchievements([
        {
          id: 1,
          name: 'First Encounter',
          description: 'Log your first strain encounter',
          icon_url: null,
          unlocked: true,
          unlocked_at: '2025-01-01',
        },
        {
          id: 2,
          name: 'Strain Explorer',
          description: 'Log 10 different strains',
          icon_url: null,
          unlocked: false,
        },
        {
          id: 3,
          name: 'Connoisseur',
          description: 'Rate 50 strains',
          icon_url: null,
          unlocked: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAchievementItem = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementItem, !item.unlocked && styles.lockedItem]}>
      {item.icon_url ? (
        <Image source={{ uri: item.icon_url }} style={styles.achievementIcon} />
      ) : (
        <View style={styles.achievementIconPlaceholder}>
          <Text style={styles.achievementIconText}>🏆</Text>
        </View>
      )}
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementName, !item.unlocked && styles.lockedText]}>{item.name}</Text>
        <Text style={[styles.achievementDescription, !item.unlocked && styles.lockedText]}>{item.description}</Text>
        {item.unlocked && item.unlocked_at && (
          <Text style={styles.unlockedDate}>Unlocked on {new Date(item.unlocked_at).toLocaleDateString()}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerSubtitle}>
          {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
        </Text>
      </View>
      <FlatList
        data={achievements}
        renderItem={renderAchievementItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lockedItem: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  achievementIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 16,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  lockedText: {
    color: '#999',
  },
});