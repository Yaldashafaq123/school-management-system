import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react-native';

export default function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('revenue');

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  const reports = [
    { id: 'revenue', label: 'Revenue Report', icon: TrendingUp, color: '#34C759' },
    { id: 'expenses', label: 'Expense Report', icon: BarChart, color: '#FF3B30' },
    { id: 'profit', label: 'Profit & Loss', icon: TrendingUp, color: '#007AFF' },
    { id: 'collection', label: 'Collection Report', icon: PieChart, color: '#AF52DE' },
    { id: 'budget', label: 'Budget Variance', icon: BarChart, color: '#FF9500' },
    { id: 'comparison', label: 'Year Comparison', icon: TrendingUp, color: '#5856D6' },
  ];

  const financialData = {
    revenue: [45000, 52000, 48000, 61000, 58000, 72000, 65000],
    expenses: [38000, 42000, 39000, 45000, 43000, 48000, 46000],
    profit: [7000, 10000, 9000, 16000, 15000, 24000, 19000],
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Select Period</Text>
          <View style={styles.periodButtons}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.id && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={[styles.statValue, { color: '#34C759' }]}>$382,500</Text>
            <Text style={styles.statChange}>+12.5% from last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>$284,300</Text>
            <Text style={styles.statChange}>+8.2% from last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Net Profit</Text>
            <Text style={[styles.statValue, { color: '#007AFF' }]}>$98,200</Text>
            <Text style={styles.statChange}>+24.3% from last month</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Financial Overview</Text>
            <TouchableOpacity style={styles.chartAction}>
              <Calendar size={16} color="#007AFF" />
              <Text style={styles.chartActionText}>Custom Range</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart Visualization</Text>
            <Text style={styles.chartSubtext}>Monthly revenue vs expenses</Text>
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
              <Text style={styles.legendText}>Revenue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.legendText}>Profit</Text>
            </View>
          </View>
        </View>

        {/* Reports Grid */}
        <View style={styles.reportsContainer}>
          <Text style={styles.sectionTitle}>Available Reports</Text>
          <View style={styles.reportsGrid}>
            {reports.map(report => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.reportCard,
                  selectedReport === report.id && styles.reportCardActive
                ]}
                onPress={() => setSelectedReport(report.id)}
              >
                <View style={[styles.reportIcon, { backgroundColor: report.color + '20' }]}>
                  <report.icon size={24} color={report.color} />
                </View>
                <Text style={styles.reportLabel}>{report.label}</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Download size={16} color="#007AFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Report Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Report Type:</Text>
              <Text style={styles.detailValue}>Revenue Analysis</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Period:</Text>
              <Text style={styles.detailValue}>January 2024</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Generated On:</Text>
              <Text style={styles.detailValue}>2024-01-20 14:30</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Format:</Text>
              <Text style={styles.detailValue}>PDF, Excel, CSV</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.generateButton}>
            <Download size={20} color="white" />
            <Text style={styles.generateButtonText}>Generate & Download Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  periodSelector: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#8E8E93',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  chartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartActionText: {
    fontSize: 14,
    color: '#007AFF',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  reportsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reportCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  downloadButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  detailsContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});