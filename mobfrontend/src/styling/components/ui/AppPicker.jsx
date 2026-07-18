import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { Colors } from "../../theme";
import pickerStyles from "../../styles/pickerStyle";

export default function AppPicker({
  label,
  value,
  onValueChange,
  items = [],
  placeholder = "Select",
  enabled = true,
  error = false,
  helperText,
  style,
}) {
  return (
    <View style={style}>
      {label && (
        <Text style={pickerStyles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          pickerStyles.container,
          error && pickerStyles.error,
          !enabled && pickerStyles.disabled,
        ]}
      >
        <Picker
          selectedValue={value}
          enabled={enabled}
          onValueChange={onValueChange}
          dropdownIconColor={Colors.text}
          style={pickerStyles.picker}
        >
          <Picker.Item
            label={placeholder}
            value={null}
            color={Colors.textMuted}
          />

          {items.map((item) => (
            <Picker.Item
              key={item.value.toString()}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      {helperText ? (
        <Text
          style={[
            pickerStyles.helper,
            error && pickerStyles.helperError,
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}