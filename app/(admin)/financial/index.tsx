import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  FileText,
  PieChart,
  BarChart3,
  ChevronRight,
  Wallet,
  Receipt,
  TrendingDown
} from 'lucide-react-native';

// Define interface for module
interface FinancialModule {
  title: string;
  description: string;
  icon: any; // Using 'any' for lucide icon component type
  href: string;
  color: string;
}

export default function FinancialManagement() {
  const financialModules: FinancialModule[] = [
    {
      title: 'Fee Structure',
      description: 'Configure fee categories, amounts, due dates',
      icon: CreditCard,
      href: '/(admin)/financial/fee-structure',
      color: '#007AFF'
    },
    {
      title: 'Fee Collection',
      description: 'View collection reports, pending payments',
      icon: DollarSign,
      href: '/(admin)/financial/fee-collection',
      color: '#34C759'
    },
    {
      title: 'Expense Management',
      description: 'Track school expenses, budgets',
      icon: TrendingDown,
      href: '/(admin)/financial/expenses',
      color: '#FF9500'
    },
    {
      title: 'Financial Reports',
      description: 'Revenue, expenses, profit/loss reports',
      icon: PieChart,
      href: '/(admin)/financial/reports',
      color: '#AF52DE'
    },
  ];

  const quickStats = [
    { label: 'Total Revenue', value: '$245,800', change: '+12.5%', isPositive: true },
    { label: 'Total Expenses', value: '$182,400', change: '+8.2%', isPositive: false },
    { label: 'Net Profit', value: '$63,400', change: '+24.3%', isPositive: true },
    { label: 'Pending Fees', value: '$18,750', change: '-5.1%', isPositive: true },
  ];

  const recentTransactions = [
    { id: 1, student: 'John Smith', amount: '$1,200', type: 'Tuition', date: '2024-01-15', status: 'Paid' },
    { id: 2, student: 'Sarah Johnson', amount: '$850', type: 'Transport', date: '2024-01-14', status: 'Paid' },
    { id: 3, student: 'Mike Wilson', amount: '$1,500', type: 'Tuition', date: '2024-01-13', status: 'Pending' },
    { id: 4, student: 'Emma Davis', amount: '$650', type: 'Library', date: '2024-01-12', status: 'Paid' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Financial Management</Text>
          <Text style={styles.subtitle}>Manage school finances and transactions</Text>
        </View>
        <Wallet size={28} color="#007AFF" />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Financial Overview</Text>
          <Text style={styles.statsPeriod}>This Month</Text>
        </View>
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.changeContainer}>
                <TrendingUp size={14} color={stat.isPositive ? '#34C759' : '#FF3B30'} />
                <Text style={[
                  styles.changeText,
                  { color: stat.isPositive ? '#34C759' : '#FF3B30' }
                ]}>
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Main Modules Grid */}
      <View style={styles.modulesContainer}>
        <Text style={styles.sectionTitle}>Financial Modules</Text>
        <View style={styles.modulesGrid}>
          {financialModules.map((module, index) => (
            <Link 
              href={module.href as any} 
              key={index} 
              asChild
            >
              <TouchableOpacity style={styles.moduleCard}>
                <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                  <module.icon size={24} color={module.color} />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Link href="/(admin)/financial/fee-collection" asChild>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.transactionsList}>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionStudent}>{transaction.student}</Text>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>{transaction.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: transaction.status === 'Paid' ? '#D4F7E2' : '#FFE5E5' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: transaction.status === 'Paid' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Receipt size={20} color="#007AFF" />
            <Text style={styles.actionText}>Generate Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <BarChart3 size={20} color="#34C759" />
            <Text style={styles.actionText}>Monthly Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FileText size={20} color="#FF9500" />
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  statsPeriod: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  modulesContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  modulesGrid: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
    marginTop: 8,
  },
});