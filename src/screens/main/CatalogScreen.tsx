// src/screens/main/CatalogScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Catalog'>;

interface Encounter {
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
  effects_experienced: string[];
  location_name?: string;
  card_image_url?: string;
  public: boolean;
}

type SortOption = 'recent' | 'rating' | 'alphabetical';
type FilterOption = 'all' | 'public' | 'private';

export default function CatalogScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [filteredEncounters, setFilteredEncounters] = useState<Encounter[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const loadUserEncounters = useCallback(async () => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/users/${user?.id}/encounters`);
      // setEncounters(response.data);

      // Mock data for development
      const mockEncounters: Encounter[] = [
        {
          id: 1,
          strain_name: 'Blue Dream',
          strain_id: 1,
          overall_rating: 8.5,
          taste_rating: 8.0,
          smell_rating: 9.0,
          texture_rating: 8.5,
          potency_rating: 8.0,
          encountered_at: '2025-01-20T10:30:00Z',
          description: 'Amazing hybrid with sweet berry flavors. Perfect for creative work.',
          effects_experienced: ['Creative', 'Euphoric', 'Relaxed'],
          location_name: 'Dayton, OH',
          public: true,
        },
        {
          id: 2,
          strain_name: 'OG Kush',
          strain_id: 2,
          overall_rating: 9.0,
          taste_rating: 9.5,
          smell_rating: 9.0,
          texture_rating: 8.5,
          potency_rating: 9.5,
          encountered_at: '2025-01-19T15:45:00Z',
          description: 'Classic indica with incredible potency and flavor.',
          effects_experienced: ['Relaxed', 'Happy', 'Sleepy'],
          location_name: 'Cincinnati, OH',
          public: true,
        },
        {
          id: 3,
          strain_name: 'Green Crack',
          strain_id: 3,
          overall_rating: 7.8,
          taste_rating: 7.5,
          smell_rating: 8.0,
          texture_rating: 8.0,
          potency_rating: 8.5,
          encountered_at: '2025-01-18T20:15:00Z',
          description: 'Great energizing sativa for morning use.',
          effects_experienced: ['Energetic', 'Focused', 'Creative'],
          location_name: 'Troy, OH',
          public: false,
        },
        {
          id: 4,
          strain_name: 'Wedding Cake',
          strain_id: 4,
          overall_rating: 8.8,
          taste_rating: 9.0,
          smell_rating: 8.5,
          texture_rating: 8.8,
          potency_rating: 8.5,
          encountered_at: '2025-01-17T14:20:00Z',
          description: 'Delicious hybrid with vanilla and earthy notes.',
          effects_experienced: ['Relaxed', 'Euphoric', 'Hungry'],
          location_name: 'Columbus, OH',
          public: true,
        },
        {
          id: 5,
          strain_name: 'Sour Diesel',
          strain_id: 5,
          overall_rating: 8.2,
          taste_rating: 7.8,
          smell_rating: 8.5,
          texture_rating: 8.0,
          potency_rating: 8.8,
          encountered_at: '2025-01-16T11:10:00Z',
          description: 'Pungent sativa with diesel aroma and uplifting effects.',
          effects_experienced: ['Energetic', 'Uplifted', 'Talkative'],
          public: true,
        },
      ];
      
      setEncounters(mockEncounters);
    } catch (error) {
      console.error('Failed to load encounters:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...encounters];

    // Apply filters
    if (filterBy === 'public') {
      filtered = filtered.filter(encounter => encounter.public);
    } else if (filterBy === 'private') {
      filtered = filtered.filter(encounter => !encounter.public);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.encountered_at).getTime() - new Date(a.encountered_at).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.strain_name.localeCompare(b.strain_name));
        break;
    }

    setFilteredEncounters(filtered);
  }, [encounters, sortBy, filterBy]);

  useEffect(() => {
    loadUserEncounters();
  }, [loadUserEncounters]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserEncounters();
    setRefreshing(false);
  }, [loadUserEncounters]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return '#4CAF50';
    if (rating >= 7.0) return '#FF9500';
    return '#f44336';
  };

  const renderEncounterCard = ({ item }: { item: Encounter }) => (
    <TouchableOpacity
      style={styles.encounterCard}
      onPress={() => navigation.navigate('EncounterDetail', { encounterId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.strainImagePlaceholder}>
          <Text style={styles.strainImageText}>🌿</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.strainName}>{item.strain_name}</Text>
          <Text style={styles.encounterDate}>{formatDate(item.encountered_at)}</Text>
          {item.location_name && (
            <Text style={styles.locationText}>📍 {item.location_name}</Text>
          )}
        </View>
        <View style={styles.privacyIndicator}>
          <Text style={[styles.privacyText, { color: item.public ? '#4CAF50' : '#666' }]}>
            {item.public ? '🌍' : '🔒'}
          </Text>
        </View>
      </View>

      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Overall</Text>
          <Text style={[styles.ratingValue, { color: getRatingColor(item.overall_rating) }]}>
            {item.overall_rating}
          </Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Taste</Text>
          <Text style={styles.ratingValue}>{item.taste_rating}</Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Smell</Text>
          <Text style={styles.ratingValue}>{item.smell_rating}</Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Potency</Text>
          <Text style={styles.ratingValue}>{item.potency_rating}</Text>
        </View>
      </View>

      {item.effects_experienced.length > 0 && (
        <View style={styles.effectsContainer}>
          {item.effects_experienced.slice(0, 3).map((effect, index) => (
            <View key={index} style={styles.effectTag}>
              <Text style={styles.effectText}>{effect}</Text>
            </View>
          ))}
          {item.effects_experienced.length > 3 && (
            <Text style={styles.moreEffects}>+{item.effects_experienced.length - 3} more</Text>
          )}
        </View>
      )}

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📝</Text>
      <Text style={styles.emptyStateTitle}>No Encounters Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Start building your cannabis catalog by logging your first strain encounter!
      </Text>
      <TouchableOpacity
        style={styles.addEncounterButton}
        onPress={() => navigation.navigate('CreateEncounter')}
      >
        <Text style={styles.addEncounterButtonText}>Log Your First Encounter</Text>
      </TouchableOpacity>
    </View>
  );

  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort By</Text>
          {(['recent', 'rating', 'alphabetical'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.modalOption, sortBy === option && styles.modalOptionSelected]}
              onPress={() => {
                setSortBy(option);
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, sortBy === option && styles.modalOptionTextSelected]}>
                {option === 'recent' ? 'Most Recent' :
                 option === 'rating' ? 'Highest Rated' : 'Alphabetical'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowSortModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter By</Text>
          {(['all', 'public', 'private'] as FilterOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.modalOption, filterBy === option && styles.modalOptionSelected]}
              onPress={() => {
                setFilterBy(option);
                setShowFilterModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, filterBy === option && styles.modalOptionTextSelected]}>
                {option === 'all' ? 'All Encounters' :
                 option === 'public' ? 'Public Only' : 'Private Only'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Catalog</Text>
        <Text style={styles.headerSubtitle}>
          {filteredEncounters.length} encounter{filteredEncounters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {encounters.length > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.controlButtonText}>
              Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'rating' ? 'Rating' : 'A-Z'}
            </Text>
            <Text style={styles.controlButtonIcon}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.controlButtonText}>
              Filter: {filterBy === 'all' ? 'All' : filterBy === 'public' ? 'Public' : 'Private'}
            </Text>
            <Text style={styles.controlButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredEncounters}
        renderItem={renderEncounterCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={encounters.length === 0 ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {encounters.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEncounter')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      <SortModal />
      <FilterModal />
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
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  controlButtonIcon: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  encounterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strainImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  strainImageText: {
    fontSize: 20,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  strainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  encounterDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#999',
  },
  privacyIndicator: {
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 16,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  effectTag: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  effectText: {
    fontSize: 11,
    color: '#2e7d32',
  },
  moreEffects: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  addEncounterButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  addEncounterButtonText: {
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
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#e9f7ef',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalCancel: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
});