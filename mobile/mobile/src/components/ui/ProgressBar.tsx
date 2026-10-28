import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({
  value,
  color = colors.navy,
  trackColor = colors.ice,
  height = 10,
}: Props) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${safe}%`,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  fill: {
    borderRadius: radius.pill,
  },
});
