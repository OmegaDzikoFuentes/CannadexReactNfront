// src/screens/encounters/CreateEncounterScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { fetchStrains, searchStrains } from '../../store/slices/strainsSlice';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateEncounter'>;

interface EncounterForm {
  strain_id: number | null;
  strain_name: string;
  overall_rating: number;
  taste_rating: number;
  smell_rating: number;
  texture_rating: number;
  potency_rating: number;
  description: string;
  experience: string;
  effects_experienced: string[];
  location_name: string;
  source_type: string;
  source_name: string;
  price_paid: string;
  amount_purchased: string;
  public: boolean;
  friends_only: boolean;
}

const EFFECT_OPTIONS = [
  'Happy', 'Relaxed', 'Creative', 'Euphoric', 'Energetic', 'Focused', 
  'Uplifted', 'Sleepy', 'Hungry', 'Talkative', 'Aroused', 'Giggly',
  'Dry Eyes', 'Dry Mouth', 'Paranoid', 'Anxious', 'Dizzy', 'Headache'
];

const SOURCE_TYPES = ['Dispensary', 'Friend', 'Dealer', 'Grow', 'Gift', 'Other'];

export default function CreateEncounterScreen({ navigation, route }: Props) {
  const { preselectedStrainId, encounterId } = route.params || {};
  const dispatch = useAppDispatch();
  const { strains, isLoading } = useAppSelector(state => state.strains);
  const { user } = useAppSelector(state => state.auth);

  const [form, setForm] = useState<EncounterForm>({
    strain_id: preselectedStrainId || null,
    strain_name: '',
    overall_rating: 5,
    taste_rating: 5,
    smell_rating: 5,
    texture_rating: 5,
    potency_rating: 5,
    description: '',
    experience: '',
    effects_experienced: [],
    location_name: user?.city || '',
    source_type: '',
    source_name: '',
    price_paid: '',
    amount_purchased: '',
    public: true,
    friends_only: false,
  });

  const [showStrainPicker, setShowStrainPicker] = useState(false);
  const [showEffectsPicker, setShowEffectsPicker] = useState(false);
  const [showSourceTypePicker, setShowSourceTypePicker] = useState(false);
  const [strainSearch, setStrainSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (encounterId) {
      setIsEditing(true);
      loadEncounterForEdit();
    }
    if (!preselectedStrainId) {
      dispatch(fetchStrains());
    }
  }, [encounterId, preselectedStrainId, dispatch]);

  useEffect(() => {
    if (preselectedStrainId) {
      const selectedStrain = strains.find(s => s.id === preselectedStrainId);
      if (selectedStrain) {
        setForm(prev => ({
          ...prev,
          strain_id: selectedStrain.id,
          strain_name: selectedStrain.name,
        }));
      }
    }
  }, [preselectedStrainId, strains]);

  const loadEncounterForEdit = async () => {
    try {
      // const response = await api.get(`/api/v1/encounters/${encounterId}`);
      // const encounter = response.data;
      
      // Mock data for editing
      const encounter = {
        strain_id: 1,
        strain_name: 'Blue Dream',
        overall_rating: 8.5,
        taste_rating: 8.0,
        smell_rating: 9.0,
        texture_rating: 8.5,
        potency_rating: 8.0,
        description: 'Amazing hybrid with sweet berry flavors.',
        experience: 'Perfect for creative work.',
        effects_experienced: ['Creative', 'Euphoric', 'Relaxed'],
        location_name: 'Dayton, OH',
        source_type: 'Dispensary',
        source_name: 'Green Leaf Wellness',
        price_paid: 45.00,
        amount_purchased: '3.5g',
        public: true,
        friends_only: false,
      };
      
      setForm(prev => ({
        ...prev,
        ...encounter,
        price_paid: encounter.price_paid?.toString() || '',
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load encounter for editing');
      navigation.goBack();
    }
  };

  const handleStrainSearch = (query: string) => {
    setStrainSearch(query);
    if (query.length > 2) {
      dispatch(searchStrains(query));
    }
  };

  const selectStrain = (strain: any) => {
    setForm(prev => ({
      ...prev,
      strain_id: strain.id,
      strain_name: strain.name,
    }));
    setShowStrainPicker(false);
    setStrainSearch('');
  };

  const toggleEffect = (effect: string) => {
    setForm(prev => ({
      ...prev,
      effects_experienced: prev.effects_experienced.includes(effect)
        ? prev.effects_experienced.filter(e => e !== effect)
        : [...prev.effects_experienced, effect],
    }));
  };

  const updateRating = (field: keyof EncounterForm, value: number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.strain_id || !form.strain_name) {
      Alert.alert('Error', 'Please select a strain');
      return false;
    }
    if (form.overall_rating < 1 || form.overall_rating > 10) {
      Alert.alert('Error', 'Overall rating must be between 1 and 10');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const payload = {
        ...form,
        price_paid: form.price_paid ? parseFloat(form.price_paid) : null,
        encountered_at: new Date().toISOString(),
      };

      if (isEditing) {
        // await api.put(`/api/v1/encounters/${encounterId}`, payload);
        Alert.alert('Success', 'Encounter updated successfully!');
      } else {
        // await api.post('/api/v1/encounters', payload);
        Alert.alert('Success', 'Encounter logged successfully!');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save encounter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderRatingSelector = (
    label: string,
    field: keyof EncounterForm,
    value: number
  ) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value === rating && styles.ratingButtonSelected,
            ]}
            onPress={() => updateRating(field, rating)}
          >
            <Text
              style={[
                styles.ratingButtonText,
                value === rating && styles.ratingButtonTextSelected,
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const StrainPickerModal = () => (
    <Modal
      visible={showStrainPicker}
      animationType="slide"
      onRequestClose={() => setShowStrainPicker(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowStrainPicker(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Strain</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search strains..."
            value={strainSearch}
            onChangeText={handleStrainSearch}
            autoFocus
          />
        </View>
        
        {isLoading ? (
          <View style={styles.modalLoadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <FlatList
            data={strains}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.strainItem}
                onPress={() => selectStrain(item)}
              >
                <View style={styles.strainItemInfo}>
                  <Text style={styles.strainItemName}>{item.name}</Text>
                  {item.category && (
                    <Text style={styles.strainItemCategory}>{item.category.name}</Text>
                  )}
                </View>
                <Text style={styles.strainItemRating}>
                  ⭐ {item.average_overall_rating?.toFixed(1) || 'N/A'}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  const EffectsPickerModal = () => (
    <Modal
      visible={showEffectsPicker}
      animationType="slide"
      onRequestClose={() => setShowEffectsPicker(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEffectsPicker(false)}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Effects</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>
        
        <ScrollView style={styles.effectsGrid}>
          {EFFECT_OPTIONS.map((effect) => (
            <TouchableOpacity
              key={effect}
              style={[
                styles.effectOption,
                form.effects_experienced.includes(effect) && styles.effectOptionSelected,
              ]}
              onPress={() => toggleEffect(effect)}
            >
              <Text
                style={[
                  styles.effectOptionText,
                  form.effects_experienced.includes(effect) && styles.effectOptionTextSelected,
                ]}
              >
                {effect}
              </Text>
              {form.effects_experienced.includes(effect) && (
                <Text style={styles.effectCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Encounter' : 'Log Encounter'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={[styles.saveButtonText, saving && styles.saveButtonTextDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Strain Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strain *</Text>
          <TouchableOpacity
            style={styles.strainSelector}
            onPress={() => setShowStrainPicker(true)}
          >
            <Text style={[styles.strainSelectorText, !form.strain_name && styles.placeholderText]}>
              {form.strain_name || 'Select a strain...'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings *</Text>
          {renderRatingSelector('Overall Rating', 'overall_rating', form.overall_rating)}
          {renderRatingSelector('Taste', 'taste_rating', form.taste_rating)}
          {renderRatingSelector('Smell', 'smell_rating', form.smell_rating)}
          {renderRatingSelector('Texture', 'texture_rating', form.texture_rating)}
          {renderRatingSelector('Potency', 'potency_rating', form.potency_rating)}
        </View>

        {/* Effects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Effects Experienced</Text>
          <TouchableOpacity
            style={styles.effectsSelector}
            onPress={() => setShowEffectsPicker(true)}
          >
            <Text style={styles.effectsSelectorText}>
              {form.effects_experienced.length > 0
                ? `${form.effects_experienced.length} effects selected`
                : 'Select effects...'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          {form.effects_experienced.length > 0 && (
            <View style={styles.selectedEffectsContainer}>
              {form.effects_experienced.map((effect) => (
                <View key={effect} style={styles.selectedEffectTag}>
                  <Text style={styles.selectedEffectText}>{effect}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the taste, smell, appearance, etc..."
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <TextInput
            style={styles.textArea}
            placeholder="How did it make you feel? What was the experience like?"
            value={form.experience}
            onChangeText={(text) => setForm(prev => ({ ...prev, experience: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location & Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Source</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="City, State"
              value={form.location_name}
              onChangeText={(text) => setForm(prev => ({ ...prev, location_name: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Source Type</Text>
            <TouchableOpacity
              style={styles.sourceTypeSelector}
              onPress={() => setShowSourceTypePicker(true)}
            >
              <Text style={[styles.sourceTypeSelectorText, !form.source_type && styles.placeholderText]}>
                {form.source_type || 'Select source type...'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Source Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Dispensary name, friend's name, etc."
              value={form.source_name}
              onChangeText={(text) => setForm(prev => ({ ...prev, source_name: text }))}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Price Paid</Text>
              <TextInput
                style={styles.textInput}
                placeholder="$0.00"
                value={form.price_paid}
                onChangeText={(text) => setForm(prev => ({ ...prev, price_paid: text }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="3.5g, 1oz, etc."
                value={form.amount_purchased}
                onChangeText={(text) => setForm(prev => ({ ...prev, amount_purchased: text }))}
              />
            </View>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.privacyOption}>
            <View style={styles.privacyOptionInfo}>
              <Text style={styles.privacyOptionTitle}>Public</Text>
              <Text style={styles.privacyOptionDescription}>
                Visible to all users in the community
              </Text>
            </View>
            <Switch
              value={form.public}
              onValueChange={(value) => setForm(prev => ({ ...prev, public: value }))}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={form.public ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.privacyOption}>
            <View style={styles.privacyOptionInfo}>
              <Text style={styles.privacyOptionTitle}>Friends Only</Text>
              <Text style={styles.privacyOptionDescription}>
                Only visible to your friends
              </Text>
            </View>
            <Switch
              value={form.friends_only}
              onValueChange={(value) => setForm(prev => ({ ...prev, friends_only: value }))}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={form.friends_only ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <StrainPickerModal />
      <EffectsPickerModal />
      
      {/* Source Type Picker Modal */}
      <Modal
        visible={showSourceTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Source Type</Text>
            {SOURCE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  form.source_type === type && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  setForm(prev => ({ ...prev, source_type: type }));
                  setShowSourceTypePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  form.source_type === type && styles.pickerOptionTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowSourceTypePicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  strainSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  strainSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    fontSize: 18,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  ratingButtonTextSelected: {
    color: '#fff',
  },
  effectsSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  effectsSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectedEffectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedEffectTag: {
    backgroundColor: '#e9f7ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedEffectText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  sourceTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  sourceTypeSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyOptionInfo: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalHeaderSpacer: {
    width: 50,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  strainItemInfo: {
    flex: 1,
  },
  strainItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  strainItemCategory: {
    fontSize: 14,
    color: '#666',
  },
  strainItemRating: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  effectsGrid: {
    padding: 20,
  },
  effectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  effectOptionSelected: {
    backgroundColor: '#e9f7ef',
  },
  effectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  effectOptionTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  effectCheckmark: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#e9f7ef',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  pickerCancel: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#666',
  },
});