// src/components/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  total: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'none';
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  total,
  height = 8,
  color = '#4CAF50',
  backgroundColor = '#e0e0e0',
  showLabel = false,
  labelPosition = 'top',
  animated = false
}: ProgressBarProps) {
  const percentage = Math.min((progress / total) * 100, 100);
  
  return (
    <View style={styles.container}>
      {showLabel && labelPosition === 'top' && (
        <Text style={styles.label}>
          {progress} / {total} ({percentage.toFixed(0)}%)
        </Text>
      )}
      
      <View style={[styles.track, { height, backgroundColor }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${percentage}%`, 
              height, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      
      {showLabel && labelPosition === 'bottom' && (
        <Text style={styles.label}>
          {progress} / {total} ({percentage.toFixed(0)}%)
        </Text>
      )}
    </View>
  );
}
