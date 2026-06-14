import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserById } from '../../services/profileService';
import { createOrGetConversation } from '../../services/messageService';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
export default function Profile() {
  const router = useRouter();


  const  profile  = useAuthStore((state) => state.user);

  if (!profile) return <ActivityIndicator style={{ flex: 1 }} />;

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
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
  },
   avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 18,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#DFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarLetter: {
    fontSize: 38,
    fontWeight: '700',
    color: '#147D65',
  },

  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 6,
  },

  role: {
    fontSize: 15,
    color: '#8A8A96',
    marginBottom: 12,
  },

  bio: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
});
