import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Tap } from '@/components/pressable';
import { Screen } from '@/components/screen';
import { Body, Display } from '@/components/text';
import { EFFECTIVE_DATE, PRIVACY, TERMS } from '@/lib/legal';
import { color, touch } from '@/theme';

export default function LegalDoc() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const isTerms = doc === 'terms';
  const sections = isTerms ? TERMS : PRIVACY;
  return (
    <Screen tabs={false} tone="calm">
      <View style={styles.top}>
        <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityLabel="Close" style={styles.close}>
          <Body bold size={18}>
            ✕
          </Body>
        </Tap>
      </View>
      <Display size={34}>{isTerms ? 'Terms of Use' : 'Privacy Policy'}</Display>
      <Body faint size={13} style={{ marginTop: 6 }}>
        Effective {EFFECTIVE_DATE}
      </Body>
      {sections.map((s) => (
        <View key={s.h} style={{ marginTop: 24 }}>
          <Body bold size={17} accessibilityRole="header">
            {s.h}
          </Body>
          {s.p.map((p, i) => (
            <Body key={i} dim style={{ marginTop: 8 }}>
              {p}
            </Body>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  close: { width: touch, height: touch, borderRadius: touch / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surfaceHi },
});
