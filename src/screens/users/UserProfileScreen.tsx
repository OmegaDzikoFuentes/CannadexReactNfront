// src/screens/users/UserProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'UserProfile'>;

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_image_url?: string;
  encounters_count: number;
  favorite_strains: string[];
  achievements_count: number;
}

interface UserEncounter {
  id: number;
  strain_name: string;
  overall_rating: number;
  encountered_at: string;
  card_image_url?: string;
}

export default function UserProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params || {};
  const currentUser = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [encounters, setEncounters] = useState<UserEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const id = userId || currentUser?.id;
    if (id) {
      loadProfile(id);
      loadEncounters(id);
      setIsOwnProfile(id === currentUser?.id);
    }
  }, [userId, currentUser]);

  const loadProfile = async (id: number) => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/users/${id}`);
      // setProfile(response.data);

      // Mock data
      setProfile({
        id,
        username: 'cannabis_connoisseur',
        first_name: 'John',
        last_name: 'Doe',
        bio: 'Passionate about exploring new strains and sharing experiences.',
        profile_image_url: null,
        encounters_count: 47,
        favorite_strains: ['Blue Dream', 'OG Kush', 'Sour Diesel'],
        achievements_count: 12,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadEncounters = async (id: number) => {
    try {
      // const response = await api.get(`/api/v1/users/${id}/encounters`);
      // setEncounters(response.data);

      // Mock data
      setEncounters([
        {
          id: 1,
          strain_name: 'Blue Dream',
          overall_rating: 8.5,
          encountered_at: '2025-09-20',
          card_image_url: null,
        },
        {
          id: 2,
          strain_name: 'OG Kush',
          overall_rating: 9.0,
          encountered_at: '2025-09-15',
          card_image_url: null,
        },
      ]);
    } catch (error) {
      console.error('Failed to load encounters:', error);
    }
  };

  const handleEditProfile = () => {
    // navigation.navigate('EditProfile');
  };

  const handleViewEncounter = (encounterId: number) => {
    navigation.navigate('EncounterDetail', { encounterId });
  };

  const renderEncounterItem = ({ item }: { item: UserEncounter }) => (
    <TouchableOpacity
      style={styles.encounterItem}
      onPress={() => handleViewEncounter(item.id)}
    >
      <View style={styles.encounterInfo}>
        <Text style={styles.encounterStrain}>{item.strain_name}</Text>
        <Text style={styles.encounterDate}>{new Date(item.encountered_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.encounterRating}>{item.overall_rating.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {profile.profile_image_url ? (
            <Image source={{ uri: profile.profile_image_url }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>👤</Text>
            </View>
          )}
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.fullName}>{profile.first_name} {profile.last_name}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.encounters_count}</Text>
            <Text style={styles.statLabel}>Encounters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.achievements_count}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.favorite_strains.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {isOwnProfile && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Encounters</Text>
          <FlatList
            data={encounters}
            renderItem={renderEncounterItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  fullName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  encounterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  encounterInfo: {
    flex: 1,
  },
  encounterStrain: {
    fontSize: 16,
    fontWeight: '600',
  },
  encounterDate: {
    fontSize: 14,
    color: '#666',
  },
  encounterRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});