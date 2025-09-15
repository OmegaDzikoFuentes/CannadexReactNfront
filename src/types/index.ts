// src/types/index.ts
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    bio?: string;
    level: number;
    experience_points: number;
    total_encounters: number;
    battles_won: number;
    battles_lost: number;
    age_verified: boolean;
    profile_public: boolean;
    location_sharing_enabled: boolean;
    city?: string;
    state?: string;
    country?: string;
    created_at: string;
  }
  
  export interface Strain {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    category_id: number;
    genetics?: string;
    thc_percentage?: number;
    cbd_percentage?: number;
    effects: string[];
    flavors: string[];
    medical_uses: string[];
    encounters_count: number;
    average_overall_rating: number;
    verified: boolean;
    data_source: string;
  }
  
  export interface Encounter {
    id: number;
    user_id: number;
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
    location_name?: string;
    source_type?: string;
    source_name?: string;
    price_paid?: number;
    amount_purchased?: string;
    public: boolean;
    card_image_url?: string;
  }
  
  export interface Battle {
    id: number;
    challenger_id: number;
    opponent_id: number;
    challenger: User;
    opponent: User;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    winner_id?: number;
    challenger_score: number;
    opponent_score: number;
    battle_results?: any;
    battled_at?: string;
    expires_at: string;
    battle_strains: BattleStrain[];
  }
  
  export interface BattleStrain {
    id: number;
    battle_id: number;
    user_id: number;
    strain_id: number;
    strain: Strain;
    position: number;
  }
  
  export interface Achievement {
    id: number;
    user_id: number;
    achievement_type: string;
    title: string;
    description?: string;
    progress: number;
    goal: number;
    reward_description?: string;
    xp_reward: number;
    badge_image_url?: string;
    is_unlocked: boolean;
    is_claimed: boolean;
    unlocked_at?: string;
    claimed_at?: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    category_type: string;
    active: boolean;
    strains_count: number;
  }
  
  export interface Friendship {
    id: number;
    user_id: number;
    friend_id: number;
    user: User;
    friend: User;
    status: 'pending' | 'accepted' | 'declined';
    requested_at: string;
    accepted_at?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
  }