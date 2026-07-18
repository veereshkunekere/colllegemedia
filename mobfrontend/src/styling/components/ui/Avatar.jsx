import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from "../../theme/colors";
/**
 * Consolidates the avatar pattern duplicated (with different sizes) across:
 * search.jsx, profile/[profileId].jsx, chat/[id].jsx, PostCard, ConversationCard,
 * commentBottomSheet, CommentSheetProvider.
 */
export default function Avatar({ uri, name = '?', size = 42, backgroundColor }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?';

  const dimStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return <Image source={{ uri }} style={[dimStyle,{overflow: 'hidden'}]} />;
  }

  return (
    <View
      style={[
        dimStyle,
        styles.placeholder,
        { backgroundColor: backgroundColor ?? Colors.light.backgroundElement },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.4, color: Colors.light.text }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '700',
  },
});
