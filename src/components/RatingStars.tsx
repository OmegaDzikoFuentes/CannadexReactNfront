// src/components/RatingStars.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (newRating: number) => void;
  size?: number;
  color?: string;
  editable?: boolean;
  maxRating?: number;
  showLabel?: boolean;
  accessibilityLabel?: string;
}

export default function RatingStars({
  rating,
  onRatingChange,
  size = 24,
  color = '#FFD700',
  editable = false,
  maxRating = 10,
  showLabel = false,
  accessibilityLabel = 'Rating stars',
}: RatingStarsProps) {
  const starsToShow = maxRating === 5 ? 5 : Math.min(Math.ceil(rating), 5);
  const adjustedRating = maxRating === 5 ? rating : rating / 2;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= adjustedRating;
      const halfFilled = i === Math.ceil(adjustedRating) && adjustedRating % 1 !== 0;
      
      const iconName = filled ? 'star' : halfFilled ? 'star-half' : 'star-outline';
      
      if (editable && onRatingChange) {
        stars.push(
          <TouchableOpacity
            key={i}
            onPress={() => onRatingChange(maxRating === 5 ? i : i * 2)}
            accessibilityLabel={`Rate ${i} stars`}
            accessibilityRole="button"
          >
            <Ionicons name={iconName} size={size} color={color} />
          </TouchableOpacity>
        );
      } else {
        stars.push(
          <Ionicons key={i} name={iconName} size={size} color={color} />
        );
      }
    }
    return stars;
  };

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: size * 0.6 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
