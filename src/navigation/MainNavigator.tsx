// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet, Platform } from 'react-native';

// Tab Screens
import HomeScreen from '../screens/main/HomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import CatalogScreen from '../screens/main/CatalogScreen';
import BattlesScreen from '../screens/main/BattlesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail Screens
import StrainDetailScreen from '../screens/strains/StrainDetailScreen';
import EncounterDetailScreen from '../screens/encounters/EncounterDetailScreen';
import CreateEncounterScreen from '../screens/encounters/CreateEncounterScreen';
import BattleDetailScreen from '../screens/battles/BattleDetailScreen';
import CreateBattleScreen from '../screens/battles/CreateBattleScreen';
import UserProfileScreen from '../screens/users/UserProfileScreen';
import AchievementsScreen from '../screens/achievements/AchievementsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  CatalogTab: undefined;
  BattlesTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  StrainDetail: { strainId: number };
  EncounterDetail: { encounterId: number };
  CreateEncounter: { strainId?: number };
  BattleDetail: { battleId: number };
  CreateBattle: { opponentId?: number };
  UserProfile: { userId: number };
  Achievements: undefined;
  Settings: undefined;
  Friends: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ExploreTab':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'CatalogTab':
              iconName = focused ? 'book-open' : 'book-open-outline';
              break;
            case 'BattlesTab':
              iconName = focused ? 'sword-cross' : 'sword';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          ...styles.tabBar,
          display: 'flex',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreScreen} 
        options={{ title: 'Explore' }}
      />
      <Tab.Screen 
        name="CatalogTab" 
        component={CatalogScreen} 
        options={{ title: 'My Catalog' }}
      />
      <Tab.Screen 
        name="BattlesTab" 
        component={BattlesScreen} 
        options={{ title: 'Battles' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      
      {/* Detail Screens */}
      <Stack.Screen 
        name="StrainDetail" 
        component={StrainDetailScreen}
        options={{ 
          title: 'Strain Details',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="EncounterDetail" 
        component={EncounterDetailScreen}
        options={{ 
          title: 'Encounter Details',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="CreateEncounter" 
        component={CreateEncounterScreen}
        options={{ 
          title: 'Log New Encounter',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="BattleDetail" 
        component={BattleDetailScreen}
        options={{ 
          title: 'Battle Details',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="CreateBattle" 
        component={CreateBattleScreen}
        options={{ 
          title: 'Challenge Friend',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ 
          title: 'Profile',
          headerBackTitleVisible: false,
        }}
      />
      
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
      
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      
      <Stack.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{ title: 'Friends' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});