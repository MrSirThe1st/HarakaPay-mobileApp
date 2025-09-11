import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const { signUp, loading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, phone, password, confirmPassword, address } = formData;

    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(email, password, {
        firstName,
        lastName,
        phone,
        address,
      });
      Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 text-center mb-2">
              Create Account
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Sign up for HarakaPay
            </Text>
          </View>
          
          {/* Form */}
          <View className="space-y-4">
            {/* Name Row */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="First Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  autoCapitalize="words"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  autoCapitalize="words"
                />
              </View>
            </View>
            
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base min-h-[80px]"
              placeholder="Address (Optional)"
              placeholderTextColor="#9CA3AF"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline
              numberOfLines={2}
            />
            
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoComplete="password"
            />
            
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoComplete="password"
            />
            
            <TouchableOpacity
              className={`rounded-xl py-4 mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="py-4"
              onPress={() => navigation.navigate('Login')}
            >
              <Text className="text-blue-600 text-center text-base">
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
