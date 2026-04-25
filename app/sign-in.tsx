import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/AuthContext';
import { campfireTheme } from '@/src/constants/theme';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Sign in</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        <Text style={styles.kicker}>Campfire</Text>
        <Text style={styles.title}>Sign in to post</Text>
        <Text style={styles.subtitle}>
          Use your Campfire credentials. Admin can post on behalf of any campus.
        </Text>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@campfire.app"
            placeholderTextColor={campfireTheme.colors.mutedInk}
            style={styles.input}
            value={email}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={campfireTheme.colors.mutedInk}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={onSubmit}
            style={[styles.submit, !canSubmit && styles.submitDisabled]}>
            <Text style={styles.submitText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.replace('/sign-up');
            }}
            style={styles.signUpLink}>
            <Text style={styles.signUpText}>
              No account? <Text style={styles.signUpAction}>Sign up with school email</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: campfireTheme.colors.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: campfireTheme.colors.ink },
  body: { flex: 1, padding: 24, gap: 8 },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.lavender,
    color: campfireTheme.colors.black,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textTransform: 'uppercase',
    overflow: 'hidden',
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '900', color: campfireTheme.colors.ink, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 14,
    color: campfireTheme.colors.mutedInk,
    lineHeight: 20,
    marginBottom: 16,
  },
  form: { gap: 8, marginTop: 8 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: campfireTheme.colors.mutedInk,
    marginTop: 8,
  },
  input: {
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: campfireTheme.colors.ink,
  },
  error: { color: campfireTheme.colors.emberRed, fontSize: 13, marginTop: 4 },
  submit: {
    marginTop: 16,
    backgroundColor: campfireTheme.colors.hotPink,
    borderRadius: campfireTheme.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: campfireTheme.colors.border },
  submitText: { color: campfireTheme.colors.card, fontSize: 16, fontWeight: '900' },
  signUpLink: { marginTop: 18, alignItems: 'center' },
  signUpText: {
    fontSize: 13,
    color: campfireTheme.colors.mutedInk,
    fontWeight: '600',
  },
  signUpAction: {
    color: campfireTheme.colors.hotPink,
    fontWeight: '900',
  },
});
