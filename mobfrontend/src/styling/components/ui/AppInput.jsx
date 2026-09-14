import React, { useState } from 'react';
import { TextInput } from 'react-native';
import inputStyles from "../../styles/inputStyles";
import commonStyles from "../../styles/commonStyles";
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default function AppInput({
  error = false,
  multiline = false,
  secureTextEntry = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const styles = inputStyles;
  const {marginTop, marginBottom} = commonStyles;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
    style={{ position: 'relative'}}
    >
    <TextInput
      placeholderTextColor="#8e8e8e"
      multiline={multiline}
      secureTextEntry={secureTextEntry && !showPassword}
      style={[
        styles.base,
        marginTop(5),
        marginBottom(5),
        multiline && styles.multiline,
        focused && styles.focused,
        error && styles.error,
        {paddingRight: secureTextEntry ? 40 : 10}, // Add padding to the right if secureTextEntry is true
        style,
      ]}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
    {secureTextEntry && (
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
          style={{
        position: 'absolute',
        right: 15,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        < Ionicons 
         name={showPassword ? 'eye-off-outline' : 'eye-outline'}
         size={22}
         color="#8e8e8e"
        />

      </TouchableOpacity>
    )}
    </View>
  );
}
