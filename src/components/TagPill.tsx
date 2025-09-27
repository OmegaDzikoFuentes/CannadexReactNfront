// src/components/TagPill.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type TagVariant = 'effect' | 'flavor' | 'category' | 'medical' | 'default';
type TagSize = 'small' | 'medium' | 'large';

interface TagPillProps {
  text: string;
  variant?: TagVariant;
  size?: TagSize;
  customColor?: string;
  onPress?: () => void;
}

export default function TagPill({ 
  text, 
  variant = 'default', 
  size = 'medium',
  customColor,
  onPress 
}: TagPillProps) {
  const getVariantStyles = (variant: TagVariant) => {
    switch (variant) {
      case 'effect':
        return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      case 'flavor':
        return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
      case 'category':
        return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'medical':
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666' };
    }
  };

  const getSizeStyles = (size: TagSize) => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 };
      case 'large':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 };
      default:
        return { paddingHorizontal: 12, paddingVertical: 4, fontSize: 12 };
    }
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  
  const containerStyle = [
    styles.pill,
    { backgroundColor: customColor || variantStyles.backgroundColor },
    { 
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical 
    }
  ];

  const textStyle = [
    styles.text,
    { 
      color: variantStyles.color,
      fontSize: sizeStyles.fontSize 
    }
  ];

  return (
    <View style={containerStyle}>
      <Text style={textStyle} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}