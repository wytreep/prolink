import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, radius, typography } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  hint,
  icon,
  right,
  containerStyle,
  style,
  secureTextEntry,
  multiline,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={focused ? colors.navy : colors.muted}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          {...rest}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={colors.mutedLight}
          secureTextEntry={hidden}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={8}
            onPress={() => setHidden((prev) => !prev)}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : (
          right
        )}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
    marginLeft: 2,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.ice2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldMultiline: {
    minHeight: 112,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  fieldFocused: {
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  fieldError: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  icon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  hint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    marginLeft: 2,
  },
  error: {
    ...typography.tiny,
    color: colors.redDark,
    marginLeft: 2,
  },
});
