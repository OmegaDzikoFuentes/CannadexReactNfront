// src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Strain, 
  Encounter, 
  Battle, 
  Achievement, 
  Category, 
  Friendship,
  PaginatedResponse 
} from '../types';

// Configuration
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api/v1'
    : 'https://your-api-domain.com/api/v1',
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Custom error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor with retry logic and network check
apiClient.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new NetworkError('No internet connection');
    }

    // Add auth token
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (__DEV__ && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new NetworkError('Unable to connect to server');
    }

    // Handle different HTTP status codes
    switch (error.response?.status) {
      case 401:
        await handleUnauthorized();
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
        
      case 403:
        throw new ApiError('Access forbidden', 403, 'FORBIDDEN');
        
      case 404:
        throw new ApiError('Resource not found', 404, 'NOT_FOUND');
        
      case 422:
        const validationData = error.response.data as any;
        throw new ValidationError(
          validationData.message || 'Validation failed',
          validationData.errors || {}
        );
        
      case 429:
        throw new ApiError('Too many requests', 429, 'RATE_LIMITED');
        
      case 500:
        throw new ApiError('Server error', 500, 'SERVER_ERROR');
        
      default:
        // Implement retry logic for server errors (5xx)
        if (error.response.status >= 500 && 
            !originalRequest._retry && 
            originalRequest._retryCount < API_CONFIG.retryAttempts) {
          
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          await new Promise(resolve => 
            setTimeout(resolve, API_CONFIG.retryDelay * originalRequest._retryCount)
          );
          
          return apiClient(originalRequest);
        }
        
        throw new ApiError(
          error.response?.data?.message || 'An unexpected error occurred',
          error.response?.status,
          'UNKNOWN_ERROR'
        );
    }
  }
);

// Handle token expiration
async function handleUnauthorized(): Promise<void> {
  await AsyncStorage.multiRemove(['auth_token', 'user_data', 'refresh_token']);
  // Note: You'll need to implement navigation service or use a global event
  // to redirect to login screen from here
}

// Generic API response handler
async function handleApiResponse<T>(
  request: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> {
  try {
    const response = await request();
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError(
      response.data.message || 'Request failed',
      response.status,
      'API_ERROR'
    );
  } catch (error) {
    if (error instanceof ApiError || error instanceof NetworkError || error instanceof ValidationError) {
      throw error;
    }
    throw new ApiError('Unexpected error occurred');
  }
}

export class ApiService {
  // Authentication
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await handleApiResponse(() =>
      apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
    );
    
    const { user, token, refresh_token } = response;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    if (refresh_token) {
      await AsyncStorage.setItem('refresh_token', refresh_token);
    }
    
    return response;
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
    const response = await handleApiResponse(() =>
      apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    );
    
    const { user, token, refresh_token } = response;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    if (refresh_token) {
      await AsyncStorage.setItem('refresh_token', refresh_token);
    }
    
    return response;
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.delete('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'refresh_token']);
    }
  }

  static async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    const response = await handleApiResponse(() =>
      apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', {
        refresh_token: refreshToken
      })
    );

    await AsyncStorage.setItem('auth_token', response.token);
    return response.token;
  }

  static async forgotPassword(email: string): Promise<void> {
    await handleApiResponse(() =>
      apiClient.post<ApiResponse<void>>('/auth/forgot_password', { email })
    );
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await handleApiResponse(() =>
      apiClient.post<ApiResponse<void>>('/auth/reset_password', { token, password })
    );
  }

  static async verifyAge(dateOfBirth: string): Promise<boolean> {
    const response = await handleApiResponse(() =>
      apiClient.post<ApiResponse<{ age_verified: boolean }>>('/auth/verify_age', {
        date_of_birth: dateOfBirth
      })
    );
    return response.age_verified;
  }

  // User Management
  static async getCurrentUser(): Promise<User> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<User>>('/users/me')
    );
  }

  static async updateUser(userData: Partial<User>): Promise<User> {
    const response = await handleApiResponse(() =>
      apiClient.patch<ApiResponse<User>>('/users/me', userData)
    );
    
    // Update cached user data
    await AsyncStorage.setItem('user_data', JSON.stringify(response));
    return response;
  }

  static async updateUserLocation(latitude: number, longitude: number): Promise<void> {
    await handleApiResponse(() =>
      apiClient.patch<ApiResponse<void>>('/users/me', {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      })
    );
  }

  static async getUserProfile(userId: number): Promise<User> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<User>>(`/users/${userId}/profile`)
    );
  }

  static async searchUsers(query: string, filters?: {
    location_radius?: number;
    min_level?: number;
  }): Promise<User[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<User[]>>('/users/search', {
        params: { q: query, ...filters }
      })
    );
  }

  static async getNearbyUsers(radius: number = 50): Promise<User[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<User[]>>('/users/nearby', {
        params: { radius }
      })
    );
  }

  // Strains with enhanced filtering
  static async getStrains(params?: {
    category_id?: number;
    search?: string;
    effects?: string[];
    flavors?: string[];
    thc_min?: number;
    thc_max?: number;
    cbd_min?: number;
    cbd_max?: number;
    verified_only?: boolean;
    sort_by?: 'name' | 'rating' | 'encounters' | 'created_at';
    sort_order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Strain>> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Strain>>>('/strains', { params })
    );
  }

  static async getStrain(id: number): Promise<Strain> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Strain>>(`/strains/${id}`)
    );
  }

  static async getStrainStats(id: number): Promise<{
    total_encounters: number;
    average_ratings: {
      overall: number;
      taste: number;
      smell: number;
      texture: number;
      potency: number;
    };
    common_effects: Array<{ name: string; count: number; percentage: number }>;
    recent_encounters: Encounter[];
  }> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<any>>(`/strains/${id}/community_stats`)
    );
  }

  static async getPopularStrains(timeframe: 'week' | 'month' | 'year' = 'month'): Promise<Strain[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Strain[]>>('/strains/popular', {
        params: { timeframe }
      })
    );
  }

  static async getRecentStrains(): Promise<Strain[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Strain[]>>('/strains/recently_added')
    );
  }

  static async getSimilarStrains(strainId: number): Promise<Strain[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Strain[]>>(`/strains/${strainId}/similar`)
    );
  }

  static async suggestStrain(strainData: {
    suggested_name: string;
    description?: string;
    genetics?: string;
    effects?: string[];
    flavors?: string[];
  }): Promise<void> {
    await handleApiResponse(() =>
      apiClient.post<ApiResponse<void>>('/strain_suggestions', strainData)
    );
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Category[]>>('/categories')
    );
  }

  // Enhanced Encounters
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
    location?: { latitude: number; longitude: number };
    location_name?: string;
    source_type?: string;
    source_name?: string;
    price_paid?: number;
    amount_purchased?: string;
    public?: boolean;
    friends_only?: boolean;
  }): Promise<Encounter> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Encounter>>('/encounters', encounterData)
    );
  }

  static async getEncounters(params?: {
    user_id?: number;
    strain_id?: number;
    public_only?: boolean;
    friends_only?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Encounter>> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Encounter>>>('/encounters', { params })
    );
  }

  static async getEncounter(id: number): Promise<Encounter> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Encounter>>(`/encounters/${id}`)
    );
  }

  static async updateEncounter(id: number, data: Partial<Encounter>): Promise<Encounter> {
    return handleApiResponse(() =>
      apiClient.patch<ApiResponse<Encounter>>(`/encounters/${id}`, data)
    );
  }

  static async deleteEncounter(id: number): Promise<void> {
    await handleApiResponse(() =>
      apiClient.delete<ApiResponse<void>>(`/encounters/${id}`)
    );
  }

  static async getPublicFeed(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Encounter>> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Encounter>>>('/encounters/public_feed', {
        params: { page, limit }
      })
    );
  }

  static async getFriendsFeed(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Encounter>> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Encounter>>>('/encounters/friends_feed', {
        params: { page, limit }
      })
    );
  }

  static async getNearbyEncounters(radius: number = 50): Promise<Encounter[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Encounter[]>>('/encounters/nearby', {
        params: { radius }
      })
    );
  }

  static async regenerateEncounterCard(id: number): Promise<Encounter> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Encounter>>(`/encounters/${id}/regenerate_card`)
    );
  }

  static async toggleEncounterPrivacy(id: number): Promise<Encounter> {
    return handleApiResponse(() =>
      apiClient.patch<ApiResponse<Encounter>>(`/encounters/${id}/toggle_privacy`)
    );
  }

  // Enhanced Battles
  static async createBattle(data: {
    opponent_id: number;
    strains: number[];
  }): Promise<Battle> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Battle>>('/battles', data)
    );
  }

  static async getBattles(status?: 'pending' | 'active' | 'completed'): Promise<Battle[]> {
    const endpoint = status ? `/battles/${status}` : '/battles';
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Battle[]>>(endpoint)
    );
  }

  static async getBattle(id: number): Promise<Battle> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Battle>>(`/battles/${id}`)
    );
  }

  static async getPendingBattles(): Promise<Battle[]> {
    return this.getBattles('pending');
  }

  static async getActiveBattles(): Promise<Battle[]> {
    return this.getBattles('active');
  }

  static async getCompletedBattles(): Promise<Battle[]> {
    return this.getBattles('completed');
  }

  static async getBattleHistory(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Battle>> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Battle>>>('/battles/history', {
        params: { page, limit }
      })
    );
  }

  static async acceptBattle(id: number): Promise<Battle> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Battle>>(`/battles/${id}/accept`)
    );
  }

  static async declineBattle(id: number): Promise<Battle> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Battle>>(`/battles/${id}/decline`)
    );
  }

  static async cancelBattle(id: number): Promise<void> {
    await handleApiResponse(() =>
      apiClient.delete<ApiResponse<void>>(`/battles/${id}/cancel`)
    );
  }

  // Friendships
  static async getFriends(): Promise<Friendship[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Friendship[]>>('/friendships')
    );
  }

  static async getFriendRequests(): Promise<Friendship[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Friendship[]>>('/friendships/requests')
    );
  }

  static async getPendingRequests(): Promise<Friendship[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Friendship[]>>('/friendships/pending')
    );
  }

  static async sendFriendRequest(userId: number): Promise<Friendship> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Friendship>>('/friendships', {
        friend_id: userId
      })
    );
  }

  static async acceptFriendRequest(friendshipId: number): Promise<Friendship> {
    return handleApiResponse(() =>
      apiClient.patch<ApiResponse<Friendship>>(`/friendships/${friendshipId}`, {
        status: 'accepted'
      })
    );
  }

  static async rejectFriendRequest(friendshipId: number): Promise<void> {
    await handleApiResponse(() =>
      apiClient.delete<ApiResponse<void>>(`/friendships/${friendshipId}`)
    );
  }

  static async removeFriend(friendshipId: number): Promise<void> {
    await handleApiResponse(() =>
      apiClient.delete<ApiResponse<void>>(`/friendships/${friendshipId}`)
    );
  }

  // Achievements
  static async getAchievements(): Promise<Achievement[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Achievement[]>>('/achievements')
    );
  }

  static async getUnlockedAchievements(): Promise<Achievement[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Achievement[]>>('/achievements/unlocked')
    );
  }

  static async getAvailableAchievements(): Promise<Achievement[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Achievement[]>>('/achievements/available')
    );
  }

  static async claimAchievement(achievementId: number): Promise<Achievement> {
    return handleApiResponse(() =>
      apiClient.post<ApiResponse<Achievement>>(`/achievements/${achievementId}/claim`)
    );
  }

  // Enhanced Search & Recommendations
  static async globalSearch(query: string, filters?: {
    type?: 'strains' | 'users' | 'all';
    category_id?: number;
    verified_only?: boolean;
  }): Promise<{
    strains: Strain[];
    users: User[];
    total_results: number;
  }> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<any>>('/search', {
        params: { q: query, ...filters }
      })
    );
  }

  static async getRecommendedStrains(params?: {
    based_on?: 'encounters' | 'favorites' | 'similar_users';
    limit?: number;
  }): Promise<Strain[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<Strain[]>>('/recommendations/strains', { params })
    );
  }

  static async getRecommendedUsers(params?: {
    based_on?: 'location' | 'preferences' | 'mutual_friends';
    limit?: number;
  }): Promise<User[]> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<User[]>>('/recommendations/users', { params })
    );
  }

  // Analytics & Stats
  static async getUserStats(): Promise<{
    total_encounters: number;
    total_battles: number;
    battles_won: number;
    battles_lost: number;
    favorite_strain?: Strain;
    favorite_effects: string[];
    monthly_encounters: Array<{ month: string; count: number }>;
    rating_breakdown: Record<string, number>;
  }> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<any>>('/stats/user')
    );
  }

  static async getCommunityStats(): Promise<{
    total_users: number;
    total_strains: number;
    total_encounters: number;
    most_popular_strains: Strain[];
    trending_effects: string[];
    recent_activities: any[];
  }> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<any>>('/stats/community')
    );
  }

  // File uploads with progress tracking
  static async uploadEncounterPhoto(
    file: any, 
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    return handleApiResponse(() =>
      apiClient.post<ApiResponse<{ url: string }>>('/uploads/encounter_photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      })
    );
  }

  static async uploadAvatar(
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return handleApiResponse(() =>
      apiClient.post<ApiResponse<{ url: string }>>('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      })
    );
  }

  // Utility methods
  static async checkApiHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; version: string }> {
    return handleApiResponse(() =>
      apiClient.get<ApiResponse<any>>('/health')
    );
  }

  static async reportBug(data: {
    title: string;
    description: string;
    steps_to_reproduce?: string;
    device_info?: any;
    logs?: string;
  }): Promise<void> {
    await handleApiResponse(() =>
      apiClient.post<ApiResponse<void>>('/support/bug_report', data)
    );
  }

  // Cache management
  static async clearCache(): Promise<void> {
    const cacheKeys = [
      'cached_strains',
      'cached_encounters',
      'cached_friends',
      'cached_achievements'
    ];
    await AsyncStorage.multiRemove(cacheKeys);
  }
}

// Export error types and client for external use
export { apiClient, NetworkError, ValidationError };
export default ApiService;