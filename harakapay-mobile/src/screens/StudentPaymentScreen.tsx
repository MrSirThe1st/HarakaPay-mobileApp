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
import { ArrowLeft, CreditCard, Download, Share, Calendar, CheckCircle } from 'lucide-react-native';
import { StudentMatch } from '../types/user';

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

  // Mock payment history data
  const paymentHistory: PaymentRecord[] = [
    {
      id: '1',
      month: 'December',
      year: 2024,
      amount: 1200,
      status: 'paid',
      paymentDate: '2024-12-01',
      receiptUrl: 'receipt_2024_12.pdf'
    },
    {
      id: '2',
      month: 'November',
      year: 2024,
      amount: 1200,
      status: 'paid',
      paymentDate: '2024-11-01',
      receiptUrl: 'receipt_2024_11.pdf'
    },
    {
      id: '3',
      month: 'October',
      year: 2024,
      amount: 1200,
      status: 'paid',
      paymentDate: '2024-10-01',
      receiptUrl: 'receipt_2024_10.pdf'
    },
    {
      id: '4',
      month: 'September',
      year: 2024,
      amount: 1200,
      status: 'overdue',
    },
  ];

  const currentMonthAmount = 1200; // Mock amount
  const totalOutstanding = paymentHistory
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const handlePayNow = () => {
    Alert.alert(
      'Payment Confirmation',
      `Pay R ${currentMonthAmount.toLocaleString()} for ${student.first_name}'s ${selectedMonth} fees?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => {
          Alert.alert('Success', 'Payment processed successfully!');
        }}
      ]
    );
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        <View style={styles.studentInfoCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {student.first_name[0]}{student.last_name[0]}
            </Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>
              {student.first_name} {student.last_name}
            </Text>
            <Text style={styles.studentSchool}>{student.school_name}</Text>
            <Text style={styles.studentGrade}>Grade {student.grade_level}</Text>
          </View>
        </View>

        {/* Current Month Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Month Payment</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.monthSelector}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.monthText}>{selectedMonth} 2024</Text>
              </View>
              <Text style={styles.amountText}>R {currentMonthAmount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Tuition Fee</Text>
                <Text style={styles.paymentValue}>R 1,000.00</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Transport</Text>
                <Text style={styles.paymentValue}>R 200.00</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total</Text>
                <Text style={styles.paymentTotal}>R {currentMonthAmount.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Outstanding Balance */}
        {totalOutstanding > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outstanding Balance</Text>
            <View style={styles.outstandingCard}>
              <Text style={styles.outstandingAmount}>R {totalOutstanding.toLocaleString()}</Text>
              <Text style={styles.outstandingText}>Total outstanding amount</Text>
              <TouchableOpacity style={styles.payOutstandingButton}>
                <Text style={styles.payOutstandingText}>Pay Outstanding</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {paymentHistory.map((payment) => (
            <View key={payment.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMonth}>{payment.month} {payment.year}</Text>
                  <Text style={styles.historyAmount}>R {payment.amount.toLocaleString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {getStatusText(payment.status)}
                  </Text>
                </View>
              </View>
              
              {payment.paymentDate && (
                <Text style={styles.paymentDate}>
                  Paid on {new Date(payment.paymentDate).toLocaleDateString()}
                </Text>
              )}
              
              {payment.status === 'paid' && payment.receiptUrl && (
                <View style={styles.receiptActions}>
                  <TouchableOpacity 
                    style={styles.receiptButton}
                    onPress={() => handleDownloadReceipt(payment)}
                  >
                    <Download size={16} color="#3B82F6" />
                    <Text style={styles.receiptButtonText}>Download</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.receiptButton}
                    onPress={() => handleShareReceipt(payment)}
                  >
                    <Share size={16} color="#3B82F6" />
                    <Text style={styles.receiptButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
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
  studentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentSchool: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  studentGrade: {
    fontSize: 14,
    color: '#9CA3AF',
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
  payButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
