import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function CameraOnboardingScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take a photo for virtual try-on.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: requestCameraPermission },
        ]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Auto navigate to next step after photo is taken
      setTimeout(() => {
        router.replace('/upload');
      }, 500);
    }
  };

  const skipForNow = () => {
    router.replace('/upload');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 4</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressActive} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* CLICKABLE CARD - Take Photo */}
      <TouchableOpacity style={styles.card} onPress={takePhoto} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.selectedImage} />
        ) : (
          <Image
            source={{
              uri: 'https://www.citypng.com/public/uploads/preview/hd-camera-orange-icon-png-7017516950335973hxmnvxspa.png',
            }}
            style={styles.cameraImage}
          />
        )}

        <View style={styles.sparkleTop}>
          <Text>✨</Text>
        </View>

        <View style={styles.sparkleBottom}>
          <Text>⚡</Text>
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Let's Personalize Your</Text>
      <Text style={styles.highlight}>Style Hub</Text>

      {/* Description */}
      <Text style={styles.desc}>
        To see jewelry on yourself, we'll need a quick photo. Our AI uses this
        to match the perfect earrings and necklaces to your features.
      </Text>

      {/* Privacy */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>🔒 Your Privacy Matters</Text>
        <Text style={styles.privacyText}>
          Photos are processed locally for AI try-on and never shared without
          your permission
        </Text>
      </View>

      {/* Button - Enable Camera */}
      <TouchableOpacity style={styles.enableButton} onPress={takePhoto}>
        <Text style={styles.buttonText}>Enable Camera →</Text>
      </TouchableOpacity>

      {/* Later Button */}
      <TouchableOpacity style={styles.laterButton} onPress={skipForNow}>
        <Text style={styles.laterButtonText}>I'll do this later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    alignItems: 'center',
    marginBottom: 10,
  },

  step: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B8A',
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 6,
  },

  progressActive: {
    width: 24,
    height: 4,
    backgroundColor: '#FF6B8A',
    borderRadius: 2,
  },

  progressDot: {
    width: 6,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },

  card: {
    height: 380,
    borderRadius: 24,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
  },

  cameraImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
  },

  sparkleTop: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  sparkleBottom: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
  },

  highlight: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#FF6B8A",
    marginBottom: 15,
  },

  desc: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  privacyBox: {
    borderWidth: 1,
    borderColor: "#CFC6FF",
    backgroundColor: "#F7F5FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  privacyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  privacyText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },

  enableButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  laterButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  laterButtonText: {
    color: '#999',
    fontWeight: '500',
    fontSize: 15,
  },
});