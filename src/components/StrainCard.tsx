// src/components/StrainCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import TagPill from './TagPill';



interface StrainCardProps {
  strain: {
    id: number;
    name: string;
    category: string;
    image_url?: string;
    average_overall_rating: number;
    encounters_count: number;
    effects?: string[];
    thc_percentage?: number;
    verified?: boolean;
  };
  onPress?: () => void;
  compact?: boolean;
}

export default function StrainCard({ strain, onPress, compact = false }: StrainCardProps) {
  const cardStyle = compact ? styles.compactCard : styles.card;
  const imageStyle = compact ? styles.compactImage : styles.image;

  return (
    <TouchableOpacity 
      style={cardStyle} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${strain.name} strain card`}
    >
      <View style={styles.imageContainer}>
        {strain.image_url ? (
          <Image source={{ uri: strain.image_url }} style={imageStyle} />
        ) : (
          <View style={[imageStyle, styles.imagePlaceholder]}>
            <Ionicons name="leaf" size={compact ? 20 : 32} color="#4CAF50" />
          </View>
        )}
        {strain.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{strain.name}</Text>
          <TagPill text={strain.category} variant="category" size="small" />
        </View>

        {!compact && (
          <View style={styles.details}>
            <View style={styles.rating}>
              <RatingStars 
                rating={strain.average_overall_rating} 
                size={14} 
                maxRating={5}
                showLabel 
              />
              <Text style={styles.encounters}>
                ({strain.encounters_count} encounters)
              </Text>
            </View>

            {strain.thc_percentage && (
              <Text style={styles.thc}>THC: {strain.thc_percentage}%</Text>
            )}

            {strain.effects && strain.effects.length > 0 && (
              <View style={styles.effects}>
                {strain.effects.slice(0, 2).map((effect, index) => (
                  <TagPill 
                    key={index} 
                    text={effect} 
                    variant="effect" 
                    size="small" 
                  />
                ))}
                {strain.effects.length > 2 && (
                  <Text style={styles.moreEffects}>
                    +{strain.effects.length - 2} more
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {compact && (
          <View style={styles.compactInfo}>
            <RatingStars rating={strain.average_overall_rating} size={12} maxRating={5} />
            <Text style={styles.compactEncounters}>
              {strain.encounters_count} encounters
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}