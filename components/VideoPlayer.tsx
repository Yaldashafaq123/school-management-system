// components/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * (9 / 16);

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  onProgress,
  onComplete,
  autoPlay = false,
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showControls) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handlePlayPause = async () => {
    if (status?.isLoaded) {
      if (status.isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (status?.isLoaded) {
      await videoRef.current?.setPositionAsync(value * 1000);
    }
  };

  const handleFullscreen = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.presentFullscreenPlayer();
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);

    if (playbackStatus.isLoaded) {
      setLoading(false);
      setIsBuffering(playbackStatus.isBuffering);

      if (playbackStatus.didJustFinish && onComplete) {
        onComplete();
      }

      if (onProgress && playbackStatus.positionMillis && playbackStatus.durationMillis) {
        const progress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
        onProgress(progress);
      }
    }

    if (playbackStatus.error) {
      setError('خطا در پخش ویدیو');
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}>تلاش مجدد</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => setShowControls(!showControls)}
    >
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUrl }}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay={autoPlay}
        isLooping={false}
        posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
        posterStyle={styles.poster}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {isBuffering && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.bufferingText}>در حال بارگذاری...</Text>
        </View>
      )}

      {showControls && status?.isLoaded && (
        <>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topGradient}
          />

          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.bottomGradient}
          />

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Ionicons
                name={status.isPlaying ? 'pause' : 'play'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(status.positionMillis || 0)}
              </Text>
              
              <Slider
                style={styles.slider}
                value={status.positionMillis ? status.positionMillis / 1000 : 0}
                maximumValue={status.durationMillis ? status.durationMillis / 1000 : 0}
                minimumValue={0}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={Colors.primary}
              />
              
              <Text style={styles.timeText}>
                {formatTime(status.durationMillis || 0)}
              </Text>
            </View>

            <TouchableOpacity style={styles.controlButton} onPress={handleFullscreen}>
              <Ionicons name="expand" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {!showControls && !loading && (
        <TouchableOpacity
          style={styles.centerPlayButton}
          onPress={handlePlayPause}
        >
          <Ionicons
            name={status?.isLoaded && status.isPlaying ? 'pause-circle' : 'play-circle'}
            size={60}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  bufferingOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bufferingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});