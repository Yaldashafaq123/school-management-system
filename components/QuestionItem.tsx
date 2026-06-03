// components/QuestionItem.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: Array<{
    id: string;
    text: string;
    is_correct?: boolean;
  }>;
  correct_answer?: string;
  explanation?: string;
  required?: boolean;
  score?: number;
  [key: string]: any; // Allow additional properties
}

interface ExamAnswer {
  id: string;
  question_id: string;
  answer?: string;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  [key: string]: any; // Allow additional properties
}

interface QuestionItemProps {
  question: ExamQuestion;
  answer?: ExamAnswer;
  questionNumber: number;
  totalQuestions: number;
  isReview?: boolean;
  onAnswer?: (answer: string) => void;
  showExplanation?: boolean;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  answer,
  questionNumber,
  totalQuestions,
  isReview = false,
  onAnswer,
  showExplanation = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    answer?.answer
  );
  const [shortAnswer, setShortAnswer] = useState(answer?.answer || '');

  const handleOptionSelect = (optionValue: string) => {
    if (!isReview) {
      setSelectedOption(optionValue);
      if (onAnswer) {
        onAnswer(optionValue);
      }
    }
  };

  const handleShortAnswerChange = (text: string) => {
    if (!isReview) {
      setShortAnswer(text);
      if (onAnswer) {
        onAnswer(text);
      }
    }
  };

  const getOptionStatus = (option: { text: string; is_correct?: boolean }) => {
    if (!isReview) return 'normal';
    
    const isSelected = selectedOption === option.text;
    const isCorrect = option.is_correct;
    
    if (isSelected && isCorrect) return 'correct_selected';
    if (isSelected && !isCorrect) return 'incorrect_selected';
    if (!isSelected && isCorrect) return 'correct_not_selected';
    return 'incorrect_not_selected';
  };

  const renderMultipleChoice = () => (
    <View style={styles.optionsContainer}>
      {question.options?.map((option) => {
        const status = getOptionStatus(option);
        const isSelected = selectedOption === option.text;
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              isSelected && styles.optionButtonSelected,
              status === 'correct_selected' && styles.correctOption,
              status === 'incorrect_selected' && styles.incorrectOption,
              status === 'correct_not_selected' && styles.correctNotSelected,
            ]}
            onPress={() => handleOptionSelect(option.text)}
            disabled={isReview}
          >
            <View style={[
              styles.optionRadio,
              isSelected && styles.optionRadioSelected,
              status === 'correct_selected' && styles.correctRadio,
              status === 'incorrect_selected' && styles.incorrectRadio,
            ]}>
              {isSelected && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={[
              styles.optionText,
              isSelected && styles.optionTextSelected,
              status === 'correct_selected' && styles.correctOptionText,
              status === 'incorrect_selected' && styles.incorrectOptionText,
            ]}>
              {option.text}
            </Text>
            
            {isReview && (
              <View style={styles.optionStatus}>
                {option.is_correct ? (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                ) : isSelected ? (
                  <Ionicons name="close-circle" size={16} color={Colors.danger} />
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTrueFalse = () => (
    <View style={styles.trueFalseContainer}>
      {[
        { value: 'true', label: 'درست' },
        { value: 'false', label: 'نادرست' },
      ].map((item) => {
        const isSelected = selectedOption === item.value;
        const isCorrect = item.value === question.correct_answer;
        
        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.trueFalseButton,
              isSelected && styles.trueFalseButtonSelected,
              isReview && isSelected && isCorrect && styles.correctOption,
              isReview && isSelected && !isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(item.value)}
            disabled={isReview}
          >
            <Text style={[
              styles.trueFalseText,
              isSelected && styles.trueFalseTextSelected,
            ]}>
              {item.label}
            </Text>
            
            {isReview && isSelected && (
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={isCorrect ? Colors.success : Colors.danger}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderShortAnswer = () => (
    <View style={styles.shortAnswerContainer}>
      <TextInput
        style={[
          styles.shortAnswerInput,
          isReview && answer?.is_correct === true && styles.correctInput,
          isReview && answer?.is_correct === false && styles.incorrectInput,
        ]}
        placeholder="پاسخ خود را بنویسید..."
        placeholderTextColor={Colors.textSecondary}
        value={shortAnswer}
        onChangeText={handleShortAnswerChange}
        multiline
        textAlignVertical="top"
        editable={!isReview}
      />
      
      {isReview && answer?.feedback && (
        <Text style={styles.feedbackText}>{answer.feedback}</Text>
      )}
    </View>
  );

  const renderEssay = () => (
    <View style={styles.essayContainer}>
      <TextInput
        style={styles.essayInput}
        placeholder="پاسخ تشریحی خود را بنویسید..."
        placeholderTextColor={Colors.textSecondary}
        value={shortAnswer}
        onChangeText={handleShortAnswerChange}
        multiline
        textAlignVertical="top"
        numberOfLines={8}
        editable={!isReview}
      />
      
      {isReview && answer?.score !== undefined && (
        <View style={styles.essayScore}>
          <Text style={styles.scoreLabel}>نمره:</Text>
          <Text style={styles.scoreValue}>
            {answer.score}/{question.score || 0}
          </Text>
        </View>
      )}
      
      {isReview && answer?.feedback && (
        <Text style={styles.essayFeedback}>{answer.feedback}</Text>
      )}
    </View>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'true_false':
        return renderTrueFalse();
      case 'short_answer':
        return renderShortAnswer();
      case 'essay':
        return renderEssay();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Header */}
      <View style={styles.header}>
        <View style={styles.questionNumber}>
          <Text style={styles.numberText}>
            سوال {questionNumber} از {totalQuestions}
          </Text>
          {question.required && (
            <Text style={styles.requiredBadge}>الزامی</Text>
          )}
        </View>
        
        <View style={styles.scoreBadge}>
          <Ionicons name="trophy" size={14} color={Colors.warning} />
          <Text style={styles.scoreText}>{question.score || 0} نمره</Text>
        </View>
      </View>

      {/* Question Text */}
      <Text style={styles.questionText}>{question.question}</Text>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Explanation (in review mode) */}
      {isReview && showExplanation && question.explanation && (
        <View style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb" size={16} color={Colors.info} />
            <Text style={styles.explanationTitle}>توضیح پاسخ</Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  requiredBadge: {
    fontSize: 10,
    color: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  correctOption: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  incorrectOption: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  correctNotSelected: {
    borderColor: Colors.success,
    borderStyle: 'dashed',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  correctRadio: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  incorrectRadio: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  correctOptionText: {
    color: Colors.success,
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: Colors.danger,
    fontWeight: '600',
  },
  optionStatus: {
    width: 24,
    alignItems: 'center',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  trueFalseButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  trueFalseText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  trueFalseTextSelected: {
    color: Colors.primary,
  },
  shortAnswerContainer: {
    gap: 12,
  },
  shortAnswerInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  correctInput: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  incorrectInput: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  feedbackText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  essayContainer: {
    gap: 16,
  },
  essayInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 160,
    textAlignVertical: 'top',
  },
  essayScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 16,
    color: Colors.warning,
    fontWeight: 'bold',
  },
  essayFeedback: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  explanationContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.info,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
});