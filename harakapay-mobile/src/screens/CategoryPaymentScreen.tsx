import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, CheckCircle, Calendar, DollarSign } from 'lucide-react-native';

interface CategoryPaymentScreenProps {
  navigation: any;
  route: {
    params: {
      category: {
        id: string;
        name: string;
        description?: string;
        amount: number;
        is_mandatory: boolean;
        supports_recurring: boolean;
        supports_one_time: boolean;
        category_type: string;
      };
      student: {
        id: string;
        first_name: string;
        last_name: string;
        grade_level: string;
        school_name: string;
      };
      academicYear: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
      };
    };
  };
}

export default function CategoryPaymentScreen({ navigation, route }: CategoryPaymentScreenProps) {
  const insets = useSafeAreaInsets();
  const { category, student, academicYear } = route.params;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType?.toLowerCase()) {
      case 'tuition':
        return <CheckCircle size={20} color="#3B82F6" />;
      case 'transport':
        return <CheckCircle size={20} color="#10B981" />;
      case 'books':
        return <CheckCircle size={20} color="#F59E0B" />;
      case 'uniform':
        return <CheckCircle size={20} color="#8B5CF6" />;
      default:
        return <CheckCircle size={20} color="#6B7280" />;
    }
  };

  const getPaymentTypeDescription = (type: 'recurring' | 'one_time') => {
    switch (type) {
      case 'recurring':
        return 'Pay this fee regularly (monthly, quarterly, etc.)';
      case 'one_time':
        return 'Pay this fee once for the entire academic year';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {student.first_name} {student.last_name}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Options</Text>
          
          <View style={styles.paymentOptionsContainer}>
            {/* Recurring Payment Option */}
            <TouchableOpacity
              style={[
                styles.paymentOptionCard,
                !category.supports_recurring && styles.inactivePaymentOption
              ]}
              onPress={() => category.supports_recurring && navigation.navigate('PaymentDetails', {
                category: category,
                student: student,
                academicYear: academicYear,
                paymentType: 'recurring',
              })}
              disabled={!category.supports_recurring}
            >
              <View style={styles.paymentOptionHeader}>
                <Calendar size={24} color={
                  !category.supports_recurring ? '#9CA3AF' : '#6B7280'
                } />
                <View style={styles.paymentOptionTitleContainer}>
                  <Text style={[
                    styles.paymentOptionTitle,
                    !category.supports_recurring && styles.inactivePaymentOptionText
                  ]}>
                    Recurring Payment
                  </Text>
                  <Text style={[
                    styles.paymentOptionAmount,
                    !category.supports_recurring && styles.inactivePaymentOptionText
                  ]}>
                    {formatCurrency(category.amount)}
                  </Text>
                </View>
                {!category.supports_recurring && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.paymentOptionDescription,
                !category.supports_recurring && styles.inactivePaymentOptionText
              ]}>
                {category.supports_recurring ? 
                  getPaymentTypeDescription('recurring') : 
                  'This payment option is not available for this fee category'
                }
              </Text>
            </TouchableOpacity>

            {/* One-time Payment Option */}
            <TouchableOpacity
              style={[
                styles.paymentOptionCard,
                !category.supports_one_time && styles.inactivePaymentOption
              ]}
              onPress={() => category.supports_one_time && navigation.navigate('PaymentDetails', {
                category: category,
                student: student,
                academicYear: academicYear,
                paymentType: 'one_time',
              })}
              disabled={!category.supports_one_time}
            >
              <View style={styles.paymentOptionHeader}>
                <DollarSign size={24} color={
                  !category.supports_one_time ? '#9CA3AF' : '#6B7280'
                } />
                <View style={styles.paymentOptionTitleContainer}>
                  <Text style={[
                    styles.paymentOptionTitle,
                    !category.supports_one_time && styles.inactivePaymentOptionText
                  ]}>
                    One-time Payment
                  </Text>
                  <Text style={[
                    styles.paymentOptionAmount,
                    !category.supports_one_time && styles.inactivePaymentOptionText
                  ]}>
                    {formatCurrency(category.amount)}
                  </Text>
                </View>
                {!category.supports_one_time && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.paymentOptionDescription,
                !category.supports_one_time && styles.inactivePaymentOptionText
              ]}>
                {category.supports_one_time ? 
                  getPaymentTypeDescription('one_time') : 
                  'This payment option is not available for this fee category'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentOptionsContainer: {
    gap: 12,
  },
  paymentOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inactivePaymentOption: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentOptionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  paymentOptionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 2,
  },
  inactivePaymentOptionText: {
    color: '#9CA3AF',
  },
  unavailableBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  unavailableText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '500',
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginLeft: 36,
  },
  paymentSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '700',
  },
});
