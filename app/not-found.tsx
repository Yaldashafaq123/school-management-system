import { Link } from "expo-router";
import { ArrowLeft, Home } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          The page you re looking for doesn t exist or has been moved.
        </Text>

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <Text style={styles.suggestion}>• Check the URL for typos</Text>
          <Text style={styles.suggestion}>• Use the navigation menu</Text>
          <Text style={styles.suggestion}>• Return to the homepage</Text>
        </View>

        <View style={styles.actions}>
          <Link href="./" asChild>
            <TouchableOpacity style={styles.homeButton}>
              <Home size={20} color="white" />
              <Text style={styles.homeText}>Go to Home</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={20} color="#007AFF" />
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestions: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 12,
  },
  suggestion: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 8,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  homeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  homeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f7",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  backText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
