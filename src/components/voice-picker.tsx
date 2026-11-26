import { StyleSheet, View } from 'react-native';

import { DEFAULT_VOICES, type VoiceGender } from '@/lib/voices';
import { color, radius } from '@/theme';
import { Tap } from './pressable';
import { Body } from './text';

export function VoicePicker({ value, onChange, compact }: { value: VoiceGender; onChange: (g: VoiceGender) => void; compact?: boolean }) {
  if (compact) {
    // One chip that flips between the two voices: simpler on a busy screen.
    const next: VoiceGender = value === 'female' ? 'male' : 'female';
    return (
      <Tap
        onPress={() => onChange(next)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value === 'female' }}
        accessibilityLabel={`Voice: ${value === 'female' ? 'female' : 'male'}. Tap to switch to ${next}`}
        style={[styles.opt, styles.compact]}
      >
        <Body size={16}>{value === 'female' ? '♀' : '♂'}</Body>
        <Body bold size={14}>
          {value === 'female' ? 'Female' : 'Male'} voice
        </Body>
      </Tap>
    );
  }
  return (
    <View style={[styles.row, compact && { flex: 0 }]} accessibilityRole="radiogroup" accessibilityLabel="Translation voice">
      {(['female', 'male'] as const).map((g) => {
        const v = DEFAULT_VOICES[g];
        const active = value === g;
        return (
          <Tap
            key={g}
            onPress={() => onChange(g)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`${g === 'female' ? 'Female' : 'Male'} voice, ${v.name}`}
            style={[styles.opt, compact && styles.compact, active && styles.active]}
          >
            <Body size={compact ? 16 : 22} tint={active ? color.ink : color.text}>
              {g === 'female' ? '♀' : '♂'}
            </Body>
            <View>
              <Body bold size={compact ? 14 : 16} tint={active ? color.ink : color.text}>
                {g === 'female' ? 'Female' : 'Male'}
                {compact ? '' : ` · ${v.name}`}
              </Body>
              {compact ? null : (
                <Body size={13} tint={active ? 'rgba(10,10,20,0.7)' : color.textFaint}>
                  {v.blurb}
                </Body>
              )}
            </View>
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  opt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  compact: { minHeight: 48, borderRadius: radius.pill, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', paddingHorizontal: 16 },
  active: { backgroundColor: color.text, borderColor: color.text },
});
