// src/components/UserAvatar.tsx
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserAvatarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
  size?: number;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  fallbackIcon?: string;
}

export default function UserAvatar({ 
  user, 
  size = 40, 
  showOnlineStatus = false, 
  isOnline = false,
  fallbackIcon = "person"
}: UserAvatarProps) {
  const getInitials = () => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 }
  ];

  const statusStyle = [
    styles.onlineStatus,
    { 
      width: size * 0.3, 
      height: size * 0.3, 
      borderRadius: size * 0.15,
      borderWidth: size * 0.05,
      bottom: -size * 0.02,
      right: -size * 0.02
    }
  ];

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        {user?.avatar_url ? (
          <Image 
            source={{ uri: user.avatar_url }} 
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            {user ? (
              <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
                {getInitials()}
              </Text>
            ) : (
              <Ionicons name={fallbackIcon} size={size * 0.6} color="#666" />
            )}
          </View>
        )}
      </View>
      
      {showOnlineStatus && (
        <View style={[statusStyle, { backgroundColor: isOnline ? '#4CAF50' : '#ccc' }]} />
      )}
    </View>
  );
}
