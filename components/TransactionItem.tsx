import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionItemProps {
  id: number;
  title: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  onPress?: () => void;
}

const typeConfig = {
  INCOME: { icon: 'trending-up', color: Colors.success, label: 'درآمد' },
  EXPENSE: { icon: 'trending-down', color: Colors.danger, label: 'هزینه' },
};

export function TransactionItem({ 
  title, 
  amount, 
  date, 
  type, 
  category,
  onPress 
}: TransactionItemProps) {
  const config = typeConfig[type];
  const isIncome = type === 'INCOME';

  const Content = () => (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.date}>{date}</Text>
            {category && (
              <>
                <View style={styles.dot} />
                <Text style={styles.category}>{category}</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: config.color }]}>
          {isIncome ? '+' : '-'} {formatCurrency(amount)}
        </Text>
        <Text style={styles.typeLabel}>{config.label}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Content />
      </TouchableOpacity>
    );
  }

  return <Content />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Vazirmatn',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
  },
  category: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Vazirmatn',
  },
  typeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
});