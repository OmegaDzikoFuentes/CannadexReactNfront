// src/screens/friends/FriendsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector } from '../../hooks/redux';

interface Friend {
  id: number;
  username: string;
  full_name: string;
  profile_image_url?: string;
  status: 'friend' | 'pending' | 'requested';
}

export default function FriendsScreen({ navigation }: { navigation: any }) {
  const { user } = useAppSelector(state => state.auth);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      // const response = await api.get(`/api/v1/users/${user?.id}/friends`);
      // setFriends(response.data);

      // Mock data
      setFriends([
        {
          id: 2,
          username: 'weedlover42',
          full_name: 'Jane Smith',
          profile_image_url: null,
          status: 'friend',
        },
        {
          id: 3,
          username: 'highflyer',
          full_name: 'Mike Johnson',
          profile_image_url: null,
          status: 'pending',
        },
      ]);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // const response = await api.get(`/api/v1/users/search?query=${searchQuery}`);
      // Handle search results, perhaps navigate to search screen
      navigation.navigate('FriendSearch', { query: searchQuery });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      {item.profile_image_url ? (
        <Image source={{ uri: item.profile_image_url }} style={styles.friendImage} />
      ) : (
        <View style={styles.friendImagePlaceholder}>
          <Text style={styles.friendImageText}>👤</Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendUsername}>@{item.username}</Text>
        <Text style={styles.friendFullName}>{item.full_name}</Text>
      </View>
      <Text style={styles.friendStatus}>{item.status}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendImageText: {
    fontSize: 24,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendUsername: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendFullName: {
    fontSize: 14,
    color: '#666',
  },
  friendStatus: {
    fontSize: 12,
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
});