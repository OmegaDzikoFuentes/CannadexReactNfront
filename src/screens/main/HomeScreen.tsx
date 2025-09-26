// src/screens/main/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

interface RecentEncounter {
  id: number;
  strain_name: string;
  overall_rating: number;
  encountered_at: string;
  card_image_url?: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  badge_image_url?: string;
  is_unlocked: boolean;
  unlocked_at?: string;
}

interface ActivityItem {
  id: number;
  activity_type: string;
  user_name: string;
  strain_name?: string;
  created_at: string;
}

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [recentEncounters, setRecentEncounters] = useState<RecentEncounter[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [friendActivity, setFriendActivity] = useState<ActivityItem[]>([]);
  const [userStats, setUserStats] = useState({
    total_encounters: 0,
    battles_won: 0,
    level: 1,
    experience_points: 0,
  });

  const loadHomeData = useCallback(async () => {
    try {
      // Load user's recent encounters
      // const encountersResponse = await api.get('/api/v1/encounters', { params: { limit: 3 } });
      // setRecentEncounters(encountersResponse.data);

      // Load recent achievements
      // const achievementsResponse = await api.get('/api/v1/achievements/unlocked', { params: { limit: 3 } });
      // setRecentAchievements(achievementsResponse.data);

      // Load friends activity feed
      // const activityResponse = await api.get('/api/v1/encounters/friends_feed', { params: { limit: 5 } });
      // setFriendActivity(activityResponse.data);

      // Load user stats
      // const statsResponse = await api.get('/api/v1/stats/user');
      // setUserStats(statsResponse.data);

      // Mock data for development
      setRecentEncounters([
        { id: 1, strain_name: 'Blue Dream', overall_rating: 8.5, encountered_at: '2025-01-20T10:30:00Z' },
        { id: 2, strain_name: 'OG Kush', overall_rating: 9.0, encountered_at: '2025-01-19T15:45:00Z' },
        { id: 3, strain_name: 'Sour Diesel', overall_rating: 7.8, encountered_at: '2025-01-18T20:15:00Z' },
      ]);

      setRecentAchievements([
        { id: 1, title: 'First Encounter', description: 'Log your first strain encounter', is_unlocked: true, unlocked_at: '2025-01-20T10:30:00Z' },
        { id: 2, title: 'Connoisseur', description: 'Try 10 different strains', is_unlocked: true, unlocked_at: '2025-01-19T15:45:00Z' },
      ]);

      setFriendActivity([
        { id: 1, activity_type: 'encounter', user_name: 'Sarah', strain_name: 'Granddaddy Purple', created_at: '2025-01-20T12:00:00Z' },
        { id: 2, activity_type: 'battle_won', user_name: 'Mike', created_at: '2025-01-20T11:30:00Z' },
        { id: 3, activity_type: 'encounter', user_name: 'Alex', strain_name: 'Wedding Cake', created_at: '2025-01-20T10:45:00Z' },
      ]);

      setUserStats({
        total_encounters: user?.total_encounters || 0,
        battles_won: user?.battles_won || 0,
        level: user?.level || 1,
        experience_points: user?.experience_points || 0,
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, [loadHomeData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.activity_type) {
      case 'encounter':
        return `${activity.user_name} tried ${activity.strain_name}`;
      case 'battle_won':
        return `${activity.user_name} won a strain battle`;
      case 'achievement_unlocked':
        return `${activity.user_name} unlocked an achievement`;
      default:
        return `${activity.user_name} had an activity`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.first_name}!</Text>
          <Text style={styles.subGreeting}>Ready to explore some strains?</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.total_encounters}</Text>
            <Text style={styles.statLabel}>Encounters</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.battles_won}</Text>
            <Text style={styles.statLabel}>Battles Won</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateEncounter')}
            >
              <Text style={styles.actionButtonIcon}>📝</Text>
              <Text style={styles.actionButtonText}>Log Encounter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateBattle')}
            >
              <Text style={styles.actionButtonIcon}>⚔️</Text>
              <Text style={styles.actionButtonText}>Start Battle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.actionButtonIcon}>🔍</Text>
              <Text style={styles.actionButtonText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Encounters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Encounters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {recentEncounters.map((encounter) => (
              <TouchableOpacity
                key={encounter.id}
                style={styles.encounterCard}
                onPress={() => navigation.navigate('EncounterDetail', { encounterId: encounter.id })}
              >
                <View style={styles.encounterImagePlaceholder}>
                  <Text style={styles.encounterImageText}>🌿</Text>
                </View>
                <Text style={styles.encounterName}>{encounter.strain_name}</Text>
                <Text style={styles.encounterRating}>★ {encounter.overall_rating}</Text>
                <Text style={styles.encounterDate}>{formatDate(encounter.encountered_at)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementIconText}>🏆</Text>
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  {achievement.unlocked_at && (
                    <Text style={styles.achievementDate}>
                      Unlocked {formatDate(achievement.unlocked_at)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Friends Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends Activity</Text>
          {friendActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>👤</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{getActivityText(activity)}</Text>
                <Text style={styles.activityDate}>{formatDate(activity.created_at)}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.viewAllButtonText}>View All Friends</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 16,
  },
  encounterCard: {
    backgroundColor: '#fff',
    width: 120,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  encounterImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  encounterImageText: {
    fontSize: 24,
  },
  encounterName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  encounterRating: {
    fontSize: 11,
    color: '#4CAF50',
    marginBottom: 2,
  },
  encounterDate: {
    fontSize: 10,
    color: '#666',
  },
  achievementCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});