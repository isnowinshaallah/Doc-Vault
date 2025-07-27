import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FileText } from 'lucide-react-native';

export default function LoadingScreen() {
  const router = useRouter();
  const { user, loading, isFirstLaunch } = useAuth();
  const progressAnimation = new Animated.Value(0);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Navigate after loading
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          router.replace('/dashboard');
        } else {
          router.replace('/auth');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FileText size={80} color="#00796B" strokeWidth={2} />
        </View>
        
        <Text style={styles.title}>LOADING</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressWidth }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: '#B2DFDB',
    padding: 24,
    borderRadius: 20,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#00796B',
    marginBottom: 40,
    letterSpacing: 2,
  },
  progressContainer: {
    width: 280,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#B2DFDB',
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00796B',
    borderRadius: 20,
  },
});