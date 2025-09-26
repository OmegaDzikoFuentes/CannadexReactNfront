// src/screens/main/ProfileScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

interface UserStats {
  total_encounters: number;
  battles_won: number;
  battles_lost: number;
  level: number;
  experience_points: number;
  achievements_unlocked: number;
  favorite_strain?: string;
  most_common_effect?: string;
  join_date: string;
}

interface RecentAchievement {
  id: number;
  title: string;
  description: string;
  unlocked_at: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_encounter_date?: string;
}

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    total_encounters: 0,
    battles_won: 0,
    battles_lost: 0,
    level: 1,
    aunt_points: 0,
    achievements_unlocked: 0,
    join_date: '2025-01-01',
  });
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [streak, setStreak] = useState<Streak>({
    current_streak: 0,
    longest_streak: 0,
  });

  const loadProfileData = useCallback(async () => {
    try {
      // Load user stats
      // const statsResponse = await api.get('/api/v1/stats/user');
      // setUserStats(statsResponse.data);

      // Load recent achievements
      // const achievementsResponse = await api.get('/api/v1/achievements/unlocked', { params: { limit: 3 } });
      // setRecentAchievements(achievementsResponse.data);

      // Mock data for development
      setUserStats({
        total_encounters: user?.total_encounters || 15,
        battles_won: user?.battles_won || 8,
        battles_lost: user?.battles_lost || 3,
        level: user?.level || 5,
        experience_points: user?.experience_points || 2450,
        achievements_unlocked: 12,
        favorite_strain: 'Blue Dream',
        most_common_effect: 'Creative',
        join_date: user?.created_at || '2025-01-01',
      });

      setRecentAchievements([
        {
          id: 1,
          title: 'Strain Connoisseur',
          description: 'Try 10 different strains',
          unlocked_at: '2025-01-20T10:30:00Z',
        },
        {
          id: 2,
          title: 'Battle Champion',
          description: 'Win 5 strain battles',
          unlocked_at: '2025-01-19T15:45:00Z',
        },
        {
          id: 3,
          title: 'Social Smoker',
          description: 'Add 5 friends',
          unlocked_at: '2025-01-18T20:15:00Z',
        },
      ]);

      setStreak({
        current_streak: 7,
        longest_streak: 15,
        last_encounter_date: '2025-01-20T18:00:00Z',
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  }, [loadProfileData]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const calculateLevelProgress = () => {
    // Simple progression: each level requires 500 * level XP
    const currentLevel = userStats.level;
    const xpForCurrentLevel = 500 * (currentLevel - 1);
    const xpForNextLevel = 500 * currentLevel;
    const currentXP = userStats.experience_points;
    
    const progressXP = currentXP - xpForCurrentLevel;
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    
    return Math.min(progressXP / neededXP, 1);
  };

  const getNextLevelXP = () => {
    const currentLevel = userStats.level;
    const xpForNextLevel = 500 * currentLevel;
    return xpForNextLevel - userStats.experience_points;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAchievementDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const profileMenuItems = [
    {
      id: 'achievements',
      title: 'Achievements',
      icon: '🏆',
      subtitle: `${userStats.achievements_unlocked} unlocked`,
      onPress: () => navigation.navigate('Achievements'),
    },
    {
      id: 'friends',
      title: 'Friends',
      icon: '👥',
      subtitle: 'Manage your connections',
      onPress: () => navigation.navigate('Friends'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      subtitle: 'Privacy & preferences',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userStats.level}</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          
          {user?.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <Text style={styles.joinDate}>
            Member since {formatDate(userStats.join_date)}
          </Text>
        </View>

        {/* Level Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelInfo}>
              <Text style={styles.currentLevel}>Level {userStats.level}</Text>
              <Text style={styles.xpText}>
                {userStats.experience_points} XP ({getNextLevelXP()} to next level)
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateLevelProgress() * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.total_encounters}</Text>
              <Text style={styles.statLabel}>Encounters</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.battles_won}</Text>
              <Text style={styles.statLabel}>Battles Won</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.achievements_unlocked}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{streak.current_streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        {(userStats.favorite_strain || userStats.most_common_effect) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Cannabis Profile</Text>
            <View style={styles.insightsContainer}>
              {userStats.favorite_strain && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Favorite Strain</Text>
                  <Text style={styles.insightValue}>{userStats.favorite_strain}</Text>
                </View>
              )}
              {userStats.most_common_effect && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Most Common Effect</Text>
                  <Text style={styles.insightValue}>{userStats.most_common_effect}</Text>
                </View>
              )}
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Longest Streak</Text>
                <Text style={styles.insightValue}>{streak.longest_streak} days</Text>
              </View>
            </View>
          </View>
        )}

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
                  <Text style={styles.achievementDate}>
                    {formatAchievementDate(achievement.unlocked_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Profile Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  levelProgressContainer: {
    marginTop: -8,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currentLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: -8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  insightsContainer: {
    marginTop: -8,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff3cd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconText: {
    fontSize: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 11,
    color: '#999',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});