import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { maxWidth } from '@/theme';
import { Aurora } from './aurora';

export const TAB_BAR_SPACE = 110;

/** Standard screen: aurora backdrop, safe areas, centred column on wide screens. */
export function Screen({
  children,
  scroll = true,
  tone,
  tabs = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  tone?: 'warm' | 'cool' | 'calm';
  tabs?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 12, paddingBottom: (tabs ? TAB_BAR_SPACE : 24) + insets.bottom };
  return (
    <View style={styles.root}>
      <Aurora tone={tone} />
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, pad]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, pad, { flex: 1 }]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: 20 },
});
