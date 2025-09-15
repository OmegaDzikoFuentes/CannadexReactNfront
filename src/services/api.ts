// src/services/api.ts
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, AuthResponse, User, Strain, Encounter, Battle, Achievement, Category, Friendship } from '../types';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'  // Development
  : 'https://your-api-domain.com/api/v1';  // Production

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Authentication
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  static async register(userData: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    date_of_birth: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  }

  static async logout(): Promise<void> {
    await apiClient.delete('/auth/logout');
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  }

  static async verifyAge(dateOfBirth: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ age_verified: boolean }>> = await apiClient.post('/auth/verify_age', {
      date_of_birth: dateOfBirth,
    });
    
    return response.data.data?.age_verified || false;
  }

  // User Management
  static async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/users/me');
    return response.data.data!;
  }

  static async updateUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.patch('/users/me', userData);
    
    if (response.data.success && response.data.data) {
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error('Update failed');
  }

  static async updateFCMToken(fcmToken: string): Promise<void> {
    await apiClient.patch('/users/me', { fcm_token: fcmToken });
  }

  static async getUserProfile(userId: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get(`/users/${userId}/profile`);
    return response.data.data!;
  }

  static async searchUsers(query: string): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.get('/users/search', {
      params: { q: query },
    });
    return response.data.data || [];
  }

  static async getNearbyUsers(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.get('/users/nearby');
    return response.data.data || [];
  }

  // Strains
  static async getStrains(params?: {
    category_id?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Strain[]> {
    const response: AxiosResponse<ApiResponse<Strain[]>> = await apiClient.get('/strains', { params });
    return response.data.data || [];
  }

  static async getStrain(id: number): Promise<Strain> {
    const response: AxiosResponse<ApiResponse<Strain>> = await apiClient.get(`/strains/${id}`);
    return response.data.data!;
  }

  static async getPopularStrains(): Promise<Strain[]> {
    const response: AxiosResponse<ApiResponse<Strain[]>> = await apiClient.get('/strains/popular');
    return response.data.data || [];
  }

  static async searchStrains(query: string): Promise<Strain[]> {
    const response: AxiosResponse<ApiResponse<Strain[]>> = await apiClient.get('/strains/search', {
      params: { q: query },
    });
    return response.data.data || [];
  }

  static async getSimilarStrains(strainId: number): Promise<Strain[]> {
    const response: AxiosResponse<ApiResponse<Strain[]>> = await apiClient.get(`/strains/${strainId}/similar`);
    return response.data.data || [];
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<Category[]>> = await apiClient.get('/categories');
    return response.data.data || [];
  }

  // Encounters
  static async createEncounter(encounterData: {
    strain_id: number;
    taste_rating: number;
    smell_rating: number;
    texture_rating: number;
    overall_rating: number;
    potency_rating: number;
    description?: string;
    experience?: string;
    effects_experienced: string[];
    location_name?: string;
    source_type?: string;
    source_name?: string;
    price_paid?: number;
    amount_purchased?: string;
    public?: boolean;
  }): Promise<Encounter> {
    const response: AxiosResponse<ApiResponse<Encounter>> = await apiClient.post('/encounters', encounterData);
    return response.data.data!;
  }

  static async getEncounters(params?: {
    user_id?: number;
    strain_id?: number;
    page?: number;
    limit?: number;
  }): Promise<Encounter[]> {
    const response: AxiosResponse<ApiResponse<Encounter[]>> = await apiClient.get('/encounters', { params });
    return response.data.data || [];
  }

  static async getPublicFeed(): Promise<Encounter[]> {
    const response: AxiosResponse<ApiResponse<Encounter[]>> = await apiClient.get('/encounters/public_feed');
    return response.data.data || [];
  }

  static async getFriendsFeed(): Promise<Encounter[]> {
    const response: AxiosResponse<ApiResponse<Encounter[]>> = await apiClient.get('/encounters/friends_feed');
    return response.data.data || [];
  }

  static async updateEncounter(id: number, data: Partial<Encounter>): Promise<Encounter> {
    const response: AxiosResponse<ApiResponse<Encounter>> = await apiClient.patch(`/encounters/${id}`, data);
    return response.data.data!;
  }

  static async deleteEncounter(id: number): Promise<void> {
    await apiClient.delete(`/encounters/${id}`);
  }

  // Battles
  static async createBattle(opponentId: number, strainIds: number[]): Promise<Battle> {
    const response: AxiosResponse<ApiResponse<Battle>> = await apiClient.post('/battles', {
      opponent_id: opponentId,
      strain_ids: strainIds,
    });
    return response.data.data!;
  }

  static async getBattles(status?: string): Promise<Battle[]> {
    const endpoint = status ? `/battles/${status}` : '/battles';
    const response: AxiosResponse<ApiResponse<Battle[]>> = await apiClient.get(endpoint);
    return response.data.data || [];
  }

  static async acceptBattle(battleId: number, strainIds: number[]): Promise<Battle> {
    const response: AxiosResponse<ApiResponse<Battle>> = await apiClient.post(`/battles/${battleId}/accept`, {
      strain_ids: strainIds,
    });
    return response.data.data!;
  }

  static async declineBattle(battleId: number): Promise<void> {
    await apiClient.post(`/battles/${battleId}/decline`);
  }

  // Friendships
  static async getFriends(): Promise<Friendship[]> {
    const response: AxiosResponse<ApiResponse<Friendship[]>> = await apiClient.get('/friendships');
    return response.data.data || [];
  }

  static async getFriendRequests(): Promise<Friendship[]> {
    const response: AxiosResponse<ApiResponse<Friendship[]>> = await apiClient.get('/friendships/requests');
    return response.data.data || [];
  }

  static async sendFriendRequest(userId: number): Promise<Friendship> {
    const response: AxiosResponse<ApiResponse<Friendship>> = await apiClient.post('/friendships', {
      friend_id: userId,
    });
    return response.data.data!;
  }

  static async acceptFriendRequest(friendshipId: number): Promise<Friendship> {
    const response: AxiosResponse<ApiResponse<Friendship>> = await apiClient.patch(`/friendships/${friendshipId}`, {
      status: 'accepted',
    });
    return response.data.data!;
  }

  static async rejectFriendRequest(friendshipId: number): Promise<void> {
    await apiClient.delete(`/friendships/${friendshipId}`);
  }

  // Achievements
  static async getAchievements(): Promise<Achievement[]> {
    const response: AxiosResponse<ApiResponse<Achievement[]>> = await apiClient.get('/achievements');
    return response.data.data || [];
  }

  static async claimAchievement(achievementId: number): Promise<Achievement> {
    const response: AxiosResponse<ApiResponse<Achievement>> = await apiClient.post(`/achievements/${achievementId}/claim`);
    return response.data.data!;
  }

  // Global Search
  static async globalSearch(query: string, type?: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/search', {
      params: { q: query, type },
    });
    return response.data.data;
  }

  // Stats
  static async getUserStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/stats/user');
    return response.data.data;
  }

  static async getCommunityStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/stats/community');
    return response.data.data;
  }
}

export { apiClient };
export default ApiService;