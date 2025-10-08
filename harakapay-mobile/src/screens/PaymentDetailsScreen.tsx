import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

interface PaymentDetailsScreenProps {
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
      paymentType: 'recurring' | 'one_time';
    };
  };
}

interface Installment {
  id: string;
  installment_number: number;
  name: string;
  amount: number;
  percentage: number;
  due_date: string;
  term_id?: string;
  is_current: boolean;
  is_paid: boolean;
}

export default function PaymentDetailsScreen({ navigation, route }: PaymentDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { category, student, academicYear, paymentType } = route.params;
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(true);
  const [installmentsError, setInstallmentsError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { session } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const fetchInstallments = async () => {
    if (paymentType !== 'recurring' || !session) return;
    
    setInstallmentsLoading(true);
    setInstallmentsError(null);
    
    try {
      const response = await fetch(
        `http://192.168.1.120:3000/api/parent/payment-installments?student_id=${student.id}&category_id=${category.id}&academic_year_id=${academicYear.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setInstallments(data.installments || []);
    } catch (error) {
      console.error('Error fetching installments:', error);
      setInstallmentsError(error instanceof Error ? error.message : 'Failed to fetch installments');
    } finally {
      setInstallmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallments();
  }, [paymentType, student.id, category.id, academicYear.id, session]);

  const handlePayment = (installment?: Installment) => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      const paymentAmount = installment ? installment.amount : category.amount;
      Alert.alert(
        'Payment Successful!',
        `Your payment of ${formatCurrency(paymentAmount)} has been processed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  const scrollToCurrentInstallment = () => {
    const currentIndex = installments.findIndex(inst => inst.is_current);
    if (currentIndex !== -1 && scrollViewRef.current) {
      const cardWidth = screenWidth * 0.8; // 80% of screen width
      const scrollPosition = currentIndex * cardWidth;
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  useEffect(() => {
    // Auto-scroll to current installment on mount
    if (installments.length > 0) {
      setTimeout(scrollToCurrentInstallment, 500);
    }
  }, [installments]);

  const renderInstallmentCard = (installment: Installment, index: number) => {
    const isCurrent = installment.is_current;
    
    return (
      <View key={installment.id} style={styles.cardContainer}>
        <View style={[
          styles.installmentCard,
          isCurrent && styles.currentInstallmentCard,
          installment.is_paid && styles.paidInstallmentCard
        ]}>
          <View style={styles.cardHeader}>
            <View style={styles.installmentNumber}>
              <Text style={[
                styles.installmentNumberText,
                isCurrent && styles.currentInstallmentText,
                installment.is_paid && styles.paidInstallmentText
              ]}>
                {installment.installment_number}
              </Text>
            </View>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
            {installment.is_paid && (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>Paid</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.installmentName,
            isCurrent && styles.currentInstallmentText,
            installment.is_paid && styles.paidInstallmentText
          ]}>
            {installment.name}
          </Text>
          
          <Text style={[
            styles.installmentAmount,
            isCurrent && styles.currentAmountText,
            installment.is_paid && styles.paidAmountText
          ]}>
            {formatCurrency(installment.amount)}
          </Text>
          
          <Text style={[
            styles.installmentDueDate,
            isCurrent && styles.currentDueDateText,
            installment.is_paid && styles.paidDueDateText
          ]}>
            Due: {formatDate(installment.due_date)}
          </Text>
          
          <Text style={[
            styles.installmentPercentage,
            isCurrent && styles.currentPercentageText,
            installment.is_paid && styles.paidPercentageText
          ]}>
            {installment.percentage}% of total
          </Text>
        </View>
      </View>
    );
  };

  const renderOneTimePayment = () => {
    return (
      <View style={styles.oneTimeContainer}>
        <View style={styles.oneTimeCard}>
          <View style={styles.oneTimeHeader}>
            <DollarSign size={32} color="#3B82F6" />
            <Text style={styles.oneTimeTitle}>One-time Payment</Text>
          </View>
          
          <Text style={styles.oneTimeAmount}>
            {formatCurrency(category.amount)}
          </Text>
          
          <Text style={styles.oneTimeDescription}>
            Pay the full amount for {category.name} in a single payment.
          </Text>
          
          <View style={styles.oneTimeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee Category:</Text>
              <Text style={styles.detailValue}>{category.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Academic Year:</Text>
              <Text style={styles.detailValue}>{academicYear.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Student:</Text>
              <Text style={styles.detailValue}>{student.first_name} {student.last_name}</Text>
            </View>
          </View>
        </View>
      </View>
    );
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
          {paymentType === 'recurring' ? 'Installments' : 'Payment'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {paymentType === 'recurring' ? (
        <View style={styles.carouselContainer}>
          {/* Carousel Title */}
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>Payment Installments</Text>
            <Text style={styles.carouselSubtitle}>
              {category.name} - {academicYear.name}
            </Text>
          </View>

          {/* Installments Carousel */}
          {installmentsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading installments...</Text>
            </View>
          ) : installmentsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {installmentsError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchInstallments}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : installments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No installments found</Text>
              <Text style={styles.emptySubtext}>This fee category doesn't have any payment installments.</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
              decelerationRate="fast"
              snapToInterval={screenWidth * 0.8}
              snapToAlignment="center"
            >
              {installments.map((installment, index) => 
                renderInstallmentCard(installment, index)
              )}
            </ScrollView>
          )}

          {/* Pagination Dots */}
          {!installmentsLoading && !installmentsError && installments.length > 0 && (
            <View style={styles.pagination}>
              {installments.map((installment, index) => (
                <View
                  key={installment.id}
                  style={[
                    styles.paginationDot,
                    installment.is_current && styles.currentPaginationDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        renderOneTimePayment()
      )}

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity 
          style={[styles.payButton, loading && styles.payButtonDisabled]} 
          onPress={() => handlePayment()}
          disabled={loading}
        >
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>
            {loading ? 'Processing...' : 
             paymentType === 'recurring' ? 'Pay Current Installment' : 
             `Pay ${formatCurrency(category.amount)}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  carouselContainer: {
    flex: 1,
    paddingTop: 20,
  },
  carouselHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  carousel: {
    flex: 1,
  },
  carouselContent: {
    paddingHorizontal: screenWidth * 0.1, // 10% padding on each side
  },
  cardContainer: {
    width: screenWidth * 0.8,
    paddingHorizontal: 10,
  },
  installmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  currentInstallmentCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  paidInstallmentCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  installmentNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  installmentNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  currentInstallmentText: {
    color: '#3B82F6',
  },
  paidInstallmentText: {
    color: '#10B981',
  },
  currentBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paidBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  installmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  installmentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  currentAmountText: {
    color: '#3B82F6',
  },
  paidAmountText: {
    color: '#10B981',
  },
  installmentDueDate: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentDueDateText: {
    color: '#3B82F6',
  },
  paidDueDateText: {
    color: '#10B981',
  },
  installmentPercentage: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  currentPercentageText: {
    color: '#3B82F6',
  },
  paidPercentageText: {
    color: '#10B981',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  currentPaginationDot: {
    backgroundColor: '#3B82F6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  oneTimeContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  oneTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  oneTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  oneTimeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  oneTimeAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  oneTimeDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  oneTimeDetails: {
    width: '100%',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
