// src/screens/battles/BattleDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'BattleDetail'>;

interface BattleRound {
  id: number;
  round_number: number;
  challenger_strain: {
    id: number;
    name: string;
    category: string;
  };
  opponent_strain: {
    id: number;
    name: string;
    category: string;
  };
  winner_strain_id: number | null;
  round_results: {
    taste_score: { challenger: number; opponent: number };
    smell_score: { challenger: number; opponent: number };
    potency_score: { challenger: number; opponent: number };
    overall_score: { challenger: number; opponent: number };
  };
}

interface BattleDetail {
  id: number;
  challenger: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    battles_won: number;
    battles_lost: number;
  };
  opponent: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    battles_won: number;
    battles_lost: number;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  winner_id: number | null;
  challenger_score: number;
  opponent_score: number;
  battle_results: any;
  battled_at: string | null;
  expires_at: string;
  created_at: string;
  rounds: BattleRound[];
  challenger_strains: Array<{
    id: number;
    name: string;
    category: string;
    position: number;
  }>;
  opponent_strains: Array<{
    id: number;
    name: string;
    category: string;
    position: number;
  }>;
}

export default function BattleDetailScreen({ navigation, route }: Props) {
  const { battleId } = route.params;
  const { user } = useAppSelector(state => state.auth);
  
  const [battle, setBattle] = useState<BattleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBattleDetail();
  }, [battleId]);

  const loadBattleDetail = async () => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/battles/${battleId}`);
      // setBattle(response.data);
      
      // Mock data for development
      const mockBattle: BattleDetail = {
        id: battleId,
        challenger: {
          id: 1,
          username: 'cannabis_king',
          first_name: 'John',
          last_name: 'Doe',
          battles_won: 15,
          battles_lost: 3,
        },
        opponent: {
          id: 2,
          username: 'bud_master',
          first_name: 'Jane',
          last_name: 'Smith',
          battles_won: 12,
          battles_lost: 5,
        },
        status: 'completed',
        winner_id: 1,
        challenger_score: 2,
        opponent_score: 1,
        battle_results: {
          total_rounds: 3,
          decisive_factors: ['taste', 'overall_quality'],
        },
        battled_at: '2025-01-20T14:30:00Z',
        expires_at: '2025-01-21T14:30:00Z',
        created_at: '2025-01-20T10:00:00Z',
        challenger_strains: [
          { id: 1, name: 'Blue Dream', category: 'Hybrid', position: 1 },
          { id: 2, name: 'OG Kush', category: 'Indica', position: 2 },
          { id: 3, name: 'Sour Diesel', category: 'Sativa', position: 3 },
        ],
        opponent_strains: [
          { id: 4, name: 'Wedding Cake', category: 'Hybrid', position: 1 },
          { id: 5, name: 'Purple Haze', category: 'Sativa', position: 2 },
          { id: 6, name: 'Granddaddy Purple', category: 'Indica', position: 3 },
        ],
        rounds: [
          {
            id: 1,
            round_number: 1,
            challenger_strain: { id: 1, name: 'Blue Dream', category: 'Hybrid' },
            opponent_strain: { id: 4, name: 'Wedding Cake', category: 'Hybrid' },
            winner_strain_id: 1,
            round_results: {
              taste_score: { challenger: 8.5, opponent: 7.8 },
              smell_score: { challenger: 8.2, opponent: 8.0 },
              potency_score: { challenger: 7.9, opponent: 8.3 },
              overall_score: { challenger: 8.3, opponent: 8.0 },
            },
          },
          {
            id: 2,
            round_number: 2,
            challenger_strain: { id: 2, name: 'OG Kush', category: 'Indica' },
            opponent_strain: { id: 5, name: 'Purple Haze', category: 'Sativa' },
            winner_strain_id: 2,
            round_results: {
              taste_score: { challenger: 9.1, opponent: 8.0 },
              smell_score: { challenger: 8.8, opponent: 7.5 },
              potency_score: { challenger: 9.2, opponent: 8.2 },
              overall_score: { challenger: 9.0, opponent: 7.9 },
            },
          },
          {
            id: 3,
            round_number: 3,
            challenger_strain: { id: 3, name: 'Sour Diesel', category: 'Sativa' },
            opponent_strain: { id: 6, name: 'Granddaddy Purple', category: 'Indica' },
            winner_strain_id: 6,
            round_results: {
              taste_score: { challenger: 7.5, opponent: 8.4 },
              smell_score: { challenger: 8.0, opponent: 8.6 },
              potency_score: { challenger: 8.1, opponent: 8.9 },
              overall_score: { challenger: 7.8, opponent: 8.6 },
            },
          },
        ],
      };
      
      setBattle(mockBattle);
    } catch (error) {
      console.error('Failed to load battle:', error);
      Alert.alert('Error', 'Failed to load battle details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBattle = async () => {
    if (!battle) return;
    
    try {
      setActionLoading(true);
      // await api.post(`/api/v1/battles/${battleId}/accept`);
      Alert.alert('Success', 'Battle accepted! Let the competition begin!');
      await loadBattleDetail(); // Reload to get updated status
    } catch (error) {
      Alert.alert('Error', 'Failed to accept battle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineBattle = async () => {
    if (!battle) return;
    
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
              setActionLoading(true);
              // await api.post(`/api/v1/battles/${battleId}/decline`);
              Alert.alert('Battle Declined', 'You have declined this battle.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to decline battle');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelBattle = async () => {
    if (!battle) return;
    
    Alert.alert(
      'Cancel Battle',
      'Are you sure you want to cancel this battle?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Battle',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              // await api.delete(`/api/v1/battles/${battleId}/cancel`);
              Alert.alert('Battle Cancelled', 'The battle has been cancelled.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel battle');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'active': return '#007AFF';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#666';
      case 'expired': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Response';
      case 'active': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const isUserInvolved = (userId: number) => {
    return battle?.challenger.id === userId || battle?.opponent.id === userId;
  };

  const canAcceptBattle = () => {
    return battle?.status === 'pending' && battle?.opponent.id === user?.id;
  };

  const canCancelBattle = () => {
    return battle?.status === 'pending' && battle?.challenger.id === user?.id;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading battle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!battle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Battle not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBattleDetail}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Battle Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(battle.status) }]}>
            <Text style={styles.statusText}>{getStatusText(battle.status)}</Text>
          </View>
          {battle.battled_at && (
            <Text style={styles.battleDate}>{formatDate(battle.battled_at)}</Text>
          )}
          {battle.status === 'pending' && (
            <Text style={styles.expiresText}>
              Expires: {formatDate(battle.expires_at)}
            </Text>
          )}
        </View>

        {/* Competitors */}
        <View style={styles.competitorsContainer}>
          <View style={styles.competitor}>
            <View style={styles.competitorInfo}>
              <Text style={styles.competitorName}>
                {battle.challenger.first_name} {battle.challenger.last_name}
              </Text>
              <Text style={styles.competitorUsername}>@{battle.challenger.username}</Text>
              <Text style={styles.competitorRecord}>
                {battle.challenger.battles_won}W - {battle.challenger.battles_lost}L
              </Text>
            </View>
            <Text style={styles.competitorLabel}>Challenger</Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            {battle.status === 'completed' && battle.winner_id && (
              <Text style={styles.scoreText}>
                {battle.challenger_score} - {battle.opponent_score}
              </Text>
            )}
          </View>

          <View style={styles.competitor}>
            <View style={styles.competitorInfo}>
              <Text style={styles.competitorName}>
                {battle.opponent.first_name} {battle.opponent.last_name}
              </Text>
              <Text style={styles.competitorUsername}>@{battle.opponent.username}</Text>
              <Text style={styles.competitorRecord}>
                {battle.opponent.battles_won}W - {battle.opponent.battles_lost}L
              </Text>
            </View>
            <Text style={styles.competitorLabel}>Opponent</Text>
          </View>
        </View>

        {/* Winner Banner */}
        {battle.status === 'completed' && battle.winner_id && (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerText}>🏆 Winner</Text>
            <Text style={styles.winnerName}>
              {battle.winner_id === battle.challenger.id
                ? `${battle.challenger.first_name} ${battle.challenger.last_name}`
                : `${battle.opponent.first_name} ${battle.opponent.last_name}`}
            </Text>
          </View>
        )}

        {/* Battle Lineup */}
        <View style={styles.lineupContainer}>
          <Text style={styles.sectionTitle}>Battle Lineup</Text>
          <View style={styles.lineupGrid}>
            <View style={styles.lineupColumn}>
              <Text style={styles.lineupColumnHeader}>Challenger's Strains</Text>
              {battle.challenger_strains.map((strain, index) => (
                <View key={strain.id} style={styles.strainItem}>
                  <Text style={styles.strainPosition}>{strain.position}</Text>
                  <View style={styles.strainInfo}>
                    <Text style={styles.strainName}>{strain.name}</Text>
                    <Text style={styles.strainCategory}>{strain.category}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.lineupColumn}>
              <Text style={styles.lineupColumnHeader}>Opponent's Strains</Text>
              {battle.opponent_strains.map((strain, index) => (
                <View key={strain.id} style={styles.strainItem}>
                  <Text style={styles.strainPosition}>{strain.position}</Text>
                  <View style={styles.strainInfo}>
                    <Text style={styles.strainName}>{strain.name}</Text>
                    <Text style={styles.strainCategory}>{strain.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Battle Rounds */}
        {battle.rounds && battle.rounds.length > 0 && (
          <View style={styles.roundsContainer}>
            <Text style={styles.sectionTitle}>Battle Results</Text>
            {battle.rounds.map((round) => (
              <View key={round.id} style={styles.roundCard}>
                <View style={styles.roundHeader}>
                  <Text style={styles.roundTitle}>Round {round.round_number}</Text>
                  {round.winner_strain_id && (
                    <Text style={styles.roundWinner}>
                      Winner: {round.winner_strain_id === round.challenger_strain.id 
                        ? round.challenger_strain.name 
                        : round.opponent_strain.name}
                    </Text>
                  )}
                </View>

                <View style={styles.roundMatchup}>
                  <Text style={styles.roundMatchupText}>
                    {round.challenger_strain.name} vs {round.opponent_strain.name}
                  </Text>
                </View>

                <View style={styles.roundScores}>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Taste</Text>
                    <Text style={styles.scoreValue}>
                      {round.round_results.taste_score.challenger} - {round.round_results.taste_score.opponent}
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Smell</Text>
                    <Text style={styles.scoreValue}>
                      {round.round_results.smell_score.challenger} - {round.round_results.smell_score.opponent}
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Potency</Text>
                    <Text style={styles.scoreValue}>
                      {round.round_results.potency_score.challenger} - {round.round_results.potency_score.opponent}
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Overall</Text>
                    <Text style={[styles.scoreValue, styles.overallScore]}>
                      {round.round_results.overall_score.challenger} - {round.round_results.overall_score.opponent}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {isUserInvolved(user?.id || 0) && (
          <View style={styles.actionsContainer}>
            {canAcceptBattle() && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={handleAcceptBattle}
                  disabled={actionLoading}
                >
                  <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
                    {actionLoading ? 'Accepting...' : 'Accept Battle'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={handleDeclineBattle}
                  disabled={actionLoading}
                >
                  <Text style={[styles.actionButtonText, styles.declineButtonText]}>
                    Decline Battle
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {canCancelBattle() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelBattle}
                disabled={actionLoading}
              >
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                  {actionLoading ? 'Cancelling...' : 'Cancel Battle'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  battleDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  expiresText: {
    fontSize: 14,
    color: '#666',
  },
  competitorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  competitor: {
    flex: 1,
    alignItems: 'center',
  },
  competitorInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  competitorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  competitorUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  competitorRecord: {
    fontSize: 12,
    color: '#999',
  },
  competitorLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  winnerBanner: {
    backgroundColor: '#fff9c4',
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    margin: 20,
    borderRadius: 8,
  },
  winnerText: {
    fontSize: 14,
    color: '#f57c00',
    fontWeight: '600',
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lineupContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  lineupGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  lineupColumn: {
    flex: 1,
  },
  lineupColumnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  strainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  strainPosition: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  strainInfo: {
    flex: 1,
  },
  strainName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  strainCategory: {
    fontSize: 12,
    color: '#666',
  },
  roundsContainer: {
    padding: 20,
  },
  roundCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roundWinner: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  roundMatchup: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roundMatchupText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  roundScores: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  overallScore: {
    fontSize: 16,
    color: '#4CAF50',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#fff',
  },
  declineButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  declineButtonText: {
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  cancelButtonText: {
    color: '#f44336',
  },
});