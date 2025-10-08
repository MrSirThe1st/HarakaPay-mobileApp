import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Download, Share, Calendar, CheckCircle, GraduationCap, BookOpen, DollarSign } from 'lucide-react-native';
import { StudentMatch } from '../types/user';
import { StudentFeesService, StudentFeeData, StudentFeeCategory } from '../services/studentFeesService';

interface StudentPaymentScreenProps {
  navigation: any;
  route: {
    params: {
      student: StudentMatch;
    };
  };
}

interface PaymentRecord {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  receiptUrl?: string;
}

export default function StudentPaymentScreen(props: any) {
  const { navigation, route } = props;
  const { student } = route.params;
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [studentFeeData, setStudentFeeData] = useState<StudentFeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch student fee data
  useEffect(() => {
    fetchStudentFees();
  }, []);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      const allFees = await StudentFeesService.getStudentFees();
      const studentFees = allFees.students.find(s => s.student.id === student.id);
      setStudentFeeData(studentFees || null);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      Alert.alert('Error', 'Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudentFees();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType) {
      case 'tuition':
        return <GraduationCap size={20} color="#3B82F6" />;
      case 'additional':
        return <BookOpen size={20} color="#10B981" />;
      default:
        return <CreditCard size={20} color="#6B7280" />;
    }
  };

  const getCategoryColor = (categoryType: string) => {
    switch (categoryType) {
      case 'tuition':
        return '#3B82F6';
      case 'additional':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };


  const handleCategoryPress = (category: any) => {
    if (!studentFeeData) return;
    
    // Navigate to payment page with category and student data
    navigation.navigate('CategoryPayment', {
      category: category,
      student: studentFeeData.student,
      academicYear: studentFeeData.academic_year,
    });
  };

  const handleDownloadReceipt = (receipt: PaymentRecord) => {
    Alert.alert('Download Receipt', `Download receipt for ${receipt.month} ${receipt.year}?`);
  };

  const handleShareReceipt = (receipt: PaymentRecord) => {
    Alert.alert('Share Receipt', `Share receipt for ${receipt.month} ${receipt.year}?`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#059669';
      case 'pending': return '#D97706';
      case 'overdue': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
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
          {studentFeeData ? `${student.first_name} ${student.last_name}` : 'Payment'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading fee information...</Text>
          </View>
        ) : !studentFeeData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No fee information available</Text>
            <Text style={styles.noDataSubtext}>This student doesn't have any fee assignments yet.</Text>
          </View>
        ) : (
          <>
            {/* Fee Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fee Categories</Text>
              
              {studentFeeData.fee_categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleRow}>
                      {getCategoryIcon(category.category_type)}
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.is_mandatory && (
                        <View style={styles.mandatoryBadge}>
                          <Text style={styles.mandatoryText}>Required</Text>
                        </View>
                      )}
                      {!category.is_mandatory && (
                        <View style={styles.optionalBadge}>
                          <Text style={styles.optionalText}>Optional</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Category Type */}
                    <View style={styles.categoryTypeRow}>
                      <Text style={styles.categoryTypeLabel}>Type: </Text>
                      <Text style={styles.categoryTypeText}>
                        {category.category_type || 'General'}
                      </Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: getCategoryColor(category.category_type) }]}>
                      {formatCurrency(category.amount)}
                    </Text>
                  </View>
                  
                  {category.description && (
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  )}
                  
                  <View style={styles.categoryFooter}>
                    <View style={styles.paymentTypes}>
                      <Text style={styles.paymentTypesLabel}>Payment Options:</Text>
                      <View style={styles.paymentTypeBadges}>
                        {category.supports_recurring && (
                          <View style={styles.paymentTypeBadge}>
                            <Text style={styles.paymentTypeText}>Recurring</Text>
                          </View>
                        )}
                        {category.supports_one_time && (
                          <View style={styles.paymentTypeBadge}>
                            <Text style={styles.paymentTypeText}>One-time</Text>
                          </View>
                        )}
                        {!category.supports_recurring && !category.supports_one_time && (
                          <Text style={styles.noPaymentTypes}>No payment options available</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  mandatoryBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  mandatoryText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '500',
  },
  optionalBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  optionalText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '500',
  },
  categoryTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryTypeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTypeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTypes: {
    flexDirection: 'column',
    gap: 6,
  },
  paymentTypesLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentTypeBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  paymentTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentTypeText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
  noPaymentTypes: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentDetails: {
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  outstandingCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  outstandingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  outstandingText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  payOutstandingButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payOutstandingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  receiptButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
});
