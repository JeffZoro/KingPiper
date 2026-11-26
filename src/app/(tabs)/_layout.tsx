import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { POLICY_VERSION, useStore } from '@/lib/store';

export default function TabsLayout() {
  const { state } = useStore();
  // Nothing works until the person has passed the age check and agreed to the
  // terms (and re-agreed if the policy changed).
  if (!state.consent || state.consent.version !== POLICY_VERSION) {
    return <Redirect href="/welcome" />;
  }
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
      <Tabs.Screen name="index" options={{ title: 'Translate' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="phrases" options={{ title: 'Phrases' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
