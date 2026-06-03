// components/YouTubePlayer.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * (9 / 16);

interface YouTubePlayerProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onProgress,
  onComplete,
  autoPlay = false,
}) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playing && duration > 0) {
        const progress = (currentTime / duration) * 100;
        if (onProgress && progress <= 100) {
          onProgress(progress);
        }

        // Check if video is near completion
        if (duration - currentTime < 2 && onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, currentTime, duration, onProgress, onComplete]);

  const handleStateChange = (state: string) => {
    switch (state) {
      case 'ended':
        setPlaying(false);
        if (onComplete) {
          onComplete();
        }
        break;
      case 'playing':
        setPlaying(true);
        setLoading(false);
        break;
      case 'paused':
        setPlaying(false);
        break;
      case 'buffering':
        setLoading(true);
        break;
      case 'unstarted':
        setLoading(false);
        break;
    }
  };

  const handleError = (error: string) => {
    setError('خطا در بارگذاری ویدیو');
    setLoading(false);
    console.error('YouTube player error:', error);
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <YoutubePlayer
        height={VIDEO_HEIGHT}
        width={width}
        videoId={videoId}
        play={playing}
        onChangeState={handleStateChange}
        onError={handleError}
        initialPlayerParams={{
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          cc_load_policy: 0,
        }}
        webViewStyle={styles.webView}
        webViewProps={{
          allowsFullscreenVideo: true,
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});