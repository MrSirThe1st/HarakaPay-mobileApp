import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CreditCard } from 'lucide-react-native';

export default function PaymentsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>View and make payments</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.emptyCard}>
          <CreditCard size={48} color="#6B7280" />
          <Text style={styles.emptyTitle}>No payments yet</Text>
          <Text style={styles.emptyDescription}>
            Payment history will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 8,
  },
  content: {
    padding: 24,
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
