// src/screens/main/ExploreScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Explore'>;

interface Strain {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  category_name: string;
  average_overall_rating: number;
  encounters_count: number;
  effects: string[];
  flavors: string[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  level: number;
  total_encounters: number;
  city?: string;
  state?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  strains_count: number;
}

export default function ExploreScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'strains' | 'users' | 'categories'>('strains');
  
  const [popularStrains, setPopularStrains] = useState<Strain[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadExploreData = useCallback(async () => {
    try {
      // Load popular strains
      // const strainsResponse = await api.get('/api/v1/strains/popular');
      // setPopularStrains(strainsResponse.data);

      // Load nearby users
      // const usersResponse = await api.get('/api/v1/users/nearby');
      // setNearbyUsers(usersResponse.data);

      // Load categories
      // const categoriesResponse = await api.get('/api/v1/categories');
      // setCategories(categoriesResponse.data);

      // Mock data for development
      setPopularStrains([
        {
          id: 1,
          name: 'Blue Dream',
          description: 'A sativa-dominant hybrid with sweet berry aroma',
          category_name: 'Hybrid',
          average_overall_rating: 8.5,
          encounters_count: 1250,
          effects: ['Creative', 'Euphoric', 'Relaxed'],
          flavors: ['Berry', 'Sweet', 'Vanilla'],
        },
        {
          id: 2,
          name: 'OG Kush',
          description: 'Classic indica with earthy pine flavors',
          category_name: 'Indica',
          average_overall_rating: 9.0,
          encounters_count: 980,
          effects: ['Relaxed', 'Happy', 'Sleepy'],
          flavors: ['Earthy', 'Pine', 'Wood'],
        },
        {
          id: 3,
          name: 'Green Crack',
          description: 'Energizing sativa perfect for daytime use',
          category_name: 'Sativa',
          average_overall_rating: 8.2,
          encounters_count: 750,
          effects: ['Energetic', 'Focused', 'Creative'],
          flavors: ['Citrus', 'Sweet', 'Tropical'],
        },
      ]);

      setNearbyUsers([
        { id: 1, first_name: 'Sarah', last_name: 'Johnson', username: 'sarah_j', level: 5, total_encounters: 25, city: 'Troy', state: 'Ohio' },
        { id: 2, first_name: 'Mike', last_name: 'Chen', username: 'mike_c', level: 8, total_encounters: 45, city: 'Dayton', state: 'Ohio' },
        { id: 3, first_name: 'Alex', last_name: 'Smith', username: 'alex_smith', level: 3, total_encounters: 15, city: 'Cincinnati', state: 'Ohio' },
      ]);

      setCategories([
        { id: 1, name: 'Indica', description: 'Relaxing strains perfect for evening use', strains_count: 245 },
        { id: 2, name: 'Sativa', description: 'Energizing strains great for daytime', strains_count: 198 },
        { id: 3, name: 'Hybrid', description: 'Balanced effects from both indica and sativa', strains_count: 312 },
        { id: 4, name: 'CBD', description: 'High CBD content for therapeutic benefits', strains_count: 89 },
      ]);
    } catch (error) {
      console.error('Failed to load explore data:', error);
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // const response = await api.get('/api/v1/search', {
      //   params: { q: query, type: activeTab }
      // });
      // setSearchResults(response.data);

      // Mock search results
      if (activeTab === 'strains') {
        const filteredStrains = popularStrains.filter(strain =>
          strain.name.toLowerCase().includes(query.toLowerCase()) ||
          strain.effects.some(effect => effect.toLowerCase().includes(query.toLowerCase())) ||
          strain.flavors.some(flavor => flavor.toLowerCase().includes(query.toLowerCase()))
        );
        setSearchResults(filteredStrains);
      } else if (activeTab === 'users') {
        const filteredUsers = nearbyUsers.filter(user =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredUsers);
      } else {
        const filteredCategories = categories.filter(category =>
          category.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredCategories);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [activeTab, popularStrains, nearbyUsers, categories]);

  useEffect(() => {
    loadExploreData();
  }, [loadExploreData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExploreData();
    setRefreshing(false);
  }, [loadExploreData]);

  const renderStrainCard = (strain: Strain) => (
    <TouchableOpacity
      key={strain.id}
      style={styles.strainCard}
      onPress={() => navigation.navigate('StrainDetail', { strainId: strain.id })}
    >
      <View style={styles.strainImagePlaceholder}>
        <Text style={styles.strainImageText}>🌿</Text>
      </View>
      <View style={styles.strainInfo}>
        <Text style={styles.strainName}>{strain.name}</Text>
        <Text style={styles.strainCategory}>{strain.category_name}</Text>
        <Text style={styles.strainDescription} numberOfLines={2}>
          {strain.description}
        </Text>
        <View style={styles.strainStats}>
          <Text style={styles.strainRating}>★ {strain.average_overall_rating}</Text>
          <Text style={styles.strainEncounters}>{strain.encounters_count} encounters</Text>
        </View>
        <View style={styles.tagsContainer}>
          {strain.effects.slice(0, 2).map((effect, index) => (
            <View key={index} style={styles.effectTag}>
              <Text style={styles.tagText}>{effect}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserCard = (user: User) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>
          {user.first_name[0]}{user.last_name[0]}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userUsername}>@{user.username}</Text>
        <Text style={styles.userLocation}>{user.city}, {user.state}</Text>
        <View style={styles.userStats}>
          <Text style={styles.userLevel}>Level {user.level}</Text>
          <Text style={styles.userEncounters}>{user.total_encounters} encounters</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Catalog', { categoryId: category.id })}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>
          {category.name === 'Indica' ? '🌙' : 
           category.name === 'Sativa' ? '☀️' : 
           category.name === 'Hybrid' ? '⚖️' : '💊'}
        </Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {category.description}
        </Text>
        <Text style={styles.categoryCount}>{category.strains_count} strains</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (searchQuery.trim()) {
      if (isSearching) {
        return (
          <View style={styles.centerContent}>
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        );
      }

      if (searchResults.length === 0) {
        return (
          <View style={styles.centerContent}>
            <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          </View>
        );
      }

      return (
        <View style={styles.searchResults}>
          {activeTab === 'strains' && searchResults.map(renderStrainCard)}
          {activeTab === 'users' && searchResults.map(renderUserCard)}
          {activeTab === 'categories' && searchResults.map(renderCategoryCard)}
        </View>
      );
    }

    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'strains' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Strains</Text>
              <Text style={styles.sectionSubtitle}>Most encountered by the community</Text>
              {popularStrains.map(renderStrainCard)}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Category</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryGridItem}
                    onPress={() => navigation.navigate('Catalog', { categoryId: category.id })}
                  >
                    <Text style={styles.categoryGridIcon}>
                      {category.name === 'Indica' ? '🌙' : 
                       category.name === 'Sativa' ? '☀️' : 
                       category.name === 'Hybrid' ? '⚖️' : '💊'}
                    </Text>
                    <Text style={styles.categoryGridName}>{category.name}</Text>
                    <Text style={styles.categoryGridCount}>{category.strains_count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Cannabis Enthusiasts</Text>
              <Text style={styles.sectionSubtitle}>Connect with others in your area</Text>
              {nearbyUsers.map(renderUserCard)}
            </View>
            
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={() => {/* Navigate to user discovery */}}
            >
              <Text style={styles.discoverButtonText}>Discover More Users</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'categories' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strain Categories</Text>
            <Text style={styles.sectionSubtitle}>Explore different types of cannabis</Text>
            {categories.map(renderCategoryCard)}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover strains, users, and more</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'strains' && styles.activeTab]}
          onPress={() => setActiveTab('strains')}
        >
          <Text style={[styles.tabText, activeTab === 'strains' && styles.activeTabText]}>
            Strains
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  strainCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strainImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  strainImageText: {
    fontSize: 24,
  },
  strainInfo: {
    flex: 1,
  },
  strainName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  strainCategory: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  strainDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  strainStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  strainRating: {
    fontSize: 12,
    color: '#FF9500',
    marginRight: 12,
  },
  strainEncounters: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  effectTag: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#2e7d32',
  },
  userCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  userStats: {
    flexDirection: 'row',
  },
  userLevel: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 12,
  },
  userEncounters: {
    fontSize: 12,
    color: '#666',
  },
  categoryCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  categoryCount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryGridItem: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryGridIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryGridName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryGridCount: {
    fontSize: 12,
    color: '#4CAF50',
  },
  discoverButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchingText: {
    fontSize: 16,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  searchResults: {
    padding: 20,
  },
});