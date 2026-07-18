import React, { useState } from 'react';
import { TextInput } from 'react-native';
import inputStyles from "../../styles/inputStyles";
import commonStyles from "../../styles/commonStyles";
export default function AppInput({
  error = false,
  multiline = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const styles = inputStyles;
  const {marginTop, marginBottom} = commonStyles;
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor="#8e8e8e"
      multiline={multiline}
      style={[
        styles.base,
        marginTop(5),
        marginBottom(5),
        multiline && styles.multiline,
        focused && styles.focused,
        error && styles.error,
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
  );
}
