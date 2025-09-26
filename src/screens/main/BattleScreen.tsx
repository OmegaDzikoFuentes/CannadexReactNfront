// src/screens/main/BattlesScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Battles'>;

interface Battle {
  id: number;
  challenger_id: number;
  opponent_id: number;
  challenger_name: string;
  opponent_name: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  winner_id?: number;
  challenger_score: number;
  opponent_score: number;
  created_at: string;
  expires_at: string;
  battled_at?: string;
}

type BattleTab = 'active' | 'pending' | 'completed';

export default function BattlesScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BattleTab>('active');

  const loadBattles = useCallback(async () => {
    try {
      setLoading(true);
      // Based on the active tab, load different battle endpoints
      let endpoint = '';
      switch (activeTab) {
        case 'pending':
          endpoint = '/api/v1/battles/pending';
          break;
        case 'active':
          endpoint = '/api/v1/battles/active';
          break;
        case 'completed':
          endpoint = '/api/v1/battles/completed';
          break;
      }
      
      // const response = await api.get(endpoint);
      // setBattles(response.data);

      // Mock data for development
      const mockBattles: Battle[] = [
        {
          id: 1,
          challenger_id: user?.id || 1,
          opponent_id: 2,
          challenger_name: user?.first_name || 'You',
          opponent_name: 'Sarah',
          status: activeTab === 'pending' ? 'pending' : activeTab === 'active' ? 'active' : 'completed',
          challenger_score: activeTab === 'completed' ? 2 : 0,
          opponent_score: activeTab === 'completed' ? 1 : 0,
          winner_id: activeTab === 'completed' ? (user?.id || 1) : undefined,
          created_at: '2025-01-20T10:30:00Z',
          expires_at: '2025-01-21T10:30:00Z',
          battled_at: activeTab === 'completed' ? '2025-01-20T15:45:00Z' : undefined,
        },
        {
          id: 2,
          challenger_id: 3,
          opponent_id: user?.id || 1,
          challenger_name: 'Mike',
          opponent_name: user?.first_name || 'You',
          status: activeTab === 'pending' ? 'pending' : activeTab === 'active' ? 'active' : 'completed',
          challenger_score: activeTab === 'completed' ? 1 : 0,
          opponent_score: activeTab === 'completed' ? 2 : 0,
          winner_id: activeTab === 'completed' ? (user?.id || 1) : undefined,
          created_at: '2025-01-19T14:20:00Z',
          expires_at: '2025-01-20T14:20:00Z',
          battled_at: activeTab === 'completed' ? '2025-01-19T18:30:00Z' : undefined,
        },
        {
          id: 3,
          challenger_id: user?.id || 1,
          opponent_id: 4,
          challenger_name: user?.first_name || 'You',
          opponent_name: 'Alex',
          status: activeTab === 'pending' ? 'pending' : activeTab === 'active' ? 'active' : 'completed',
          challenger_score: activeTab === 'completed' ? 0 : 0,
          opponent_score: activeTab === 'completed' ? 3 : 0,
          winner_id: activeTab === 'completed' ? 4 : undefined,
          created_at: '2025-01-18T09:15:00Z',
          expires_at: '2025-01-19T09:15:00Z',
          battled_at: activeTab === 'completed' ? '2025-01-18T16:45:00Z' : undefined,
        },
      ];

      setBattles(mockBattles);
    } catch (error) {
      console.error('Failed to load battles:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id, user?.first_name]);

  useEffect(() => {
    loadBattles();
  }, [loadBattles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBattles();
    setRefreshing(false);
  }, [loadBattles]);

  const handleAcceptBattle = async (battleId: number) => {
    try {
      // await api.post(`/api/v1/battles/${battleId}/accept`);
      Alert.alert('Battle Accepted!', 'The battle has begun. May the best strains win!');
      loadBattles();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept battle. Please try again.');
    }
  };

  const handleDeclineBattle = async (battleId: number) => {
    Alert.alert(
      'Decline Battle',
      'Are you sure you want to decline this battle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              // await api.post(`/api/v1/battles/${battleId}/decline`);
              loadBattles();
            } catch (error) {
              Alert.alert('Error', 'Failed to decline battle. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCancelBattle = async (battleId: number) => {
    Alert.alert(
      'Cancel Battle',
      'Are you sure you want to cancel this battle?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              // await api.delete(`/api/v1/battles/${battleId}/cancel`);
              loadBattles();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel battle. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const isUserChallenger = (battle: Battle) => {
    return battle.challenger_id === user?.id;
  };

  const getUserScore = (battle: Battle) => {
    return isUserChallenger(battle) ? battle.challenger_score : battle.opponent_score;
  };

  const getOpponentScore = (battle: Battle) => {
    return isUserChallenger(battle) ? battle.opponent_score : battle.challenger_score;
  };

  const getOpponentName = (battle: Battle) => {
    return isUserChallenger(battle) ? battle.opponent_name : battle.challenger_name;
  };

  const getBattleResult = (battle: Battle) => {
    if (!battle.winner_id) return null;
    
    if (battle.winner_id === user?.id) return 'won';
    return 'lost';
  };

  const renderBattleCard = ({ item }: { item: Battle }) => {
    const isChallenger = isUserChallenger(item);
    const opponentName = getOpponentName(item);
    const userScore = getUserScore(item);
    const opponentScore = getOpponentScore(item);
    const result = getBattleResult(item);

    return (
      <TouchableOpacity
        style={styles.battleCard}
        onPress={() => navigation.navigate('BattleDetail', { battleId: item.id })}
      >
        <View style={styles.battleHeader}>
          <Text style={styles.opponentName}>vs {opponentName}</Text>
          <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.battleContent}>
          {item.status === 'completed' && (
            <View style={styles.scoreContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>You</Text>
                <Text style={[styles.scoreValue, result === 'won' && styles.winningScore]}>
                  {userScore}
                </Text>
              </View>
              <Text style={styles.scoreVs}>-</Text>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>{opponentName}</Text>
                <Text style={[styles.scoreValue, result === 'lost' && styles.winningScore]}>
                  {opponentScore}
                </Text>
              </View>
            </View>
          )}

          {result && (
            <View style={[styles.resultBadge, result === 'won' ? styles.wonBadge : styles.lostBadge]}>
              <Text style={styles.resultText}>
                {result === 'won' ? '🏆 Victory' : '💔 Defeat'}
              </Text>
            </View>
          )}

          <View style={styles.battleMeta}>
            <Text style={styles.battleDate}>
              {item.status === 'completed' && item.battled_at
                ? `Completed ${formatDate(item.battled_at)}`
                : `Created ${formatDate(item.created_at)}`}
            </Text>
            {item.status !== 'completed' && (
              <Text style={styles.timeRemaining}>
                {getTimeRemaining(item.expires_at)}
              </Text>
            )}
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            {isChallenger ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBattle(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDeclineBattle(item.id)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptBattle(item.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>⚔️</Text>
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'pending' && 'No Pending Battles'}
        {activeTab === 'active' && 'No Active Battles'}
        {activeTab === 'completed' && 'No Completed Battles'}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {activeTab === 'pending' && 'Battle invitations will appear here'}
        {activeTab === 'active' && 'Your ongoing battles will appear here'}
        {activeTab === 'completed' && 'Your battle history will appear here'}
      </Text>
      {activeTab !== 'completed' && (
        <TouchableOpacity
          style={styles.createBattleButton}
          onPress={() => navigation.navigate('CreateBattle')}
        >
          <Text style={styles.createBattleButtonText}>Start a New Battle</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getTabCount = () => {
    // In a real app, you'd get these counts from the API
    const counts = {
      pending: activeTab === 'pending' ? battles.length : 2,
      active: activeTab === 'active' ? battles.length : 1,
      completed: activeTab === 'completed' ? battles.length : 5,
    };
    return counts;
  };

  const tabCounts = getTabCount();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Battles</Text>
        <Text style={styles.headerSubtitle}>Challenge friends with strain battles</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({tabCounts.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({tabCounts.active})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            History ({tabCounts.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Battle List */}
      <FlatList
        data={battles}
        renderItem={renderBattleCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBattle')}
      >
        <Text style={styles.fabIcon}>⚔️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  battleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_pending: {
    backgroundColor: '#fff3cd',
  },
  status_active: {
    backgroundColor: '#d4edda',
  },
  status_completed: {
    backgroundColor: '#e2e3e5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  battleContent: {
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  winningScore: {
    color: '#4CAF50',
  },
  scoreVs: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 20,
  },
  resultBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 12,
  },
  wonBadge: {
    backgroundColor: '#e8f5e8',
  },
  lostBadge: {
    backgroundColor: '#fce8e8',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  battleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  battleDate: {
    fontSize: 12,
    color: '#666',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createBattleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  createBattleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
  },
});