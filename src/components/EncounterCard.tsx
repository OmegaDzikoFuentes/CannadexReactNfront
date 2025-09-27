// src/components/EncounterCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import TagPill from './TagPill';

interface EncounterCardProps {
  encounter: {
    id: number;
    strain: {
      name: string;
      category: string;
      image_url?: string;
    };
    user?: {
      username: string;
      first_name: string;
      last_name: string;
    };
    overall_rating: number;
    taste_rating: number;
    smell_rating: number;
    potency_rating: number;
    encountered_at: string;
    location_name?: string;
    effects_experienced?: string[];
    description?: string;
    card_image_url?: string;
    public: boolean;
  };
  onPress?: () => void;
  showUser?: boolean;
}

export default function EncounterCard({ encounter, onPress, showUser = false }: EncounterCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Encounter with ${encounter.strain.name}`}
    >
      {encounter.card_image_url ? (
        <Image source={{ uri: encounter.card_image_url }} style={styles.cardImage} />
      ) : (
        <View style={styles.header}>
          <View style={styles.strainInfo}>
            {encounter.strain.image_url ? (
              <Image source={{ uri: encounter.strain.image_url }} style={styles.strainImage} />
            ) : (
              <View style={[styles.strainImage, styles.imagePlaceholder]}>
                <Ionicons name="leaf" size={20} color="#4CAF50" />
              </View>
            )}
            <View style={styles.strainDetails}>
              <Text style={styles.strainName}>{encounter.strain.name}</Text>
              <TagPill text={encounter.strain.category} variant="category" size="small" />
            </View>
          </View>
          
          {showUser && encounter.user && (
            <View style={styles.userInfo}>
              <Text style={styles.username}>@{encounter.user.username}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.ratings}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Overall</Text>
            <RatingStars rating={encounter.overall_rating} size={14} maxRating={10} showLabel />
          </View>
          
          <View style={styles.detailedRatings}>
            <View style={styles.miniRating}>
              <Ionicons name="restaurant" size={12} color="#666" />
              <Text style={styles.miniRatingText}>{encounter.taste_rating}</Text>
            </View>
            <View style={styles.miniRating}>
              <Ionicons name="rose" size={12} color="#666" />
              <Text style={styles.miniRatingText}>{encounter.smell_rating}</Text>
            </View>
            <View style={styles.miniRating}>
              <Ionicons name="flash" size={12} color="#666" />
              <Text style={styles.miniRatingText}>{encounter.potency_rating}</Text>
            </View>
          </View>
        </View>

        {encounter.effects_experienced && encounter.effects_experienced.length > 0 && (
          <View style={styles.effects}>
            {encounter.effects_experienced.slice(0, 3).map((effect, index) => (
              <TagPill key={index} text={effect} variant="effect" size="small" />
            ))}
            {encounter.effects_experienced.length > 3 && (
              <Text style={styles.moreEffects}>
                +{encounter.effects_experienced.length - 3}
              </Text>
            )}
          </View>
        )}

        {encounter.description && (
          <Text style={styles.description} numberOfLines={2}>
            {encounter.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.metadata}>
            <Text style={styles.date}>{formatDate(encounter.encountered_at)}</Text>
            {encounter.location_name && (
              <>
                <Text style={styles.separator}>•</Text>
                <Ionicons name="location" size={12} color="#999" />
                <Text style={styles.location}>{encounter.location_name}</Text>
              </>
            )}
          </View>
          
          <View style={styles.privacy}>
            <Ionicons 
              name={encounter.public ? "globe" : "lock-closed"} 
              size={12} 
              color="#999" 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
