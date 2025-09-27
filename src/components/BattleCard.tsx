// src/components/BattleCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from './UserAvatar';
import CustomButton from './CustomButton';

interface BattleCardProps {
  battle: {
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
    winner_id?: number;
    challenger_score: number;
    opponent_score: number;
    created_at: string;
    expires_at?: string;
  };
  currentUserId?: number;
  onPress?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

export default function BattleCard({ 
  battle, 
  currentUserId, 
  onPress, 
  onAccept, 
  onDecline,
  showActions = true
}: BattleCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'active': return 'flash';
      case 'completed': return 'trophy';
      case 'cancelled': return 'close-circle';
      case 'expired': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const isUserOpponent = currentUserId === battle.opponent.id;
  const canAcceptBattle = battle.status === 'pending' && isUserOpponent;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(battle.status) }]}>
          <Ionicons name={getStatusIcon(battle.status)} size={12} color="#fff" />
          <Text style={styles.statusText}>{battle.status.toUpperCase()}</Text>
        </View>
        
        {battle.status === 'completed' && battle.winner_id && (
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={12} color="#FFD700" />
            <Text style={styles.winnerText}>
              {battle.winner_id === battle.challenger.id ? 'C' : 'O'} WINS
            </Text>
          </View>
        )}
      </View>

      <View style={styles.opponents}>
        <View style={styles.opponent}>
          <UserAvatar user={battle.challenger} size={32} />
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>
              {battle.challenger.first_name} {battle.challenger.last_name}
            </Text>
            <Text style={styles.opponentRecord}>
              {battle.challenger.battles_won}W-{battle.challenger.battles_lost}L
            </Text>
          </View>
          <Text style={styles.opponentLabel}>CHALLENGER</Text>
        </View>

        <View style={styles.vsSection}>
          <Text style={styles.vsText}>VS</Text>
          {battle.status === 'completed' && (
            <Text style={styles.score}>
              {battle.challenger_score}-{battle.opponent_score}
            </Text>
          )}
        </View>

        <View style={styles.opponent}>
          <UserAvatar user={battle.opponent} size={32} />
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>
              {battle.opponent.first_name} {battle.opponent.last_name}
            </Text>
            <Text style={styles.opponentRecord}>
              {battle.opponent.battles_won}W-{battle.opponent.battles_lost}L
            </Text>
          </View>
          <Text style={styles.opponentLabel}>OPPONENT</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>Created: {formatDate(battle.created_at)}</Text>
        {battle.expires_at && battle.status === 'pending' && (
          <Text style={styles.expires}>
            Expires: {formatDate(battle.expires_at)}
          </Text>
        )}
      </View>

      {showActions && canAcceptBattle && (
        <View style={styles.actions}>
          <CustomButton
            title="Accept"
            variant="primary"
            size="small"
            onPress={onAccept}
            style={styles.actionButton}
          />
          <CustomButton
            title="Decline"
            variant="secondary"
            size="small"
            onPress={onDecline}
            style={styles.actionButton}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
