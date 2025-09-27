// src/components/CustomButton.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle
}: CustomButtonProps) {
  const getVariantStyles = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: '#4CAF50', borderWidth: 0 },
          text: { color: '#fff' }
        };
      case 'secondary':
        return {
          container: { backgroundColor: '#f5f5f5', borderWidth: 0 },
          text: { color: '#333' }
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4CAF50' },
          text: { color: '#4CAF50' }
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 0 },
          text: { color: '#4CAF50' }
        };
      case 'danger':
        return {
          container: { backgroundColor: '#f44336', borderWidth: 0 },
          text: { color: '#fff' }
        };
      default:
        return {
          container: { backgroundColor: '#4CAF50', borderWidth: 0 },
          text: { color: '#fff' }
        };
    }
  };

  const getSizeStyles = (size: ButtonSize) => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
          text: { fontSize: 12 },
          icon: 14
        };
      case 'large':
        return {
          container: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 },
          text: { fontSize: 18 },
          icon: 20
        };
      default:
        return {
          container: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
          text: { fontSize: 16 },
          icon: 16
        };
    }
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const containerStyle = [
    styles.container,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    variantStyles.text,
    sizeStyles.text,
    (disabled || loading) && styles.disabledText,
    textStyle
  ];

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variantStyles.text.color} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.icon} 
              color={variantStyles.text.color} 
              style={styles.iconLeft}
            />
          )}
          
          <Text style={textStyles}>{title}</Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.icon} 
              color={variantStyles.text.color} 
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
