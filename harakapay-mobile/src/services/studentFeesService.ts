import { supabase } from '../lib/supabase';

export interface StudentFeeCategory {
  id: string;
  name: string;
  description: string;
  amount: number;
  is_mandatory: boolean;
  supports_recurring: boolean;
  supports_one_time: boolean;
  category_type: 'tuition' | 'additional';
}

export interface StudentFeeSummary {
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  total_installments: number;
  paid_installments: number;
  upcoming_payments: number;
}

export interface StudentFeeData {
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    school_id: string;
    school_name: string;
  };
  academic_year: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    term_structure: string;
  };
  fee_categories: StudentFeeCategory[];
  payment_schedules: {
    id: string;
    name: string;
    schedule_type: string;
    discount_percentage: number;
    template_name: string;
    installments: {
      id: string;
      installment_number: number;
      name: string;
      amount: number;
      percentage: number;
      due_date: string;
      term_id?: string;
      paid: boolean;
    }[];
  }[];
  summary: StudentFeeSummary;
}

export interface StudentFeesResponse {
  students: StudentFeeData[];
  count: number;
  summary: {
    total_students: number;
    total_assignments: number;
    total_amount_due: number;
  };
}

export class StudentFeesService {
  /**
   * Get all fee assignments for parent's linked students
   */
  static async getStudentFees(): Promise<StudentFeesResponse> {
    try {
      console.log('Fetching student fees for parent');

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No active session found');
        throw new Error('No active session found');
      }

      // Use API endpoint
      const response = await fetch('http://192.168.1.120:3000/api/parent/student-fees-detailed', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching student fees:', errorData);
        throw new Error(errorData.error || 'Failed to fetch student fees');
      }

      const data = await response.json();
      console.log(`Successfully fetched fees for ${data.count} students`);
      
      // Transform the response to match expected format
      return {
        students: data.student_fees || [],
        count: data.count || 0,
        summary: data.summary || {
          total_students: 0,
          total_assignments: 0,
          total_amount_due: 0
        }
      };

    } catch (error) {
      console.error('StudentFeesService.getStudentFees error:', error);
      throw error;
    }
  }

  /**
   * Get fees for a specific student
   */
  static async getStudentFeesById(studentId: string): Promise<StudentFeeData | null> {
    try {
      const allFees = await this.getStudentFees();
      const studentFees = allFees.students.find(student => student.student.id === studentId);
      return studentFees || null;
    } catch (error) {
      console.error('StudentFeesService.getStudentFeesById error:', error);
      return null;
    }
  }

  /**
   * Get upcoming payments for all students
   */
  static async getUpcomingPayments(): Promise<{
    student_id: string;
    student_name: string;
    installment: {
      id: string;
      installment_number: number;
      name: string;
      amount: number;
      due_date: string;
    };
    fee_template_name: string;
  }[]> {
    try {
      const allFees = await this.getStudentFees();
      const upcomingPayments: any[] = [];

      allFees.students.forEach(studentData => {
        studentData.fee_assignments.forEach(assignment => {
          assignment.payment_schedule.installments.forEach(installment => {
            const dueDate = new Date(installment.due_date);
            const today = new Date();
            
            // Only include future payments
            if (dueDate > today) {
              upcomingPayments.push({
                student_id: studentData.student.id,
                student_name: `${studentData.student.first_name} ${studentData.student.last_name}`,
                installment: {
                  id: installment.id,
                  installment_number: installment.installment_number,
                  name: installment.name,
                  amount: installment.amount,
                  due_date: installment.due_date,
                },
                fee_template_name: assignment.fee_template.name,
              });
            }
          });
        });
      });

      // Sort by due date
      upcomingPayments.sort((a, b) => 
        new Date(a.installment.due_date).getTime() - new Date(b.installment.due_date).getTime()
      );

      return upcomingPayments;
    } catch (error) {
      console.error('StudentFeesService.getUpcomingPayments error:', error);
      return [];
    }
  }

  /**
   * Get payment summary for all students
   */
  static async getPaymentSummary(): Promise<{
    total_due: number;
    total_paid: number;
    remaining_amount: number;
    students_count: number;
    assignments_count: number;
  }> {
    try {
      const allFees = await this.getStudentFees();
      
      let totalDue = 0;
      let totalPaid = 0;
      
      allFees.students.forEach(studentData => {
        studentData.fee_assignments.forEach(assignment => {
          totalDue += assignment.total_amount;
          totalPaid += assignment.paid_amount;
        });
      });

      return {
        total_due: totalDue,
        total_paid: totalPaid,
        remaining_amount: totalDue - totalPaid,
        students_count: allFees.students.length,
        assignments_count: allFees.summary.total_assignments,
      };
    } catch (error) {
      console.error('StudentFeesService.getPaymentSummary error:', error);
      return {
        total_due: 0,
        total_paid: 0,
        remaining_amount: 0,
        students_count: 0,
        assignments_count: 0,
      };
    }
  }
}
