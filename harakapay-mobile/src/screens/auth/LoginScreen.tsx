import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-gray-900 text-center mb-2">
            HarakaPay
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Sign in to your account
          </Text>
        </View>
        
        {/* Form */}
        <View className="space-y-4">
          <View>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          
          <View>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
          
          <TouchableOpacity
            className={`rounded-xl py-4 mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="py-4"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="text-blue-600 text-center text-base">
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
