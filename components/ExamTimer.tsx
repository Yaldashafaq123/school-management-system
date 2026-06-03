// components/ExamTimer.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ExamTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  onHalfTime?: () => void;
  onLastMinutes?: (minutes: number) => void;
  isPaused?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  durationMinutes,
  onTimeUp,
  onHalfTime,
  onLastMinutes,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // Convert to seconds
  const [halfTimeNotified, setHalfTimeNotified] = useState(false);
  const [lastMinutesNotified, setLastMinutesNotified] = useState<number[]>([]);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        
        const newTimeLeft = prev - 1;
        
        // Notify at half time
        if (!halfTimeNotified && newTimeLeft <= (durationMinutes * 30)) {
          setHalfTimeNotified(true);
          if (onHalfTime) onHalfTime();
        }
        
        // Notify at last 5, 3, 1 minutes
        const minutesLeft = Math.floor(newTimeLeft / 60);
        if ([5, 3, 1].includes(minutesLeft) && !lastMinutesNotified.includes(minutesLeft)) {
          setLastMinutesNotified(prev => [...prev, minutesLeft]);
          if (onLastMinutes) onLastMinutes(minutesLeft);
          
          // Pulse animation for last minute warnings
          if (minutesLeft <= 3) {
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
        
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, halfTimeNotified, lastMinutesNotified]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return Colors.danger; // Last minute: red
    if (timeLeft <= 300) return Colors.warning; // Last 5 minutes: orange
    return Colors.success; // Normal: green
  };

  const getProgressPercentage = () => {
    return (timeLeft / (durationMinutes * 60)) * 100;
  };

  const timeColor = getTimeColor();
  const progressPercentage = getProgressPercentage();

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.timerCard,
        { transform: [{ scale: pulseAnim }] }
      ]}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progressPercentage}%`,
                backgroundColor: timeColor,
              }
            ]} 
          />
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Ionicons 
            name="time" 
            size={24} 
            color={timeColor} 
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: timeColor }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.timeLabel}>زمان باقی‌مانده</Text>
          </View>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusIndicators}>
          {timeLeft <= 300 && (
            <View style={[styles.statusBadge, { backgroundColor: `${timeColor}20` }]}>
              <Ionicons name="warning" size={12} color={timeColor} />
              <Text style={[styles.statusText, { color: timeColor }]}>
                {timeLeft <= 60 ? 'آخرین دقیقه!' : 'زمان کم!'}
              </Text>
            </View>
          )}
          
          {isPaused && (
            <View style={[styles.statusBadge, { backgroundColor: `${Colors.info}20` }]}>
              <Ionicons name="pause" size={12} color={Colors.info} />
              <Text style={[styles.statusText, { color: Colors.info }]}>
                متوقف شده
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timerCard: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});