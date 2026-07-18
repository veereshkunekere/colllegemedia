import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import {Color} from "../../theme/colors";
export default function LoadingSpinner({ size = 'small', fullscreen = false }) {

  if (fullscreen) {
    return (
      <View style={[styles.fullscreen, { backgroundColor: Colors.light.background }]}>
        <ActivityIndicator size={size} color={Colors.light.accent} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={Colors.light.accent} />;
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
