import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { color, radius } from '@/theme';
import { Tap } from './pressable';
import { Body } from './text';

export function Check({ checked, onToggle, children, label }: { checked: boolean; onToggle: () => void; children: React.ReactNode; label: string }) {
  return (
    <Tap
      onPress={onToggle}
      depth={0.98}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.on]}>
        {checked ? (
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d="m5 12.5 4.5 4.5L19 7" stroke={color.ink} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <Body dim>{children}</Body> : children}</View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 10, minHeight: 48 },
  box: {
    width: 26,
    height: 26,
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    borderColor: color.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  on: { backgroundColor: color.coral, borderColor: color.coral },
});
