// components/ExamQuestion.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ExamQuestion, ExamAnswer } from '../types';

interface ExamQuestionProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer?: ExamAnswer;
  onAnswerChange: (questionId: number, answer: Partial<ExamAnswer>) => void;
  showResults?: boolean;
  isReviewMode?: boolean;
}

export const ExamQuestionComponent: React.FC<ExamQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  showResults = false,
  isReviewMode = false,
}) => {
  const [shortAnswer, setShortAnswer] = useState(answer?.answer_text || '');

  const handleOptionSelect = (optionId: number) => {
    if (!isReviewMode) {
      onAnswerChange(question.id, { selected_option_id: optionId });
    }
  };

  const handleShortAnswerChange = (text: string) => {
    setShortAnswer(text);
    if (!isReviewMode) {
      onAnswerChange(question.id, { answer_text: text });
    }
  };

  const handleTrueFalseSelect = (isTrue: boolean) => {
    if (!isReviewMode) {
      const optionId = question.options?.find(opt => 
        opt.text.toLowerCase() === (isTrue ? 'درست' : 'غلط')
      )?.id;
      if (optionId) {
        onAnswerChange(question.id, { selected_option_id: optionId });
      }
    }
  };

  const renderMultipleChoice = () => {
    if (!question.options) return null;

    return (
      <View style={styles.optionsContainer}>
        {question.options.map((option) => {
          const isSelected = answer?.selected_option_id === option.id;
          const isCorrect = option.is_correct;
          const showCorrect = showResults && isCorrect;
          const showIncorrect = showResults && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showIncorrect && styles.optionIncorrect,
                isReviewMode && styles.optionReview,
              ]}
              onPress={() => handleOptionSelect(option.id)}
              disabled={isReviewMode}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIndicator,
                  isSelected && styles.optionIndicatorSelected,
                  showCorrect && styles.optionIndicatorCorrect,
                  showIncorrect && styles.optionIndicatorIncorrect,
                ]}>
                  {isSelected ? (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color="#fff" 
                    />
                  ) : showCorrect ? (
                    <Ionicons 
                      name="star" 
                      size={14} 
                      color="#fff" 
                    />
                  ) : null}
                </View>
                
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  showCorrect && styles.optionTextCorrect,
                  showIncorrect && styles.optionTextIncorrect,
                ]}>
                  {option.text}
                </Text>
              </View>
              
              {showResults && (
                <View style={styles.resultIndicator}>
                  {isCorrect && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  )}
                  {showIncorrect && (
                    <Ionicons name="close-circle" size={20} color={Colors.danger} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderTrueFalse = () => {
    const trueOption = question.options?.find(opt => opt.text.toLowerCase() === 'درست');
    const falseOption = question.options?.find(opt => opt.text.toLowerCase() === 'غلط');
    
    if (!trueOption || !falseOption) return null;

    const isTrueSelected = answer?.selected_option_id === trueOption.id;
    const isFalseSelected = answer?.selected_option_id === falseOption.id;
    const showTrueCorrect = showResults && trueOption.is_correct;
    const showFalseCorrect = showResults && falseOption.is_correct;

    return (
      <View style={styles.trueFalseContainer}>
        <TouchableOpacity
          style={[
            styles.trueFalseButton,
            styles.trueButton,
            isTrueSelected && styles.trueFalseButtonSelected,
            showTrueCorrect && styles.trueFalseButtonCorrect,
            showTrueCorrect && isFalseSelected && styles.trueFalseButtonIncorrect,
          ]}
          onPress={() => handleTrueFalseSelect(true)}
          disabled={isReviewMode}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={24} 
            color={isTrueSelected ? '#fff' : showTrueCorrect ? Colors.success : Colors.textSecondary}
          />
          <Text style={[
            styles.trueFalseText,
            isTrueSelected && styles.trueFalseTextSelected,
            showTrueCorrect && styles.trueFalseTextCorrect,
          ]}>
            درست
          </Text>
          {showTrueCorrect && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.trueFalseButton,
            styles.falseButton,
            isFalseSelected && styles.trueFalseButtonSelected,
            showFalseCorrect && styles.trueFalseButtonCorrect,
            showFalseCorrect && isTrueSelected && styles.trueFalseButtonIncorrect,
          ]}
          onPress={() => handleTrueFalseSelect(false)}
          disabled={isReviewMode}
        >
          <Ionicons 
            name="close-circle" 
            size={24} 
            color={isFalseSelected ? '#fff' : showFalseCorrect ? Colors.success : Colors.textSecondary}
          />
          <Text style={[
            styles.trueFalseText,
            isFalseSelected && styles.trueFalseTextSelected,
            showFalseCorrect && styles.trueFalseTextCorrect,
          ]}>
            غلط
          </Text>
          {showFalseCorrect && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderShortAnswer = () => {
    return (
      <View style={styles.shortAnswerContainer}>
        <TextInput
          style={[
            styles.shortAnswerInput,
            showResults && answer?.is_correct === false && styles.shortAnswerIncorrect,
            showResults && answer?.is_correct === true && styles.shortAnswerCorrect,
          ]}
          placeholder="پاسخ خود را اینجا بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          value={shortAnswer}
          onChangeText={handleShortAnswerChange}
          multiline
          textAlignVertical="top"
          editable={!isReviewMode}
        />
        
        {showResults && question.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationLabel}>توضیح:</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEssay = () => {
    return (
      <View style={styles.essayContainer}>
        <TextInput
          style={styles.essayInput}
          placeholder="پاسخ خود را با جزئیات بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          value={answer?.answer_text || ''}
          onChangeText={(text) => onAnswerChange(question.id, { answer_text: text })}
          multiline
          textAlignVertical="top"
          numberOfLines={8}
          editable={!isReviewMode}
        />
        
        <Text style={styles.essayHint}>
          پاسخ شما توسط استاد تصحیح خواهد شد
        </Text>
      </View>
    );
  };

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Question Header */}
      <View style={styles.header}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>
            سوال {questionNumber} از {totalQuestions}
          </Text>
          {showResults && answer && (
            <View style={[
              styles.pointsBadge,
              answer.is_correct ? styles.pointsBadgeCorrect : styles.pointsBadgeIncorrect
            ]}>
              <Text style={styles.pointsText}>
                {answer.points_earned || 0}/{question.points} نمره
              </Text>
            </View>
          )}
        </View>
        
        {question.is_required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>اجباری</Text>
          </View>
        )}
      </View>

      {/* Question Image */}
      {question.image_url && (
        <Image
          source={{ uri: question.image_url }}
          style={styles.questionImage}
          resizeMode="contain"
        />
      )}

      {/* Question Text */}
      <View style={styles.questionTextContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Points */}
      <View style={styles.pointsContainer}>
        <Ionicons name="trophy" size={16} color={Colors.warning} />
        <Text style={styles.pointsLabel}>{question.points} نمره</Text>
      </View>

      {/* Explanation (in review mode) */}
      {isReviewMode && question.explanation && (
        <View style={styles.reviewExplanation}>
          <Text style={styles.reviewExplanationLabel}>توضیح پاسخ:</Text>
          <Text style={styles.reviewExplanationText}>{question.explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionNumberText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeCorrect: {
    backgroundColor: `${Colors.success}20`,
  },
  pointsBadgeIncorrect: {
    backgroundColor: `${Colors.danger}20`,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requiredBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: Colors.card,
  },
  questionTextContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
    textAlign: 'right',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionIncorrect: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionReview: {
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionIndicatorCorrect: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  optionIndicatorIncorrect: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: Colors.success,
    fontWeight: '500',
  },
  optionTextIncorrect: {
    color: Colors.danger,
    fontWeight: '500',
  },
  resultIndicator: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  trueFalseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  trueButton: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  falseButton: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  trueFalseButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  trueFalseButtonCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: Colors.success,
  },
  trueFalseButtonIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: Colors.danger,
  },
  trueFalseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trueFalseTextSelected: {
    color: '#fff',
  },
  trueFalseTextCorrect: {
    color: Colors.success,
  },
  shortAnswerContainer: {
    marginBottom: 24,
  },
  shortAnswerInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  shortAnswerCorrect: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  shortAnswerIncorrect: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  explanationContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  essayContainer: {
    marginBottom: 24,
  },
  essayInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  essayHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
  },
  reviewExplanation: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewExplanationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  reviewExplanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
});