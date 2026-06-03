import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type StatusType = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'ACTIVE' | 'INACTIVE';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const statusConfig: Record<StatusType, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PAID: { label: 'پرداخت شده', color: Colors.success, icon: 'checkmark-circle' },
  PENDING: { label: 'در انتظار', color: Colors.warning, icon: 'time' },
  OVERDUE: { label: 'سررسید گذشته', color: Colors.danger, icon: 'alert-circle' },
  PARTIAL: { label: 'پرداخت ناقص', color: Colors.info, icon: 'remove-circle' },
  ACTIVE: { label: 'فعال', color: Colors.success, icon: 'checkmark-circle' },
  INACTIVE: { label: 'غیرفعال', color: Colors.textSecondary, icon: 'close-circle' },
};

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isSmall = size === 'small';
  
  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}15` }, isSmall && styles.badgeSmall]}>
      <Ionicons name={config.icon} size={isSmall ? 12 : 14} color={config.color} />
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSmall]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Vazirmatn',
  },
  textSmall: {
    fontSize: 10,
  },
});