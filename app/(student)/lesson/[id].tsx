// app/(student)/lesson/[id].tsx - FULLY FIXED WITH PLAY BUTTON OVERLAY
import { Colors } from "@/constants/Colors";
import { studentApi } from "@/src/config/studentApi";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

interface Attachment {
  id: number;
  title: string;
  type: string;
  url: string;
  fileSize?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    fullName: string;
    profileImage?: string;
  };
}

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LessonDetail {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  isFree: boolean;
  thumbnail: string;
  courseId: number;
  courseTitle: string;
  teacherName: string;
  teacherImage?: string;
  attachments: Attachment[];
  comments: Comment[];
  quizzes: Quiz[];
  isCompleted: boolean;
  lastPosition: number;
  prevLesson?: { id: number; title: string };
  nextLesson?: { id: number; title: string };
  courseProgress: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{
    isCorrect: boolean;
    explanation?: string;
  } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "resources" | "comments"
  >("overview");
  const [videoError, setVideoError] = useState(false);
  const [userStartedVideo, setUserStartedVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<Video>(null);
  const youtubePlayerRef = useRef<any>(null);
  const progressSaveInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastSavedPosition = useRef(0);
  const isSeeking = useRef(false);

  const loadLessonDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = (await studentApi.getLessonDetail(
        Number(id),
      )) as ApiResponse<LessonDetail>;
      if (response.success && response.data) {
        setLesson(response.data);
        setCurrentTime(response.data.lastPosition || 0);
      } else {
        Alert.alert("خطا", response.message || "درس مورد نظر یافت نشد");
      }
    } catch (err: any) {
      console.error("Error loading lesson:", err);
      Alert.alert("خطا", err?.message || "مشکلی در بارگذاری درس پیش آمد");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadLessonDetail();
    }
  }, [id, loadLessonDetail]);

  const handleSaveProgress = useCallback(
    async (position: number) => {
      try {
        await studentApi.saveLessonProgress(Number(id), Math.floor(position));
        lastSavedPosition.current = position;
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [id],
  );

  // Save progress periodically
  useEffect(() => {
    progressSaveInterval.current = setInterval(() => {
      if (
        currentTime > 0 &&
        !isSeeking.current &&
        currentTime !== lastSavedPosition.current
      ) {
        handleSaveProgress(currentTime);
      }
    }, 15000);

    return () => {
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
        progressSaveInterval.current = null;
      }
      if (currentTime > 0) {
        handleSaveProgress(currentTime);
      }
    };
  }, [currentTime, handleSaveProgress]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (!isSeeking.current) {
        setCurrentTime(status.positionMillis / 1000);
      }
      setDuration(status.durationMillis / 1000);

      if (!lesson?.isCompleted && status.durationMillis > 0) {
        const progress = status.positionMillis / status.durationMillis;
        if (progress >= 0.9) {
          handleComplete();
        }
      }
    }
  };

  const onYouTubeStateChange = useCallback((state: string) => {
    console.log("YouTube state:", state);
    if (state === "ended") {
      handleComplete();
    } else if (state === "playing") {
      setIsPlaying(true);
      setVideoReady(true);
    } else if (state === "paused") {
      setIsPlaying(false);
    } else if (state === "buffering") {
      console.log("Buffering...");
    } else if (state === "unstarted") {
      setVideoReady(false);
    }
  }, []);

  const onYouTubeProgress = useCallback(
    (progress: { currentTime: number; duration: number }) => {
      if (!isSeeking.current && videoReady) {
        setCurrentTime(progress.currentTime);
        setDuration(progress.duration);

        if (!lesson?.isCompleted && progress.duration > 0) {
          const watchProgress = progress.currentTime / progress.duration;
          if (watchProgress >= 0.9) {
            handleComplete();
          }
        }
      }
    },
    [lesson?.isCompleted, videoReady],
  );

  const handleComplete = useCallback(async () => {
    if (lesson?.isCompleted) return;

    try {
      const response = (await studentApi.completeLesson(
        Number(id),
        currentTime,
      )) as ApiResponse<any>;
      if (response.success) {
        Alert.alert("موفقیت", "درس با موفقیت تکمیل شد!");
        loadLessonDetail();
      }
    } catch (err) {
      console.error("Error completing lesson:", err);
    }
  }, [lesson?.isCompleted, id, currentTime, loadLessonDetail]);

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getVideoSource = (url: string) => {
    if (!url) return null;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return { type: "youtube", videoId };
      }
    }

    if (url.match(/\.(mp4|mov|m4v|webm)$/i)) {
      return { type: "video", uri: url };
    }

    return null;
  };

  const videoSource = lesson?.videoUrl ? getVideoSource(lesson.videoUrl) : null;
  const isYouTube = videoSource?.type === "youtube";
  const isDirectVideo = videoSource?.type === "video";

  const handleQuizSubmit = useCallback(async () => {
    if (selectedAnswer === null || !currentQuiz) return;

    try {
      const response = (await studentApi.submitQuizAnswer(
        Number(id),
        currentQuiz.id,
        selectedAnswer,
      )) as ApiResponse<any>;
      if (response.success) {
        setQuizResult({
          isCorrect: response.data?.isCorrect || false,
          explanation: response.data?.explanation || currentQuiz.explanation,
        });
        if (response.data?.isCorrect) {
          setTimeout(() => {
            setShowQuizModal(false);
            setQuizResult(null);
            setSelectedAnswer(null);
            loadLessonDetail();
          }, 2000);
        }
      } else {
        Alert.alert("خطا", response.message || "مشکلی در ثبت پاسخ پیش آمد");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      Alert.alert("خطا", "مشکلی در ثبت پاسخ پیش آمد");
    }
  }, [selectedAnswer, currentQuiz, id, loadLessonDetail]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = (await studentApi.addLessonComment(
        Number(id),
        newComment,
      )) as ApiResponse<any>;
      if (response.success) {
        setNewComment("");
        loadLessonDetail();
      } else {
        Alert.alert("خطا", response.message || "مشکلی در ارسال نظر پیش آمد");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      Alert.alert("خطا", "مشکلی در ارسال نظر پیش آمد");
    } finally {
      setSubmitting(false);
    }
  }, [newComment, id, loadLessonDetail]);

  const handleDownload = useCallback((attachment: Attachment) => {
    if (attachment.url) {
      Linking.openURL(attachment.url).catch(() => {
        Alert.alert("خطا", "قادر به باز کردن فایل نیستید");
      });
    }
  }, []);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>درس مورد نظر یافت نشد</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Player with Play Button Overlay */}
        <View style={styles.videoContainer}>
          {isYouTube && videoSource?.videoId ? (
            <View style={styles.videoWrapper}>
              {!userStartedVideo && (
                <TouchableOpacity
                  style={styles.playOverlay}
                  activeOpacity={0.9}
                  onPress={() => setUserStartedVideo(true)}
                >
                  <View style={styles.playButtonContainer}>
                    <Ionicons name="play-circle" size={70} color="#fff" />
                  </View>
                  <Text style={styles.playText}>برای پخش ویدیو کلیک کنید</Text>
                </TouchableOpacity>
              )}
              <YoutubePlayer
                height={width * 0.56}
                play={userStartedVideo}
                videoId={videoSource.videoId}
                onChangeState={onYouTubeStateChange}
                onProgress={onYouTubeProgress}
                initialPlayerParams={{
                  controls: true,
                  modestbranding: true,
                  rel: false,
                  showinfo: true,
                  cc_load_policy: 0,
                  iv_load_policy: 3,
                  origin: "https://www.youtube.com",
                }}
                webViewProps={{
                  injectedJavaScript: `
                    document.body.style.backgroundColor = '#000';
                    true;
                  `,
                }}
                ref={youtubePlayerRef}
              />
            </View>
          ) : isDirectVideo && !videoError ? (
            <Video
              ref={videoRef}
              source={{ uri: videoSource.uri }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              isLooping={false}
              useNativeControls={true}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onError={() => setVideoError(true)}
              positionMillis={currentTime * 1000}
            />
          ) : (
            <View style={[styles.videoContainer, styles.noVideoContainer]}>
              <Ionicons
                name="videocam-off"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.noVideoText}>
                {videoError
                  ? "خطا در بارگذاری ویدیو"
                  : "ویدیویی برای این درس وجود ندارد"}
              </Text>
            </View>
          )}

          {/* Custom Progress Bar - for direct videos only */}
          {isDirectVideo && !videoError && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Lesson Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>
                {lesson.duration || formatTime(duration)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="person-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>{lesson.teacherName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="book-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>{lesson.courseTitle}</Text>
            </View>
            {lesson.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Text style={styles.completedText}>تکمیل شده</Text>
              </View>
            )}
          </View>

          {/* Course Progress */}
          <View style={styles.courseProgressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>پیشرفت دوره</Text>
              <Text style={styles.progressPercentage}>
                {lesson.courseProgress}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFillCourse,
                  { width: `${lesson.courseProgress}%` },
                ]}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(["overview", "resources", "comments"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === "overview" && "محتوا"}
                  {tab === "resources" &&
                    `منابع (${lesson.attachments.length})`}
                  {tab === "comments" && `نظرات (${lesson.comments.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "overview" && (
              <View>
                <Text style={styles.description}>
                  {lesson.description || "توضیحاتی برای این درس ثبت نشده است."}
                </Text>

                {lesson.quizzes && lesson.quizzes.length > 0 && (
                  <View style={styles.quizzesSection}>
                    <Text style={styles.sectionTitle}>📝 آزمون‌های درس</Text>
                    {lesson.quizzes.map((quiz, index) => (
                      <TouchableOpacity
                        key={quiz.id}
                        style={styles.quizCard}
                        onPress={() => {
                          setCurrentQuiz(quiz);
                          setShowQuizModal(true);
                          setSelectedAnswer(null);
                          setQuizResult(null);
                        }}
                      >
                        <Ionicons
                          name="help-circle"
                          size={24}
                          color={Colors.primary}
                        />
                        <View style={styles.quizInfo}>
                          <Text style={styles.quizTitle}>
                            آزمون {index + 1}
                          </Text>
                          <Text style={styles.quizQuestion}>
                            {quiz.question.substring(0, 50)}...
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === "resources" && (
              <View>
                {!lesson.attachments.length ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="folder-open"
                      size={48}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.emptyStateText}>
                      هیچ منبعی برای این درس وجود ندارد
                    </Text>
                  </View>
                ) : (
                  lesson.attachments.map((attachment) => (
                    <TouchableOpacity
                      key={attachment.id}
                      style={styles.attachmentCard}
                      onPress={() => handleDownload(attachment)}
                    >
                      <View style={styles.attachmentIcon}>
                        <Ionicons
                          name="document-text"
                          size={24}
                          color={Colors.primary}
                        />
                      </View>
                      <View style={styles.attachmentInfo}>
                        <Text style={styles.attachmentTitle}>
                          {attachment.title}
                        </Text>
                        {attachment.fileSize && (
                          <Text style={styles.attachmentSize}>
                            {attachment.fileSize}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name="download-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {activeTab === "comments" && (
              <View>
                <View style={styles.addCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="نظر خود را بنویسید..."
                    placeholderTextColor={Colors.textSecondary}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    textAlign="right"
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      submitting && styles.submitButtonDisabled,
                    ]}
                    onPress={handleAddComment}
                    disabled={submitting || !newComment.trim()}
                  >
                    <Text style={styles.submitButtonText}>ارسال</Text>
                  </TouchableOpacity>
                </View>

                {!lesson.comments.length ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={48}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.emptyStateText}>
                      هنوز نظری ثبت نشده است
                    </Text>
                  </View>
                ) : (
                  lesson.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      <View style={styles.commentAvatar}>
                        {comment.user.profileImage ? (
                          <Image
                            source={{ uri: comment.user.profileImage }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Ionicons
                            name="person-circle"
                            size={40}
                            color={Colors.textSecondary}
                          />
                        )}
                      </View>
                      <View style={styles.commentContent}>
                        <Text style={styles.commentAuthor}>
                          {comment.user.fullName}
                        </Text>
                        <Text style={styles.commentText}>
                          {comment.content}
                        </Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString(
                            "fa-IR",
                          )}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {lesson.prevLesson && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                router.push(`/(student)/lesson/${lesson.prevLesson?.id}`)
              }
            >
              <Ionicons name="arrow-forward" size={20} color={Colors.text} />
              <Text style={styles.navButtonText}>قبلی</Text>
            </TouchableOpacity>
          )}
          {lesson.nextLesson && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={() =>
                router.push(`/(student)/lesson/${lesson.nextLesson?.id}`)
              }
            >
              <Text style={styles.navButtonTextPrimary}>بعدی</Text>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Quiz Modal */}
      <Modal visible={showQuizModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>آزمون</Text>
              <TouchableOpacity onPress={() => setShowQuizModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {quizResult ? (
              <View style={styles.quizResultContainer}>
                <Ionicons
                  name={
                    quizResult.isCorrect ? "checkmark-circle" : "close-circle"
                  }
                  size={60}
                  color={quizResult.isCorrect ? Colors.success : Colors.danger}
                />
                <Text style={styles.quizResultText}>
                  {quizResult.isCorrect
                    ? "پاسخ شما صحیح است!"
                    : "پاسخ شما نادرست است"}
                </Text>
                {quizResult.explanation && (
                  <Text style={styles.quizExplanation}>
                    {quizResult.explanation}
                  </Text>
                )}
              </View>
            ) : (
              currentQuiz && (
                <>
                  <ScrollView style={styles.modalBody}>
                    <Text style={styles.quizQuestionText}>
                      {currentQuiz.question}
                    </Text>
                    {currentQuiz.options.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.quizOption,
                          selectedAnswer === idx && styles.quizOptionSelected,
                        ]}
                        onPress={() => setSelectedAnswer(idx)}
                      >
                        <View style={styles.quizOptionRadio}>
                          {selectedAnswer === idx && (
                            <View style={styles.quizOptionRadioSelected} />
                          )}
                        </View>
                        <Text style={styles.quizOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={[
                      styles.modalSubmitButton,
                      selectedAnswer === null &&
                        styles.modalSubmitButtonDisabled,
                    ]}
                    onPress={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                  >
                    <Text style={styles.modalSubmitButtonText}>ثبت پاسخ</Text>
                  </TouchableOpacity>
                </>
              )
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  videoContainer: {
    width: "100%",
    height: width * 0.56,
    backgroundColor: "#000",
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 8,
  },
  playButtonContainer: {
    marginBottom: 12,
  },
  playText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#fff",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  noVideoText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoContainer: {
    padding: 16,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    color: Colors.success,
  },
  courseProgressContainer: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFillCourse: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text,
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    minHeight: 200,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  quizzesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: 8,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  quizQuestion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: 8,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  attachmentSize: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  addCommentContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: "top",
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 6,
  },
  commentDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 30,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  navButtonTextPrimary: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  quizQuestionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  quizOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quizOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(79, 70, 229, 0.05)",
  },
  quizOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quizOptionRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  quizOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: "center",
  },
  modalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  modalSubmitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quizResultContainer: {
    padding: 40,
    alignItems: "center",
  },
  quizResultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  quizExplanation: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
