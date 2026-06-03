// app/(admin)/finance/components/UserCard.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UserCardProps {
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
    student?: { className?: string };
    teacher?: { subjects?: { name: string }[] };
    parent?: { children?: { name: string }[] };
  };
  onPress?: () => void;
}

export default function UserCard({ user, onPress }: UserCardProps) {
  const getRoleColor = () => {
    switch (user.role?.toLowerCase()) {
      case "admin":
        return Colors.primary;
      case "teacher":
        return Colors.success;
      case "student":
        return Colors.warning;
      case "parent":
        return Colors.secondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getRoleIcon = () => {
    switch (user.role?.toLowerCase()) {
      case "admin":
        return "shield";
      case "teacher":
        return "school";
      case "student":
        return "book";
      case "parent":
        return "people";
      default:
        return "person";
    }
  };

  const getRoleText = () => {
    switch (user.role?.toLowerCase()) {
      case "admin":
        return "مدیر";
      case "teacher":
        return "معلم";
      case "student":
        return "دانش‌آموز";
      case "parent":
        return "والدین";
      default:
        return "کاربر";
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={
        onPress ||
        (() => router.push(`/(admin)/finance/users/${user.id}` as any))
      }
    >
      <View style={styles.avatarContainer}>
        {user.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: `${getRoleColor()}20` },
            ]}
          >
            <Ionicons
              name={getRoleIcon() as any}
              size={24}
              color={getRoleColor()}
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.student?.className && (
          <Text style={styles.detail}>کلاس: {user.student.className}</Text>
        )}
        {user.teacher?.subjects && user.teacher.subjects.length > 0 && (
          <Text style={styles.detail}>
            دروس: {user.teacher.subjects.map((s) => s.name).join(", ")}
          </Text>
        )}
        {user.parent?.children && user.parent.children.length > 0 && (
          <Text style={styles.detail}>
            تعداد فرزندان: {user.parent.children.length}
          </Text>
        )}
      </View>

      <View style={styles.badgeContainer}>
        <View
          style={[styles.roleBadge, { backgroundColor: `${getRoleColor()}10` }]}
        >
          <Ionicons
            name={getRoleIcon() as any}
            size={12}
            color={getRoleColor()}
          />
          <Text style={[styles.roleText, { color: getRoleColor() }]}>
            {getRoleText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detail: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  badgeContainer: {
    justifyContent: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
