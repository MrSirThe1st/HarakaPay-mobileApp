import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">
          Profile
        </Text>
      </View>
      
      {/* Profile Info */}
      <View className="px-6 py-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 text-2xl font-bold">
                {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text className="text-gray-600">
              {user?.email}
            </Text>
          </View>
        </View>
        
        {/* Info Cards */}
        <View className="space-y-4 mb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-sm text-gray-500 mb-2">Phone</Text>
            <Text className="text-base text-gray-900">
              {profile?.phone || 'Not provided'}
            </Text>
          </View>
          
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-sm text-gray-500 mb-2">Account Type</Text>
            <Text className="text-base text-gray-900 capitalize">
              {profile?.role || 'Parent'}
            </Text>
          </View>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          className="bg-red-500 rounded-2xl py-4"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
