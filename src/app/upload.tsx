import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function UploadPhotoScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // For web, use file picker
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setProfileImage(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // For mobile
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <Text style={styles.stepText}>STEP 2 OF 4</Text>

      {/* Title */}
      <Text style={styles.title}>Upload Your Photo</Text>
      <Text style={styles.subtitle}>
        Help our AI see how jewelry looks on{'\n'}
        you with a clear selfie.
      </Text>

      {/* Profile Picture Circle - Click to add */}
      <TouchableOpacity style={styles.profileWrapper} onPress={pickImage} activeOpacity={0.8}>
        <View style={styles.profileCircle}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.emptyCircle} />
          )}
          {/* Plus button at bottom right corner */}
          <View style={styles.plusButton}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Guidelines Section */}
      <Text style={styles.guidelinesTitle}>GUIDELINES FOR BEST RESULTS</Text>

      <View style={styles.guidelinesContainer}>
        {/* Guideline 1 */}
        <View style={styles.guidelineItem}>
          <Text style={styles.bulletPoint}>●</Text>
          <View style={styles.guidelineTextContainer}>
            <Text style={styles.guidelineSubtitle}>Bright & Natural Light</Text>
            <Text style={styles.guidelineDesc}>
              Stand facing a window or a well-lit area to avoid shadows on your face.
            </Text>
          </View>
        </View>

        {/* Guideline 2 */}
        <View style={styles.guidelineItem}>
          <Text style={styles.bulletPoint}>●</Text>
          <View style={styles.guidelineTextContainer}>
            <Text style={styles.guidelineSubtitle}>Neutral Expression</Text>
            <Text style={styles.guidelineDesc}>
              Keep your hair tucked behind ears and maintain a gentle, natural look.
            </Text>
          </View>
        </View>

        {/* Guideline 3 */}
        <View style={styles.guidelineItem}>
          <Text style={styles.bulletPoint}>●</Text>
          <View style={styles.guidelineTextContainer}>
            <Text style={styles.guidelineSubtitle}>Eye-Level Shot</Text>
            <Text style={styles.guidelineDesc}>
              Hold your phone straight. Ensure your forehead and neck are visible.
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => router.replace('./style')}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Privacy Note */}
      <Text style={styles.privacyNote}>
        Your photo is only used for virtual try-on and is never shared with third parties.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 24,
    paddingTop: 50,
  },

  stepText: {
    fontSize: 12,
    color: '#FF6B8A',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2F343A',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

  profileWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },

  profileCircle: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: '#DDD',
    overflow: 'hidden',
    position: 'relative',
  },

  emptyCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  plusButton: {
    position: 'absolute',
    bottom: 20   ,
    right: 18,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#FF6B8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F4F4',
  },

  plusIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  guidelinesTitle: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 16,
    fontWeight: '500',
  },

  guidelinesContainer: {
    marginBottom: 40,
    gap: 20,
  },

  guidelineItem: {
    flexDirection: 'row',
    gap: 12,
  },

  bulletPoint: {
    fontSize: 14,
    color: '#FF6B8A',
    marginTop: 2,
  },

  guidelineTextContainer: {
    flex: 1,
  },

  guidelineSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F343A',
    marginBottom: 4,
  },

  guidelineDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },

  continueButton: {
    backgroundColor: '#FF6B8A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  privacyNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#aaa',
    lineHeight: 16,
  },
});