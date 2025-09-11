import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, profile } = useAuth();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome to HarakaPay
        </Text>
        <Text className="text-blue-100 text-lg">
          Hello, {profile?.first_name || user?.email}!
        </Text>
      </View>
      
      {/* Content */}
      <View className="px-6 py-6">
        <Text className="text-xl font-bold text-gray-900 mb-6">
          Quick Actions
        </Text>
        
        {/* Action Cards */}
        <View className="space-y-4">
          <TouchableOpacity className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-blue-600 text-xl">🏫</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Select School
                </Text>
                <Text className="text-gray-600 text-sm">
                  Choose your child's school to get started
                </Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-green-600 text-xl">👨‍👩‍👧‍👦</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  View Students
                </Text>
                <Text className="text-gray-600 text-sm">
                  Manage your children's information
                </Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-purple-600 text-xl">💳</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Make Payment
                </Text>
                <Text className="text-gray-600 text-sm">
                  Pay school fees securely
                </Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Recent Activity */}
        <View className="mt-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </Text>
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-gray-500 text-center py-8">
              No recent activity yet
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
