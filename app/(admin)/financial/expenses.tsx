import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Plus, TrendingUp, TrendingDown, PieChart, Calendar, Filter } from 'lucide-react-native';

export default function ExpenseManagement() {
  const [expenses] = useState([
    { id: 1, category: 'Salaries', amount: 85000, date: '2024-01-15', type: 'Monthly' },
    { id: 2, category: 'Utilities', amount: 12000, date: '2024-01-10', type: 'Monthly' },
    { id: 3, category: 'Maintenance', amount: 8000, date: '2024-01-05', type: 'One-time' },
    { id: 4, category: 'Supplies', amount: 15000, date: '2024-01-02', type: 'Monthly' },
    { id: 5, category: 'Events', amount: 5000, date: '2024-01-20', type: 'One-time' },
  ]);

  const categories = [
    { name: 'Salaries', amount: 85000, color: '#007AFF', percentage: 45 },
    { name: 'Utilities', amount: 12000, color: '#34C759', percentage: 22 },
    { name: 'Maintenance', amount: 8000, color: '#FF9500', percentage: 15 },
    { name: 'Supplies', amount: 15000, color: '#AF52DE', percentage: 10 },
    { name: 'Events', amount: 5000, color: '#FF2D55', percentage: 8 },
  ];

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = 200000;
  const budgetUsage = (totalExpenses / monthlyBudget) * 100;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Monthly Budget</Text>
            <Text style={styles.budgetAmount}>${monthlyBudget.toLocaleString()}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${Math.min(budgetUsage, 100)}%` }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                ${totalExpenses.toLocaleString()} spent
              </Text>
              <Text style={styles.progressPercentage}>
                {budgetUsage.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.budgetStats}>
            <View style={styles.statItem}>
              <TrendingDown size={20} color="#34C759" />
              <Text style={styles.statValue}>${(monthlyBudget - totalExpenses).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#FF3B30" />
              <Text style={styles.statValue}>${(totalExpenses / 30).toFixed(0)}</Text>
              <Text style={styles.statLabel}>Daily Avg</Text>
            </View>
          </View>
        </View>

        {/* Expense Categories */}
        <View style={styles.categoriesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Expense Breakdown</Text>
            <PieChart size={20} color="#8E8E93" />
          </View>
          
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.amountText}>${category.amount.toLocaleString()}</Text>
                <Text style={styles.percentageText}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Expenses */}
        <View style={styles.expensesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Expenses</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color="#007AFF" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.map(expense => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <View style={styles.expenseDetails}>
                  <Calendar size={14} color="#8E8E93" />
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: expense.type === 'Monthly' ? '#D4F7E2' : '#FFF3CD' }
                  ]}>
                    <Text style={[
                      styles.typeText,
                      { color: expense.type === 'Monthly' ? '#34C759' : '#FF9500' }
                    ]}>
                      {expense.type}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.expenseAmount}>${expense.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  budgetCard: {
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
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  categoriesCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  expensesCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#007AFF',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  percentageText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});