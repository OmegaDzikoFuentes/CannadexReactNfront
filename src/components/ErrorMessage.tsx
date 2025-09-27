// src/components/ErrorMessage.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ErrorType = 'network' | 'validation' | 'auth' | 'general';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  style?: any;
}

export default function ErrorMessage({ 
  message,
  type = 'general',
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  style
}: ErrorMessageProps) {
  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case 'network': return 'wifi-off';
      case 'validation': return 'alert-circle';
      case 'auth': return 'lock-closed';
      default: return 'warning';
    }
  };

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case 'network': return '#FF9500';
      case 'validation': return '#f44336';
      case 'auth': return '#9C27B0';
      default: return '#f44336';
    }
  };

  const errorColor = getErrorColor(type);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Ionicons 
          name={getErrorIcon(type)} 
          size={24} 
          color={errorColor} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: errorColor }]}>
          {message}
        </Text>
      </View>
      
      {(onRetry || onDismiss) && (
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity 
              style={[styles.button, styles.retryButton, { borderColor: errorColor }]}
              onPress={onRetry}
            >
              <Text style={[styles.buttonText, { color: errorColor }]}>
                {retryText}
              </Text>
            </TouchableOpacity>
          )}
          
          {onDismiss && (
            <TouchableOpacity 
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>
                {dismissText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}