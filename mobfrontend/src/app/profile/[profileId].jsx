import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserById } from '../../services/profileService';
import { createOrGetConversation } from '../../services/messageService';
import { useChatStore } from '../../store/chatStore';
export default function ProfilePage() {
  const { profileId } = useLocalSearchParams();
  console.log('ProfilePage profileId:', profileId);
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profileId) return;

    const loadProfile = async (id) => {
      try {
        setLoading(true);
        const user = await getUserById(id);
        setProfile(user);
      } catch (err) {
        console.error('loadProfile error', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile(profileId);
  }, [profileId]);

  const handleMessage = async () => {
    try {
      const conversation = await createOrGetConversation(profileId);

      useChatStore.setState((state) => ({
        activeConversation: conversation,
      }));

      router.push({
        pathname: `/chat/${conversation._id}`,
      });
    } catch (err) {
      console.error('message button error', err);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (error)
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );

  if (!profile) return null;

  return (
    <View style={styles.container}>
      {profile.profilePicture ? (
        <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarLetter}>{profile.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}

      <Text style={styles.username}>{profile.username}</Text>
      {profile.role && <Text style={styles.role}>{profile.role}</Text>}
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: '#666' },
  username: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  role: { fontSize: 14, color: '#666', marginBottom: 6 },
  bio: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 12 },
  messageButton: { marginTop: 12, backgroundColor: '#007bff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  messageButtonText: { color: 'white', fontWeight: '700' },
});
