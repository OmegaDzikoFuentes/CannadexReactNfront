// src/screens/strains/StrainDetailScreen.tsx
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { fetchStrain } from '../../store/slices/strainsSlice';

type Props = NativeStackScreenProps<MainStackParamList, 'StrainDetail'>;

interface StrainStats {
  total_encounters: number;
  average_overall_rating: number;
  average_taste_rating: number;
  average_smell_rating: number;
  average_texture_rating: number;
  average_potency_rating: number;
  most_common_effects: string[];
  most_common_flavors: string[];
}

export default function StrainDetailScreen({ navigation, route }: Props) {
  const { strainId } = route.params;
  const dispatch = useAppDispatch();
  const { currentStrain, isLoading } = useAppSelector(state => state.strains);
  const { user } = useAppSelector(state => state.auth);
  
  const [communityStats, setCommunityStats] = useState<StrainStats | null>(null);
  const [hasUserEncounter, setHasUserEncounter] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStrain(strainId));
    loadCommunityStats();
    checkUserEncounter();
  }, [strainId, dispatch]);

  const loadCommunityStats = async () => {
    try {
      setStatsLoading(true);
      // const response = await api.get(`/api/v1/strains/${strainId}/community_stats`);
      // setCommunityStats(response.data);
      
      // Mock data for development
      const mockStats: StrainStats = {
        total_encounters: 47,
        average_overall_rating: 8.2,
        average_taste_rating: 7.8,
        average_smell_rating: 8.5,
        average_texture_rating: 8.0,
        average_potency_rating: 8.7,
        most_common_effects: ['Relaxed', 'Happy', 'Creative', 'Euphoric'],
        most_common_flavors: ['Sweet', 'Berry', 'Earthy', 'Citrus'],
      };
      setCommunityStats(mockStats);
    } catch (error) {
      console.error('Failed to load community stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const checkUserEncounter = async () => {
    try {
      // Check if user has already logged this strain
      // const response = await api.get(`/api/v1/users/${user?.id}/encounters`);
      // const hasEncounter = response.data.some((encounter: any) => encounter.strain_id === strainId);
      // setHasUserEncounter(hasEncounter);
      
      // Mock check
      setHasUserEncounter(false);
    } catch (error) {
      console.error('Failed to check user encounter:', error);
    }
  };

  const handleLogEncounter = () => {
    if (hasUserEncounter) {
      Alert.alert(
        'Already Logged',
        'You have already logged an encounter with this strain. Would you like to view it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Encounter', onPress: () => {
            // Navigate to user's encounter for this strain
            // navigation.navigate('EncounterDetail', { encounterId: userEncounterId });
          }},
        ]
      );
    } else {
      navigation.navigate('CreateEncounter', { preselectedStrainId: strainId });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return '#4CAF50';
    if (rating >= 7.0) return '#FF9500';
    return '#f44336';
  };

  const renderRatingBar = (label: string, value: number, maxValue: number = 10) => {
    const percentage = (value / maxValue) * 100;
    return (
      <View style={styles.ratingBarContainer}>
        <View style={styles.ratingBarHeader}>
          <Text style={styles.ratingBarLabel}>{label}</Text>
          <Text style={[styles.ratingBarValue, { color: getRatingColor(value) }]}>
            {value.toFixed(1)}
          </Text>
        </View>
        <View style={styles.ratingBarTrack}>
          <View 
            style={[
              styles.ratingBarFill, 
              { width: `${percentage}%`, backgroundColor: getRatingColor(value) }
            ]} 
          />
        </View>
      </View>
    );
  };

  if (isLoading && !currentStrain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading strain details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentStrain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Strain not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchStrain(strainId))}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          {currentStrain.image_url ? (
            <Image source={{ uri: currentStrain.image_url }} style={styles.headerImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderImageText}>🌿</Text>
            </View>
          )}
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            {currentStrain.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Strain Info */}
          <View style={styles.strainHeader}>
            <Text style={styles.strainName}>{currentStrain.name}</Text>
            <Text style={styles.strainCategory}>{currentStrain.category?.name}</Text>
            {currentStrain.genetics && (
              <Text style={styles.genetics}>{currentStrain.genetics}</Text>
            )}
          </View>

          {/* THC/CBD Info */}
          {(currentStrain.thc_percentage || currentStrain.cbd_percentage) && (
            <View style={styles.cannabinoidContainer}>
              {currentStrain.thc_percentage && (
                <View style={styles.cannabinoidItem}>
                  <Text style={styles.cannabinoidLabel}>THC</Text>
                  <Text style={styles.cannabinoidValue}>{currentStrain.thc_percentage}%</Text>
                </View>
              )}
              {currentStrain.cbd_percentage && (
                <View style={styles.cannabinoidItem}>
                  <Text style={styles.cannabinoidLabel}>CBD</Text>
                  <Text style={styles.cannabinoidValue}>{currentStrain.cbd_percentage}%</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {currentStrain.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{currentStrain.description}</Text>
            </View>
          )}

          {/* Effects */}
          {currentStrain.effects && currentStrain.effects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Effects</Text>
              <View style={styles.tagsContainer}>
                {currentStrain.effects.map((effect, index) => (
                  <View key={index} style={styles.effectTag}>
                    <Text style={styles.effectText}>{effect}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Flavors */}
          {currentStrain.flavors && currentStrain.flavors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Flavors</Text>
              <View style={styles.tagsContainer}>
                {currentStrain.flavors.map((flavor, index) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorText}>{flavor}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Community Stats */}
          {communityStats && !statsLoading && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Community Ratings</Text>
              <Text style={styles.statsSubtitle}>
                Based on {communityStats.total_encounters} encounters
              </Text>
              
              <View style={styles.ratingsContainer}>
                {renderRatingBar('Overall', communityStats.average_overall_rating)}
                {renderRatingBar('Taste', communityStats.average_taste_rating)}
                {renderRatingBar('Smell', communityStats.average_smell_rating)}
                {renderRatingBar('Texture', communityStats.average_texture_rating)}
                {renderRatingBar('Potency', communityStats.average_potency_rating)}
              </View>

              {communityStats.most_common_effects.length > 0 && (
                <View style={styles.communityEffectsContainer}>
                  <Text style={styles.communityEffectsTitle}>Most Reported Effects</Text>
                  <View style={styles.tagsContainer}>
                    {communityStats.most_common_effects.slice(0, 4).map((effect, index) => (
                      <View key={index} style={styles.communityEffectTag}>
                        <Text style={styles.communityEffectText}>{effect}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {statsLoading && (
            <View style={styles.statsLoadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.statsLoadingText}>Loading community stats...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleLogEncounter}
        >
          <Text style={styles.actionButtonText}>
            {hasUserEncounter ? 'View My Encounter' : 'Log Encounter'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerImageContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImageText: {
    fontSize: 64,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  strainHeader: {
    marginBottom: 20,
  },
  strainName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  strainCategory: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  genetics: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  cannabinoidContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  cannabinoidItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  cannabinoidLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cannabinoidValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  effectTag: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  effectText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  flavorTag: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  flavorText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '500',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  ratingsContainer: {
    marginBottom: 20,
  },
  ratingBarContainer: {
    marginBottom: 12,
  },
  ratingBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  ratingBarValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingBarTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  communityEffectsContainer: {
    marginTop: 16,
  },
  communityEffectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  communityEffectTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  communityEffectText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  statsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statsLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});