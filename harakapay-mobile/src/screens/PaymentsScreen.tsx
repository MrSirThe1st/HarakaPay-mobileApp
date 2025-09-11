import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function PaymentsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">
          Payments
        </Text>
        <Text className="text-blue-100 text-lg mt-2">
          View and make payments
        </Text>
      </View>
      
      <View className="px-6 py-6">
        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
          <Text className="text-6xl mb-4">💳</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            No payments yet
          </Text>
          <Text className="text-gray-600 text-center">
            Payment history will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
