import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye
} from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function FeeManagement() {
  const router = useRouter();

  // فاکتورها
  const invoices = [
    { 
      id: 1, 
      title: 'فیس سهماهه اول', 
      amount: '۱،۲۰۰ $',
      dueDate: '۱۵ مارچ ۲۰۲۴',
      status: 'paid',
      date: '۱۵ فبروری ۲۰۲۴'
    },
    { 
      id: 2, 
      title: 'فیس سهماهه دوم', 
      amount: '۱،۲۰۰ $',
      dueDate: '۱۵ جون ۲۰۲۴',
      status: 'pending',
      date: '۱۵ می ۲۰۲۴'
    },
    { 
      id: 3, 
      title: 'فیس ورزش سالانه', 
      amount: '۱۵۰ $',
      dueDate: '۱ اپریل ۲۰۲۴',
      status: 'overdue',
      date: '۱ مارچ ۲۰۲۴'
    },
  ];

  // تاریخچه پرداخت‌ها
  const paymentHistory = [
    { id: 1, description: 'فیس سهماهه اول', amount: '۱،۲۰۰ $', date: '۱۵ فبروری ۲۰۲۴', method: 'کارت اعتباری' },
    { id: 2, description: 'مخارج کتاب‌ها', amount: '۸۵ $', date: '۲۰ جنوری ۲۰۲۴', method: 'حواله بانکی' },
    { id: 3, description: 'فیس یونیفورم', amount: '۲۰۰ $', date: '۱۰ دسمبر ۲۰۲۳', method: 'کارت اعتباری' },
  ];

  const totalDue = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount.replace('$', '').replace('،', '').replace(',', '')), 0);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle size={20} color="#10b981" />;
      case 'pending': return <Clock size={20} color="#f59e0b" />;
      case 'overdue': return <AlertTriangle size={20} color="#ef4444" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'paid': return 'پرداخت شده';
      case 'pending': return 'در انتظار';
      case 'overdue': return 'معوق';
      default: return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* کارت خلاصه */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <DollarSign size={24} color="#3b82f6" />
          <Text style={styles.summaryTitle}>خلاصه فیس</Text>
        </View>
        <Text style={styles.totalAmount}>{totalDue.toFixed(2)} $</Text>
        <Text style={styles.totalLabel}>مجموع مبلغ معوق</Text>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => router.push('./fees')}
        >
          <Text style={styles.payButtonText}>اکنون پرداخت کنید</Text>
        </TouchableOpacity>
      </View>

      {/* فاکتورهای معوق */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>فاکتورهای معوق</Text>
        {invoices
          .filter(inv => inv.status !== 'paid')
          .map((invoice) => (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceTitle}>{invoice.title}</Text>
                  <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
                </View>
                {getStatusIcon(invoice.status)}
              </View>
              <View style={styles.invoiceDetails}>
                <Text style={styles.invoiceDate}>موعد: {invoice.dueDate}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                    {getStatusText(invoice.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.invoiceActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Eye size={16} color="#3b82f6" />
                  <Text style={styles.actionText}>مشاهده</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={16} color="#10b981" />
                  <Text style={styles.actionText}>دانلود</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.payNowButton}
                  onPress={() => router.push('./fees')}
                >
                  <Text style={styles.payNowText}>اکنون پرداخت کنید</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </View>

      {/* تاریخچه پرداخت‌ها */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تاریخچه پرداخت‌ها</Text>
        {paymentHistory.map((payment) => (
          <View key={payment.id} style={styles.historyCard}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyDescription}>{payment.description}</Text>
              <Text style={styles.historyDate}>{payment.date}</Text>
              <Text style={styles.historyMethod}>{payment.method}</Text>
            </View>
            <View style={styles.historyAmount}>
              <Text style={styles.amountText}>{payment.amount}</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>پرداخت شده</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* اقدامات سریع */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Download size={24} color="#3b82f6" />
          <Text style={styles.quickActionText}>دانلود همه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Eye size={24} color="#10b981" />
          <Text style={styles.quickActionText}>مشاهده رسیدها</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: { 
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    alignItems: 'center', 
    gap: 8,
    marginBottom: 16 
  },
  summaryTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#374151',
    textAlign: 'right' // راست‌چین برای دری
  },
  totalAmount: { 
    fontSize: 48, 
    fontWeight: '700', 
    color: '#111827',
    textAlign: 'right', // راست‌چین برای دری
    direction: 'ltr' // جهت عددها از چپ به راست
  },
  totalLabel: { 
    fontSize: 16, 
    color: '#6b7280', 
    marginBottom: 24,
    textAlign: 'right' // راست‌چین برای دری
  },
  payButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  payButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600',
    textAlign: 'center' // تراز وسط
  },
  section: { paddingHorizontal: 20, gap: 12 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#111827',
    marginBottom: 8,
    textAlign: 'right' // راست‌چین برای دری
  },
  invoiceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  invoiceHeader: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceInfo: { 
    gap: 4,
    alignItems: 'flex-end' // تراز راست
  },
  invoiceTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827',
    textAlign: 'right' // راست‌چین برای دری
  },
  invoiceAmount: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827',
    textAlign: 'right', // راست‌چین برای دری
    direction: 'ltr' // جهت عددها از چپ به راست
  },
  invoiceDetails: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceDate: { 
    fontSize: 14, 
    color: '#6b7280',
    textAlign: 'right' // راست‌چین برای دری
  },
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600',
    textAlign: 'center' // تراز وسط
  },
  invoiceActions: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  actionText: { 
    fontSize: 14, 
    color: '#374151',
    textAlign: 'right' // راست‌چین برای دری
  },
  payNowButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  payNowText: { 
    color: 'white', 
    fontWeight: '600',
    textAlign: 'center' // تراز وسط
  },
  historyCard: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  historyInfo: { 
    gap: 4,
    alignItems: 'flex-end' // تراز راست
  },
  historyDescription: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#111827',
    textAlign: 'right' // راست‌چین برای دری
  },
  historyDate: { 
    fontSize: 14, 
    color: '#6b7280',
    textAlign: 'right' // راست‌چین برای دری
  },
  historyMethod: { 
    fontSize: 12, 
    color: '#9ca3af',
    textAlign: 'right' // راست‌چین برای دری
  },
  historyAmount: { 
    alignItems: 'flex-start', // تغییر جهت برای دری
    gap: 4 
  },
  amountText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827',
    textAlign: 'right', // راست‌چین برای دری
    direction: 'ltr' // جهت عددها از چپ به راست
  },
  paidBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paidText: { 
    color: '#10b981', 
    fontSize: 12, 
    fontWeight: '600',
    textAlign: 'center' // تراز وسط
  },
  quickActions: {
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    padding: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row-reverse', // تغییر جهت برای دری
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  quickActionText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#374151',
    textAlign: 'right' // راست‌چین برای دری
  },
});