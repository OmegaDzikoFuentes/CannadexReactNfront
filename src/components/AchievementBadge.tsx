// src/components/AchievementBadge.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AchievementBadgeProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    progress: number;
    goal: number;
    xp_reward: number;
    is_unlocked: boolean;
    is_claimed: boolean;
    badge_image_url?: string;
    achievement_type: string;
  };
  onPress?: () => void;
  onClaim?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function AchievementBadge({ 
  achievement, 
  onPress, 
  onClaim,
  size = 'medium'
}: AchievementBadgeProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 100, iconSize: 24, titleSize: 12 };
      case 'large':
        return { width: 120, height: 150, iconSize: 40, titleSize: 18 };
      default:
        return { width: 100, height: 125, iconSize: 32, titleSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();
  const progressPercentage = (achievement.progress / achievement.goal) * 100;

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'encounters': return 'leaf';
      case 'battles': return 'trophy';
      case 'social': return 'people';
      case 'exploration': return 'compass';
      case 'rating': return 'star';
      default: return 'medal';
    }
  };

  const getGradientColors = () => {
    if (achievement.is_claimed) {
      return ['#FFD700', '#FFA500']; // Gold for claimed
    } else if (achievement.is_unlocked) {
      return ['#4CAF50', '#2E7D32']; // Green for unlocked
    } else {
      return ['#E0E0E0', '#BDBDBD']; // Gray for locked
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: sizeStyles.width, height: sizeStyles.height }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.badge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {achievement.badge_image_url ? (
          <Image 
            source={{ uri: achievement.badge_image_url }} 
            style={[styles.badgeImage, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}
          />
        ) : (
          <Ionicons 
            name={getAchievementIcon(achievement.achievement_type)} 
            size={sizeStyles.iconSize} 
            color="#fff" 
          />
        )}

        {achievement.is_unlocked && !achievement.is_claimed && (
          <View style={styles.unclaimedIndicator}>
            <Ionicons name="gift" size={12} color="#fff" />
          </View>
        )}
      </LinearGradient>

      <View style={styles.info}>
        <Text 
          style={[styles.title, { fontSize: sizeStyles.titleSize }]} 
          numberOfLines={2}
        >
          {achievement.title}
        </Text>

        {!achievement.is_unlocked && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: sizeStyles.width - 20 }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progressPercentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.goal}
            </Text>
          </View>
        )}

        {achievement.is_unlocked && !achievement.is_claimed && onClaim && (
          <TouchableOpacity style={styles.claimButton} onPress={onClaim}>
            <Text style={styles.claimButtonText}>CLAIM</Text>
          </TouchableOpacity>
        )}

        {achievement.is_claimed && (
          <View style={styles.claimedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
            <Text style={styles.claimedText}>CLAIMED</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
