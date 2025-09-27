// src/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

export default function SearchBar({ 
  placeholder = "Search...",
  onSearch,
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  showCancel = false,
  onCancel
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchBarWidth = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    if (showCancel) {
      Animated.timing(searchBarWidth, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    
    if (showCancel) {
      Animated.timing(searchBarWidth, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setQuery('');
    onSearch('');
    Keyboard.dismiss();
    onCancel?.();
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.searchContainer, 
          { 
            flex: searchBarWidth,
            borderColor: isFocused ? '#4CAF50' : '#e0e0e0'
          }
        ]}
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? '#4CAF50' : '#999'} 
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(query)}
        />
        
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {showCancel && isFocused && (
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
