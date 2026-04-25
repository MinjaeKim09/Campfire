import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

import {
  schoolColors,
  schoolDomains,
  schoolFromEmail,
  type School,
} from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';
import { supabase } from '@/src/lib/supabase';

type Step = 'form' | 'code';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inferredSchool: School | null = useMemo(() => schoolFromEmail(email), [email]);

  const canSubmitForm =
    email.trim().length > 0 &&
    password.length >= 6 &&
    inferredSchool !== null &&
    !busy;

  const handleSendCode = async () => {
    setError(null);
    if (!inferredSchool) {
      setError('Use an .edu email from a supported school.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep('code');
  };

  const handleVerify = async () => {
    setError(null);
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'signup',
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleResend = async () => {
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.resend({
      email: email.trim().toLowerCase(),
      type: 'signup',
    });
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={10}
          onPress={() => (step === 'code' ? setStep('form') : router.back())}
          style={styles.headerBtn}>
          <Ionicons
            name={step === 'code' ? 'chevron-back' : 'close'}
            size={22}
            color={campfireTheme.colors.ink}
          />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 'form' ? 'Sign up' : 'Verify email'}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {step === 'form' ? (
        <View style={styles.body}>
          <Text style={styles.brand}>Campfire</Text>
          <Text style={styles.title}>Use your school email.</Text>
          <Text style={styles.subtitle}>
            We support .edu emails from these schools:
          </Text>

          <View style={styles.domainList}>
            {schoolDomains.map(({ suffix, school }) => {
              const c = schoolColors[school];
              return (
                <View key={suffix} style={[styles.domainPill, { backgroundColor: c.bg }]}>
                  <Text style={[styles.domainText, { color: c.fg }]}>
                    {school}  ·  @{suffix}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>School email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@nyu.edu"
            placeholderTextColor={campfireTheme.colors.mutedInk}
            style={styles.input}
            value={email}
          />

          {email.length > 0 && (
            <View style={styles.inferredRow}>
              {inferredSchool ? (
                (() => {
                  const c = schoolColors[inferredSchool];
                  return (
                    <View style={[styles.inferredPill, { backgroundColor: c.bg }]}>
                      <Ionicons name="school-outline" size={14} color={c.fg} />
                      <Text style={[styles.inferredText, { color: c.fg }]}>
                        {inferredSchool}
                      </Text>
                    </View>
                  );
                })()
              ) : (
                <Text style={styles.inferredBad}>
                  Not a supported school email.
                </Text>
              )}
            </View>
          )}

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={campfireTheme.colors.mutedInk}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={!canSubmitForm}
            onPress={handleSendCode}
            style={[styles.submit, !canSubmitForm && styles.submitDisabled]}>
            <Text style={styles.submitText}>
              {busy ? 'Sending code…' : 'Send verification code'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{' '}
            <Text style={{ fontWeight: '900', color: campfireTheme.colors.ink }}>{email}</Text>.
            It expires in 1 hour.
          </Text>

          <Text style={styles.fieldLabel}>Verification code</Text>
          <TextInput
            autoComplete="one-time-code"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
            placeholder="123456"
            placeholderTextColor={campfireTheme.colors.mutedInk}
            style={[styles.input, styles.codeInput]}
            value={code}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={busy || code.length < 6}
            onPress={handleVerify}
            style={[styles.submit, (busy || code.length < 6) && styles.submitDisabled]}>
            <Text style={styles.submitText}>{busy ? 'Verifying…' : 'Verify'}</Text>
          </Pressable>

          <Pressable disabled={busy} onPress={handleResend} style={styles.resendBtn}>
            <Text style={styles.resendText}>Didn't get it? Resend code</Text>
          </Pressable>
        </View>
      )}
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
  brand: {
    fontFamily: 'BagelFatOne_400Regular',
    fontSize: 44,
    color: '#F36907',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: campfireTheme.colors.mutedInk,
    lineHeight: 20,
    marginBottom: 12,
  },
  domainList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  domainPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: campfireTheme.radius.pill,
  },
  domainText: { fontSize: 11, fontWeight: '800' },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: campfireTheme.colors.mutedInk,
    marginTop: 12,
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
  codeInput: {
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '900',
  },
  inferredRow: { marginTop: 8 },
  inferredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: campfireTheme.radius.pill,
  },
  inferredText: { fontSize: 13, fontWeight: '900' },
  inferredBad: {
    color: campfireTheme.colors.emberRed,
    fontSize: 13,
    fontWeight: '700',
  },
  error: { color: campfireTheme.colors.emberRed, fontSize: 13, marginTop: 8 },
  submit: {
    marginTop: 18,
    backgroundColor: campfireTheme.colors.hotPink,
    borderRadius: campfireTheme.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: campfireTheme.colors.border },
  submitText: { color: campfireTheme.colors.card, fontSize: 16, fontWeight: '900' },
  resendBtn: { marginTop: 14, alignItems: 'center' },
  resendText: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 13,
    fontWeight: '700',
  },
});
