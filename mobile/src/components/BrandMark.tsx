import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors, shadow } from '@/theme';

export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.28 },
      ]}
    >
      <Ionicons name="link" size={size * 0.48} color={colors.white} />
      <View
        style={[
          styles.dot,
          {
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: size * 0.08,
            right: size * 0.12,
            top: size * 0.12,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.orange,
  },
});
