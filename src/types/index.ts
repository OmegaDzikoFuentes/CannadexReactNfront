// src/types/index.ts

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

// Authentication Types
export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  date_of_birth: string;
  phone?: string;
}

// User Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth: string;
  age_verified: boolean;
  age_verified_at?: string;
  profile_public: boolean;
  location_sharing_enabled: boolean;
  battle_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  friend_request_notifications: boolean;
  achievement_notifications: boolean;
  show_location_in_profile: boolean;
  discoverable_by_username: boolean;
  discoverable_by_location: boolean;
  total_encounters: number;
  battles_won: number;
  battles_lost: number;
  level: number;
  experience_points: number;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  is_online?: boolean;
  last_seen?: string;
  distance?: number; // For nearby users
}

export interface UserProfile extends User {
  recent_encounters: Encounter[];
  achievements: Achievement[];
  battle_stats: {
    total_battles: number;
    win_rate: number;
    favorite_opponent?: User;
  };
  favorite_strains: Strain[];
  friend_status?: 'none' | 'pending' | 'friends' | 'requested';
}

// Strain Types
export interface Strain {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category_id: number;
  category: Category;
  genetics?: string;
  thc_percentage?: number;
  cbd_percentage?: number;
  effects: string[];
  flavors: string[];
  medical_uses: string[];
  encounters_count: number;
  average_taste_rating: number;
  average_smell_rating: number;
  average_texture_rating: number;
  average_overall_rating: number;
  average_potency_rating: number;
  verified: boolean;
  data_source: 'user_contributed' | 'verified' | 'imported';
  created_at: string;
  updated_at: string;
  user_encounter?: Encounter; // User's encounter with this strain
  is_favorite?: boolean;
  community_stats?: {
    total_encounters: number;
    common_effects: Array<{ name: string; percentage: number }>;
    rating_distribution: Record<string, number>;
    recent_activity: number;
  };
}

export interface StrainFilters {
  category_id?: number;
  search?: string;
  effects?: string[];
  flavors?: string[];
  thc_min?: number;
  thc_max?: number;
  cbd_min?: number;
  cbd_max?: number;
  verified_only?: boolean;
  min_rating?: number;
  sort_by?: 'name' | 'rating' | 'encounters' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category_type: 'strain_type' | 'effect_category' | 'flavor_profile';
  active: boolean;
  strains_count: number;
  created_at: string;
  updated_at: string;
}

// Encounter Types
export interface Encounter {
  id: number;
  user_id: number;
  user?: User;
  strain_id: number;
  strain: Strain;
  encountered_at: string;
  taste_rating: number;
  smell_rating: number;
  texture_rating: number;
  overall_rating: number;
  potency_rating: number;
  description?: string;
  experience?: string;
  effects_experienced: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  location_name?: string;
  source_type?: 'dispensary' | 'delivery' | 'friend' | 'home_grown' | 'other';
  source_name?: string;
  price_paid?: number;
  amount_purchased?: string;
  public: boolean;
  friends_only: boolean;
  card_image_url?: string;
  card_generated: boolean;
  created_at: string;
  updated_at: string;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  distance?: number; // For nearby encounters
}

export interface CreateEncounterData {
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
}

// Battle Types
export interface Battle {
  id: number;
  challenger_id: number;
  challenger: User;
  opponent_id: number;
  opponent: User;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  winner_id?: number;
  winner?: User;
  challenger_score: number;
  opponent_score: number;
  battle_results?: {
    total_rounds: number;
    rounds_won: { challenger: number; opponent: number };
    decisive_factors: string[];
    notes?: string;
  };
  battled_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  challenger_strains: BattleStrain[];
  opponent_strains: BattleStrain[];
  rounds: BattleRound[];
  can_accept?: boolean;
  can_decline?: boolean;
  can_cancel?: boolean;
}

export interface BattleStrain {
  id: number;
  battle_id: number;
  user_id: number;
  strain_id: number;
  strain: Strain;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BattleRound {
  id: number;
  battle_id: number;
  round_number: number;
  challenger_strain_id: number;
  challenger_strain: Strain;
  opponent_strain_id: number;
  opponent_strain: Strain;
  winner_strain_id?: number;
  winner_strain?: Strain;
  round_results: {
    taste_score: { challenger: number; opponent: number };
    smell_score: { challenger: number; opponent: number };
    texture_score: { challenger: number; opponent: number };
    potency_score: { challenger: number; opponent: number };
    overall_score: { challenger: number; opponent: number };
    notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBattleData {
  opponent_id: number;
  strains: number[]; // Array of strain IDs
  message?: string;
}

// Friendship Types
export interface Friendship {
  id: number;
  user_id: number;
  user?: User;
  friend_id: number;
  friend: User;
  status: 'pending' | 'accepted' | 'blocked';
  requested_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  mutual_friends_count?: number;
  can_accept?: boolean;
  can_reject?: boolean;
}

// Achievement Types
export interface Achievement {
  id: number;
  user_id: number;
  achievement_type: 'encounters' | 'battles' | 'social' | 'exploration' | 'rating' | 'special';
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward_description?: string;
  xp_reward: number;
  badge_image_url?: string;
  is_unlocked: boolean;
  is_claimed: boolean;
  unlocked_at?: string;
  claimed_at?: string;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  category: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Activity Types
export interface Activity {
  id: number;
  user_id: number;
  user?: User;
  activity_type: 'encounter_created' | 'battle_won' | 'achievement_unlocked' | 'friend_added' | 'strain_rated';
  trackable_type: string;
  trackable_id: number;
  data?: any;
  public: boolean;
  created_at: string;
  updated_at: string;
}

// Search Types
export interface SearchResults {
  strains: Strain[];
  users: User[];
  encounters?: Encounter[];
  total_results: number;
  query: string;
  filters_applied: any;
}

export interface SearchFilters {
  type?: 'all' | 'strains' | 'users' | 'encounters';
  category_id?: number;
  location_radius?: number;
  verified_only?: boolean;
  min_rating?: number;
  effects?: string[];
  flavors?: string[];
}

// Stats Types
export interface UserStats {
  total_encounters: number;
  total_battles: number;
  battles_won: number;
  battles_lost: number;
  win_rate: number;
  favorite_strain?: Strain;
  favorite_effects: Array<{ name: string; count: number; percentage: number }>;
  monthly_encounters: Array<{ month: string; year: number; count: number }>;
  rating_breakdown: {
    taste: { average: number; distribution: Record<string, number> };
    smell: { average: number; distribution: Record<string, number> };
    texture: { average: number; distribution: Record<string, number> };
    potency: { average: number; distribution: Record<string, number> };
    overall: { average: number; distribution: Record<string, number> };
  };
  achievements_unlocked: number;
  achievements_claimed: number;
  level_progress: {
    current_level: number;
    current_xp: number;
    xp_to_next_level: number;
    next_level_at: number;
  };
  recent_activity: Activity[];
}

export interface CommunityStats {
  total_users: number;
  total_strains: number;
  total_encounters: number;
  total_battles: number;
  active_users_today: number;
  active_users_week: number;
  most_popular_strains: Array<{ strain: Strain; encounter_count: number }>;
  trending_effects: Array<{ name: string; growth_rate: number; usage_count: number }>;
  top_battlers: Array<{ user: User; wins: number; win_rate: number }>;
  recent_achievements: Array<{ user: User; achievement: Achievement }>;
  geographic_stats: {
    top_cities: Array<{ city: string; state: string; user_count: number }>;
    top_states: Array<{ state: string; user_count: number }>;
  };
  strain_insights: {
    most_reviewed: Strain;
    highest_rated: Strain;
    trending_up: Strain[];
    new_discoveries: Strain[];
  };
}

// Notification Types
export interface PushNotification {
  id: string;
  type: 'battle_request' | 'battle_result' | 'friend_request' | 'achievement_unlocked' | 'encounter_liked' | 'system';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// Error Types
export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: ValidationErrors;
}

// Form Types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
  validator?: (value: T) => string | undefined;
}

export interface FormState<T = Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Filter and Sort Types
export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'toggle';
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
}

// Component Props Types
export interface ListComponentProps<T> {
  data: T[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  refreshing?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

// Navigation Types
export interface ScreenProps<T = any> {
  navigation: any;
  route: {
    params?: T;
  };
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  user: UserState;
  strains: StrainsState;
  encounters: EncountersState;
  battles: BattlesState;
  achievements: AchievementsState;
  friends: FriendsState;
  notifications: NotificationsState;
  app: AppState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;
}

export interface UserState {
  profile: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  updateLoading: boolean;
}

export interface StrainsState {
  strains: Strain[];
  currentStrain: Strain | null;
  popularStrains: Strain[];
  recentStrains: Strain[];
  categories: Category[];
  searchResults: Strain[];
  filters: StrainFilters;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface EncountersState {
  encounters: Encounter[];
  publicFeed: Encounter[];
  friendsFeed: Encounter[];
  userEncounters: Encounter[];
  currentEncounter: Encounter | null;
  isLoading: boolean;
  error: string | null;
  createLoading: boolean;
  hasMore: boolean;
  page: number;
}

export interface BattlesState {
  battles: Battle[];
  pendingBattles: Battle[];
  activeBattles: Battle[];
  completedBattles: Battle[];
  currentBattle: Battle | null;
  isLoading: boolean;
  error: string | null;
  actionLoading: boolean;
}

export interface AchievementsState {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  availableAchievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  claimLoading: boolean;
}

export interface FriendsState {
  friends: Friendship[];
  friendRequests: Friendship[];
  pendingRequests: Friendship[];
  searchResults: User[];
  nearbyUsers: User[];
  isLoading: boolean;
  error: string | null;
  actionLoading: boolean;
}

export interface NotificationsState {
  notifications: PushNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  lastSync: number;
  syncInProgress: boolean;
  settings: {
    notifications: boolean;
    locationSharing: boolean;
    analytics: boolean;
    autoSync: boolean;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

// API Endpoint Types
export interface ApiEndpoints {
  // Auth
  LOGIN: '/auth/login';
  REGISTER: '/auth/register';
  LOGOUT: '/auth/logout';
  REFRESH: '/auth/refresh';
  FORGOT_PASSWORD: '/auth/forgot_password';
  RESET_PASSWORD: '/auth/reset_password';
  VERIFY_AGE: '/auth/verify_age';
  
  // Users
  USERS: '/users';
  USER_PROFILE: '/users/:id/profile';
  USER_ENCOUNTERS: '/users/:id/encounters';
  USER_BATTLES: '/users/:id/battles';
  USER_ACHIEVEMENTS: '/users/:id/achievements';
  NEARBY_USERS: '/users/nearby';
  SEARCH_USERS: '/users/search';
  
  // Strains
  STRAINS: '/strains';
  STRAIN_DETAIL: '/strains/:id';
  STRAIN_STATS: '/strains/:id/community_stats';
  STRAIN_SIMILAR: '/strains/:id/similar';
  POPULAR_STRAINS: '/strains/popular';
  RECENT_STRAINS: '/strains/recently_added';
  SEARCH_STRAINS: '/strains/search';
  STRAIN_SUGGESTIONS: '/strain_suggestions';
  
  // Categories
  CATEGORIES: '/categories';
  CATEGORY_DETAIL: '/categories/:id';
  
  // Encounters
  ENCOUNTERS: '/encounters';
  ENCOUNTER_DETAIL: '/encounters/:id';
  PUBLIC_FEED: '/encounters/public_feed';
  FRIENDS_FEED: '/encounters/friends_feed';
  NEARBY_ENCOUNTERS: '/encounters/nearby';
  REGENERATE_CARD: '/encounters/:id/regenerate_card';
  TOGGLE_PRIVACY: '/encounters/:id/toggle_privacy';
  
  // Battles
  BATTLES: '/battles';
  BATTLE_DETAIL: '/battles/:id';
  PENDING_BATTLES: '/battles/pending';
  ACTIVE_BATTLES: '/battles/active';
  COMPLETED_BATTLES: '/battles/completed';
  BATTLE_HISTORY: '/battles/history';
  ACCEPT_BATTLE: '/battles/:id/accept';
  DECLINE_BATTLE: '/battles/:id/decline';
  CANCEL_BATTLE: '/battles/:id/cancel';
  
  // Friendships
  FRIENDSHIPS: '/friendships';
  FRIEND_REQUESTS: '/friendships/requests';
  PENDING_REQUESTS: '/friendships/pending';
  
  // Achievements
  ACHIEVEMENTS: '/achievements';
  UNLOCKED_ACHIEVEMENTS: '/achievements/unlocked';
  AVAILABLE_ACHIEVEMENTS: '/achievements/available';
  CLAIM_ACHIEVEMENT: '/achievements/:id/claim';
  
  // Search & Recommendations
  GLOBAL_SEARCH: '/search';
  STRAIN_RECOMMENDATIONS: '/recommendations/strains';
  USER_RECOMMENDATIONS: '/recommendations/users';
  
  // Stats
  USER_STATS: '/stats/user';
  COMMUNITY_STATS: '/stats/community';
  
  // Uploads
  UPLOAD_ENCOUNTER_PHOTO: '/uploads/encounter_photos';
  UPLOAD_AVATAR: '/uploads/avatar';
  
  // Utility
  HEALTH_CHECK: '/health';
  BUG_REPORT: '/support/bug_report';
}

// Theme Types
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    h4: { fontSize: number; fontWeight: string; lineHeight: number };
    body1: { fontSize: number; fontWeight: string; lineHeight: number };
    body2: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
    overline: { fontSize: number; fontWeight: string; lineHeight: number };
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xl: number;
  };
  shadows: {
    small: any;
    medium: any;
    large: any;
  };
}

// Config Types
export interface AppConfig {
  API_BASE_URL: string;
  WEBSOCKET_URL: string;
  GOOGLE_MAPS_API_KEY: string;
  SENTRY_DSN?: string;
  ANALYTICS_TRACKING_ID?: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  VERSION: string;
  BUILD_NUMBER: string;
  FEATURES: {
    BATTLES_ENABLED: boolean;
    SOCIAL_FEATURES_ENABLED: boolean;
    LOCATION_FEATURES_ENABLED: boolean;
    PUSH_NOTIFICATIONS_ENABLED: boolean;
    ANALYTICS_ENABLED: boolean;
  };
}

// Hook Types
export interface UseApiHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export interface UsePaginationHook<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshing: boolean;
}

// Export commonly used type unions
export type BattleStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type ActivityType = 'encounter_created' | 'battle_won' | 'achievement_unlocked' | 'friend_added' | 'strain_rated';
export type NotificationType = 'battle_request' | 'battle_result' | 'friend_request' | 'achievement_unlocked' | 'encounter_liked' | 'system';
export type SourceType = 'dispensary' | 'delivery' | 'friend' | 'home_grown' | 'other';
export type AchievementType = 'encounters' | 'battles' | 'social' | 'exploration' | 'rating' | 'special';
export type CategoryType = 'strain_type' | 'effect_category' | 'flavor_profile';

// Default exports for commonly used interfaces
export default {
  User,
  Strain,
  Encounter,
  Battle,
  Achievement,
  Friendship,
  ApiResponse,
  PaginatedResponse,
};