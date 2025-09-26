// src/screens/battles/CreateBattleScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateBattle'>;

interface Friend {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  battles_won: number;
  battles_lost: number;
  total_encounters: number;
}

interface UserStrain {
  id: number;
  name: string;
  category: string;
  overall_rating: number;
  encounters_count: number;
}

interface BattleForm {
  opponent_id: number | null;
  opponent_name: string;
  selected_strains: number[];
}

export default function CreateBattleScreen({ navigation, route }: Props) {
  const { preselectedOpponentId } = route.params || {};
  const { user } = useAppSelector(state => state.auth);
  
  const [form, setForm] = useState<BattleForm>({
    opponent_id: preselectedOpponentId || null,
    opponent_name: '',
    selected_strains: [],
  });

  const [friends, setFriends] = useState<Friend[]>([]);
  const [userStrains, setUserStrains] = useState<UserStrain[]>([]);
  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [showStrainPicker, setShowStrainPicker] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [strainSearch, setStrainSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFriends(),
        loadUserStrains(),
      ]);
      
      if (preselectedOpponentId) {
        const selectedFriend = friends.find(f => f.id === preselectedOpponentId);
        if (selectedFriend) {
          setForm(prev => ({
            ...prev,
            opponent_name: `${selectedFriend.first_name} ${selectedFriend.last_name}`,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load battle data');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      // const response = await api.get('/api/v1/friendships?status=accepted');
      // setFriends(response.data);
      
      // Mock data for development
      const mockFriends: Friend[] = [
        {
          id: 2,
          username: 'bud_master',
          first_name: 'Jane',
          last_name: 'Smith',
          battles_won: 12,
          battles_lost: 5,
          total_encounters: 34,
        },
        {
          id: 3,
          username: 'green_thumb',
          first_name: 'Mike',
          last_name: 'Johnson',
          battles_won: 8,
          battles_lost: 7,
          total_encounters: 28,
        },
        {
          id: 4,
          username: 'indica_queen',
          first_name: 'Sarah',
          last_name: 'Davis',
          battles_won: 15,
          battles_lost: 3,
          total_encounters: 45,
        },
        {
          id: 5,
          username: 'sativa_king',
          first_name: 'Chris',
          last_name: 'Wilson',
          battles_won: 10,
          battles_lost: 8,
          total_encounters: 31,
        },
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadUserStrains = async () => {
    try {
      // const response = await api.get(`/api/v1/users/${user?.id}/encounters`);
      // const strains = response.data.map(encounter => encounter.strain);
      // setUserStrains(strains);
      
      // Mock data for development
      const mockStrains: UserStrain[] = [
        {
          id: 1,
          name: 'Blue Dream',
          category: 'Hybrid',
          overall_rating: 8.5,
          encounters_count: 3,
        },
        {
          id: 2,
          name: 'OG Kush',
          category: 'Indica',
          overall_rating: 9.0,
          encounters_count: 2,
        },
        {
          id: 3,
          name: 'Sour Diesel',
          category: 'Sativa',
          overall_rating: 8.2,
          encounters_count: 1,
        },
        {
          id: 4,
          name: 'Wedding Cake',
          category: 'Hybrid',
          overall_rating: 8.8,
          encounters_count: 2,
        },
        {
          id: 5,
          name: 'Green Crack',
          category: 'Sativa',
          overall_rating: 7.8,
          encounters_count: 1,
        },
        {
          id: 6,
          name: 'Purple Haze',
          category: 'Sativa',
          overall_rating: 8.3,
          encounters_count: 1,
        },
      ];
      setUserStrains(mockStrains);
    } catch (error) {
      console.error('Failed to load user strains:', error);
    }
  };

  const selectOpponent = (friend: Friend) => {
    setForm(prev => ({
      ...prev,
      opponent_id: friend.id,
      opponent_name: `${friend.first_name} ${friend.last_name}`,
    }));
    setShowOpponentPicker(false);
    setFriendSearch('');
  };

  const toggleStrain = (strainId: number) => {
    setForm(prev => {
      const isSelected = prev.selected_strains.includes(strainId);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.selected_strains.filter(id => id !== strainId);
      } else {
        if (prev.selected_strains.length >= 3) {
          Alert.alert('Maximum Strains', 'You can only select up to 3 strains for battle');
          return prev;
        }
        newSelection = [...prev.selected_strains, strainId];
      }
      
      return { ...prev, selected_strains: newSelection };
    });
  };

  const validateForm = (): boolean => {
    if (!form.opponent_id) {
      Alert.alert('Error', 'Please select an opponent');
      return false;
    }
    if (form.selected_strains.length !== 3) {
      Alert.alert('Error', 'Please select exactly 3 strains for battle');
      return false;
    }
    return true;
  };

  const handleCreateBattle = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);
      
      const payload = {
        opponent_id: form.opponent_id,
        strain_ids: form.selected_strains,
      };

      // await api.post('/api/v1/battles', payload);
      
      Alert.alert(
        'Battle Challenge Sent!',
        `Your battle challenge has been sent to ${form.opponent_name}. They have 24 hours to accept.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create battle. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.first_name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    friend.last_name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    friend.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const filteredStrains = userStrains.filter(strain =>
    strain.name.toLowerCase().includes(strainSearch.toLowerCase())
  );

  const getSelectedStrainNames = () => {
    return form.selected_strains
      .map(id => userStrains.find(strain => strain.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const OpponentPickerModal = () => (
    <Modal
      visible={showOpponentPicker}
      animationType="slide"
      onRequestClose={() => setShowOpponentPicker(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowOpponentPicker(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Opponent</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            value={friendSearch}
            onChangeText={setFriendSearch}
            autoFocus
          />
        </View>
        
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendItem}
              onPress={() => selectOpponent(item)}
            >
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.friendUsername}>@{item.username}</Text>
                <Text style={styles.friendStats}>
                  {item.battles_won}W - {item.battles_lost}L • {item.total_encounters} encounters
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No friends found</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  const StrainPickerModal = () => (
    <Modal
      visible={showStrainPicker}
      animationType="slide"
      onRequestClose={() => setShowStrainPicker(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowStrainPicker(false)}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Strains ({form.selected_strains.length}/3)</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your strains..."
            value={strainSearch}
            onChangeText={setStrainSearch}
          />
        </View>
        
        <FlatList
          data={filteredStrains}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.strainItem,
                form.selected_strains.includes(item.id) && styles.strainItemSelected,
              ]}
              onPress={() => toggleStrain(item.id)}
            >
              <View style={styles.strainInfo}>
                <Text style={styles.strainName}>{item.name}</Text>
                <Text style={styles.strainCategory}>{item.category}</Text>
                <Text style={styles.strainRating}>
                  ⭐ {item.overall_rating}/10 • {item.encounters_count} encounter{item.encounters_count !== 1 ? 's' : ''}
                </Text>
              </View>
              {form.selected_strains.includes(item.id) && (
                <Text style={styles.strainCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {strainSearch ? 'No matching strains found' : 'No strains available'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                You need to log some encounters first to battle with your strains
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading battle setup...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Battle</Text>
        <TouchableOpacity
          onPress={handleCreateBattle}
          disabled={creating}
          style={[styles.createButton, creating && styles.createButtonDisabled]}
        >
          <Text style={[styles.createButtonText, creating && styles.createButtonTextDisabled]}>
            {creating ? 'Creating...' : 'Challenge'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Battle Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Battle Rules</Text>
          <Text style={styles.infoText}>
            • Select 3 of your best strains to battle{'\n'}
            • Your opponent will select 3 of their strains{'\n'}
            • Strains are compared across taste, smell, potency, and overall quality{'\n'}
            • Best 2 out of 3 rounds wins the battle{'\n'}
            • Battle expires in 24 hours if not accepted
          </Text>
        </View>

        {/* Opponent Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Opponent *</Text>
          <TouchableOpacity
            style={styles.opponentSelector}
            onPress={() => setShowOpponentPicker(true)}
          >
            <Text style={[styles.opponentSelectorText, !form.opponent_name && styles.placeholderText]}>
              {form.opponent_name || 'Choose a friend to battle...'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          {friends.length === 0 && (
            <View style={styles.noFriendsContainer}>
              <Text style={styles.noFriendsText}>No friends available for battles</Text>
              <TouchableOpacity
                style={styles.addFriendsButton}
                onPress={() => navigation.navigate('Friends')}
              >
                <Text style={styles.addFriendsButtonText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Strain Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Strains * (3 required)</Text>
          <TouchableOpacity
            style={styles.strainSelector}
            onPress={() => setShowStrainPicker(true)}
          >
            <Text style={[styles.strainSelectorText, form.selected_strains.length === 0 && styles.placeholderText]}>
              {form.selected_strains.length === 0 
                ? 'Choose 3 strains for battle...'
                : `${form.selected_strains.length} strain${form.selected_strains.length !== 1 ? 's' : ''} selected`
              }
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          {form.selected_strains.length > 0 && (
            <View style={styles.selectedStrainsContainer}>
              <Text style={styles.selectedStrainsTitle}>Selected Strains:</Text>
              {form.selected_strains.map(strainId => {
                const strain = userStrains.find(s => s.id === strainId);
                return strain ? (
                  <View key={strainId} style={styles.selectedStrainItem}>
                    <Text style={styles.selectedStrainName}>{strain.name}</Text>
                    <Text style={styles.selectedStrainRating}>⭐ {strain.overall_rating}/10</Text>
                  </View>
                ) : null;
              })}
            </View>
          )}
          
          {userStrains.length === 0 && (
            <View style={styles.noStrainsContainer}>
              <Text style={styles.noStrainsText}>No strains available for battles</Text>
              <Text style={styles.noStrainsSubtext}>
                You need to log some encounters first
              </Text>
              <TouchableOpacity
                style={styles.addEncounterButton}
                onPress={() => navigation.navigate('CreateEncounter')}
              >
                <Text style={styles.addEncounterButtonText}>Log First Encounter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Battle Preview */}
        {form.opponent_name && form.selected_strains.length === 3 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Battle Preview</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>
                You will challenge <Text style={styles.previewHighlight}>{form.opponent_name}</Text> with:
              </Text>
              <Text style={styles.previewStrains}>{getSelectedStrainNames()}</Text>
              <Text style={styles.previewNote}>
                They will have 24 hours to accept your challenge and select their strains.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <OpponentPickerModal />
      <StrainPickerModal />
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
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: '#999',
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
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  opponentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  opponentSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    fontSize: 18,
    color: '#666',
  },
  noFriendsContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  noFriendsText: {
    fontSize: 16,
    color: '#856404',
    marginBottom: 12,
    textAlign: 'center',
  },
  addFriendsButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  strainSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  strainSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectedStrainsContainer: {
    marginTop: 16,
  },
  selectedStrainsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedStrainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9f7ef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedStrainName: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  selectedStrainRating: {
    fontSize: 12,
    color: '#2e7d32',
  },
  noStrainsContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
  },
  noStrainsText: {
    fontSize: 16,
    color: '#721c24',
    marginBottom: 8,
    textAlign: 'center',
  },
  noStrainsSubtext: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 12,
    textAlign: 'center',
  },
  addEncounterButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addEncounterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: '#e9f7ef',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  previewContent: {
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  previewHighlight: {
    fontWeight: 'bold',
  },
  previewStrains: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  previewNote: {
    fontSize: 12,
    color: '#2e7d32',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalHeaderSpacer: {
    width: 50,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  friendItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  friendStats: {
    fontSize: 12,
    color: '#999',
  },
  strainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  strainItemSelected: {
    backgroundColor: '#e9f7ef',
  },
  strainInfo: {
    flex: 1,
  },
  strainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  strainCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  strainRating: {
    fontSize: 12,
    color: '#4CAF50',
  },
  strainCheckmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});