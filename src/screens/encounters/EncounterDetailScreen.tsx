// src/screens/encounters/EncounterDetailScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'EncounterDetail'>;

interface DetailedEncounter {
  id: number;
  strain_name: string;
  strain_id: number;
  overall_rating: number;
  taste_rating: number;
  smell_rating: number;
  texture_rating: number;
  potency_rating: number;
  encountered_at: string;
  description?: string;
  experience?: string;
  effects_experienced: string[];
  location_name?: string;
  source_type?: string;
  source_name?: string;
  price_paid?: number;
  amount_purchased?: string;
  card_image_url?: string;
  public: boolean;
  friends_only: boolean;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export default function EncounterDetailScreen({ navigation, route }: Props) {
  const { encounterId } = route.params;
  const { user } = useAppSelector(state => state.auth);
  
  const [encounter, setEncounter] = useState<DetailedEncounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  const loadEncounter = async () => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/encounters/${encounterId}`);
      // setEncounter(response.data);
      // setIsOwner(response.data.user.id === user?.id);
      
      // Mock data for development
      const mockEncounter: DetailedEncounter = {
        id: encounterId,
        strain_name: 'Blue Dream',
        strain_id: 1,
        overall_rating: 8.5,
        taste_rating: 8.0,
        smell_rating: 9.0,
        texture_rating: 8.5,
        potency_rating: 8.0,
        encountered_at: '2025-01-20T10:30:00Z',
        description: 'Amazing hybrid with sweet berry flavors. Perfect for creative work and evening relaxation. The taste was incredible with hints of blueberry and vanilla.',
        experience: 'Had this during a creative session and it was perfect. Started with a nice head high that evolved into full-body relaxation. No anxiety or paranoia, just pure bliss. Definitely one of my favorites now.',
        effects_experienced: ['Creative', 'Euphoric', 'Relaxed', 'Happy', 'Focused'],
        location_name: 'Dayton, OH',
        source_type: 'Dispensary',
        source_name: 'Green Leaf Wellness',
        price_paid: 45.00,
        amount_purchased: '3.5g',
        card_image_url: null,
        public: true,
        friends_only: false,
        user: {
          id: user?.id || 1,
          username: 'cannabis_connoisseur',
          first_name: 'John',
          last_name: 'Doe',
        },
      };
      
      setEncounter(mockEncounter);
      setIsOwner(mockEncounter.user.id === user?.id);
    } catch (error) {
      console.error('Failed to load encounter:', error);
      Alert.alert('Error', 'Failed to load encounter details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (encounter) {
      navigation.navigate('CreateEncounter', { encounterId: encounter.id });
    }
  };

  const handleTogglePrivacy = async () => {
    if (!encounter) return;
    
    try {
      // await api.patch(`/api/v1/encounters/${encounter.id}/toggle_privacy`);
      setEncounter(prev => prev ? { ...prev, public: !prev.public } : null);
      Alert.alert('Success', `Encounter is now ${encounter.public ? 'private' : 'public'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Encounter',
      'Are you sure you want to delete this encounter? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await api.delete(`/api/v1/encounters/${encounterId}`);
              Alert.alert('Success', 'Encounter deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete encounter');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!encounter) return;
    
    try {
      await Share.share({
        message: `Check out my ${encounter.strain_name} encounter! Overall rating: ${encounter.overall_rating}/10\n\n${encounter.description}`,
        title: `${encounter.strain_name} Encounter`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRegenerateCard = async () => {
    if (!encounter) return;
    
    try {
      // await api.post(`/api/v1/encounters/${encounter.id}/regenerate_card`);
      Alert.alert('Success', 'Encounter card will be regenerated shortly');
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate card');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return '#4CAF50';
    if (rating >= 7.0) return '#FF9500';
    return '#f44336';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading encounter...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!encounter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Encounter not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadEncounter}
          >
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
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          {isOwner && (
            <TouchableOpacity onPress={() => {}} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Strain Header */}
        <View style={styles.strainHeader}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('StrainDetail', { strainId: encounter.strain_id })}
            style={styles.strainButton}
          >
            <View style={styles.strainImagePlaceholder}>
              <Text style={styles.strainImageText}>🌿</Text>
            </View>
            <View style={styles.strainInfo}>
              <Text style={styles.strainName}>{encounter.strain_name}</Text>
              <Text style={styles.viewStrainText}>View strain details →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {!isOwner && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Reviewed by {encounter.user.first_name} {encounter.user.last_name} (@{encounter.user.username})
            </Text>
          </View>
        )}

        {/* Date & Privacy */}
        <View style={styles.metaInfo}>
          <Text style={styles.dateText}>{formatDate(encounter.encountered_at)}</Text>
          <View style={styles.privacyBadge}>
            <Text style={styles.privacyText}>
              {encounter.public ? '🌍 Public' : '🔒 Private'}
            </Text>
          </View>
        </View>

        {/* Location & Source Info */}
        <View style={styles.sourceInfo}>
          {encounter.location_name && (
            <Text style={styles.sourceText}>📍 {encounter.location_name}</Text>
          )}
          {encounter.source_type && encounter.source_name && (
            <Text style={styles.sourceText}>
              🏪 {encounter.source_name} ({encounter.source_type})
            </Text>
          )}
          {encounter.price_paid && encounter.amount_purchased && (
            <Text style={styles.sourceText}>
              💰 ${encounter.price_paid} for {encounter.amount_purchased}
            </Text>
          )}
        </View>

        {/* Ratings */}
        <View style={styles.ratingsContainer}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          <View style={styles.ratingsGrid}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Overall</Text>
              <Text style={[styles.ratingValue, { color: getRatingColor(encounter.overall_rating) }]}>
                {encounter.overall_rating}
              </Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Taste</Text>
              <Text style={styles.ratingValue}>{encounter.taste_rating}</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Smell</Text>
              <Text style={styles.ratingValue}>{encounter.smell_rating}</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Texture</Text>
              <Text style={styles.ratingValue}>{encounter.texture_rating}</Text>
            </View>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Potency</Text>
              <Text style={styles.ratingValue}>{encounter.potency_rating}</Text>
            </View>
          </View>
        </View>

        {/* Effects */}
        {encounter.effects_experienced.length > 0 && (
          <View style={styles.effectsContainer}>
            <Text style={styles.sectionTitle}>Effects Experienced</Text>
            <View style={styles.effectsGrid}>
              {encounter.effects_experienced.map((effect, index) => (
                <View key={index} style={styles.effectTag}>
                  <Text style={styles.effectText}>{effect}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {encounter.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{encounter.description}</Text>
          </View>
        )}

        {/* Experience */}
        {encounter.experience && (
          <View style={styles.experienceContainer}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.experienceText}>{encounter.experience}</Text>
          </View>
        )}

        {/* Encounter Card */}
        {encounter.card_image_url && (
          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>Encounter Card</Text>
            <Image 
              source={{ uri: encounter.card_image_url }} 
              style={styles.encounterCard}
              resizeMode="cover"
            />
          </View>
        )}

        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.primaryAction} onPress={handleEdit}>
              <Text style={styles.primaryActionText}>Edit Encounter</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryAction} onPress={handleTogglePrivacy}>
                <Text style={styles.secondaryActionText}>
                  Make {encounter.public ? 'Private' : 'Public'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryAction} onPress={handleRegenerateCard}>
                <Text style={styles.secondaryActionText}>Regenerate Card</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.secondaryAction, styles.deleteAction]} onPress={handleDelete}>
                <Text style={[styles.secondaryActionText, styles.deleteActionText]}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#666',
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
  strainHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  strainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  strainImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  strainImageText: {
    fontSize: 20,
  },
  strainInfo: {
    flex: 1,
  },
  strainName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  viewStrainText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  userInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  privacyBadge: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  sourceInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ratingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  effectsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  effectTag: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  effectText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  experienceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  experienceText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  encounterCard: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  ownerActions: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryAction: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActions: {
    gap: 8,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteAction: {
    backgroundColor: '#ffebee',
  },
  deleteActionText: {
    color: '#f44336',
  },
});