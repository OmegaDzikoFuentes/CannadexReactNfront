// src/screens/auth/AgeVerificationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { verifyAge } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'AgeVerification'>;

export default function AgeVerificationScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);
  const [confirmed, setConfirmed] = useState(false);

  const handleVerification = async () => {
    if (!confirmed) {
      Alert.alert('Verification Required', 'Please confirm that you are 21 or older');
      return;
    }

    try {
      if (user?.date_of_birth) {
        await dispatch(verifyAge(user.date_of_birth)).unwrap();
      }
    } catch (error) {
      Alert.alert('Verification Failed', 'You must be 21 or older to use this app');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔞</Text>
        </View>
        
        <Text style={styles.title}>Age Verification Required</Text>
        <Text style={styles.description}>
          Cannabis-related content is intended for adults 21 years of age and older. 
          Please confirm your age to continue.
        </Text>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, confirmed && styles.checkedBox]}
            onPress={() => setConfirmed(!confirmed)}
          >
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I confirm that I am 21 years of age or older
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !confirmed && styles.disabledButton]}
          onPress={handleVerification}
          disabled={!confirmed || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Verifying...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => Alert.alert(
            'Exit App',
            'You must be 21 or older to use this app.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => {/* Exit app logic */} }
            ]
          )}
        >
          <Text style={styles.exitButtonText}>I am under 21</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ageVerificationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    paddingVertical: 12,
  },
  exitButtonText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});