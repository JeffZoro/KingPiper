import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGES, type Language } from '@/lib/languages';
import { color, font, radius, touch } from '@/theme';
import { Tap } from './pressable';
import { Body, Display } from './text';

type Props = {
  visible: boolean;
  title: string;
  selected: string;
  exclude?: string;
  onPick: (code: string) => void;
  onClose: () => void;
};

export function LanguagePicker({ visible, title, selected, exclude, onPick, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const list = LANGUAGES.filter(
    (l) => l.code !== exclude && (q === '' || `${l.name} ${l.native}`.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close language list" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} accessibilityViewIsModal>
        <View style={styles.grabber} />
        <Display size={26} style={{ marginBottom: 14 }}>
          {title}
        </Display>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search languages"
          placeholderTextColor={color.textFaint}
          style={styles.search}
          accessibilityLabel="Search languages"
          autoCorrect={false}
        />
        <FlatList
          data={list}
          keyExtractor={(l) => l.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Row
              lang={item}
              active={item.code === selected}
              onPress={() => {
                onPick(item.code);
                setQ('');
                onClose();
              }}
            />
          )}
        />
      </View>
    </Modal>
  );
}

function Row({ lang, active, onPress }: { lang: Language; active: boolean; onPress: () => void }) {
  return (
    <Tap
      onPress={onPress}
      depth={0.98}
      accessibilityLabel={lang.name}
      accessibilityState={{ selected: active }}
      style={[styles.row, active && styles.rowActive]}
    >
      <Body size={26}>{lang.flag}</Body>
      <View style={{ flex: 1 }}>
        <Body bold>{lang.name}</Body>
        <Body faint size={14}>
          {lang.native}
        </Body>
      </View>
      {active ? <Body tint={color.coral} bold>✓</Body> : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.lineStrong, marginBottom: 16 },
  search: {
    minHeight: touch,
    borderRadius: radius.md,
    backgroundColor: color.surfaceHi,
    color: color.text,
    paddingHorizontal: 16,
    fontFamily: font.body,
    fontSize: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingHorizontal: 12, borderRadius: radius.md },
  rowActive: { backgroundColor: 'rgba(255,107,91,0.12)' },
});
