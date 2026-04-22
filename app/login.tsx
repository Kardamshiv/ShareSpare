import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return '';
    if (pass.length < 6) return 'Weak';
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    if (pass.length >= 8 && hasUpper && hasSpecial) return 'Strong';
    return 'Medium';
  };

  async function handleAuth() {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email/phone and password.');
      return;
    }

    if (isSignUp) {
      const passwordRegex = /^[A-Z](?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{5,12}$/;
      if (!passwordRegex.test(password)) {
        setErrorMsg('Password must be 6-13 characters long, start with a capital letter, and contain at least one special character.');
        return;
      }
    }

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            initials: email.substring(0, 2).toUpperCase()
          }
        }
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg('Enter correct password');
      } else {
        router.replace('/(tabs)');
      }
    }
    setLoading(false);
  }

  const handleGoogleLogin = () => {
    setErrorMsg('Google login is not yet configured for this environment.');
  };

  const handleForgotPassword = () => {
    setErrorMsg('Forgot password flow is not yet implemented.');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7FAFC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorative Elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🌎</Text>
            </View>
            <Text style={styles.appName}>ShareSphere</Text>
            <Text style={styles.tagline}>
              {isSignUp ? 'Join your community today.' : 'Welcome back! We missed you.'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {errorMsg}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email / Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email or phone"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {isSignUp && password.length > 0 && (
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: getPasswordStrength(password) === 'Strong' ? '#38A169' : getPasswordStrength(password) === 'Medium' ? '#D69E2E' : '#E53E3E',
                marginBottom: 12,
                marginTop: -8,
                marginLeft: 4
              }}>
                Password Strength: {getPasswordStrength(password)}
              </Text>
            )}

            {!isSignUp ? (
              <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            ) : (
                <View style={{ marginBottom: 16 }} />
            )}

            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleAuth} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerBox}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.btnGoogle} 
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.btnGoogleText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}>
              <Text style={styles.footerLink}>
                {isSignUp ? ' Login' : ' Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  bgCircle1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#EBF4FF',
    opacity: 0.8,
  },
  bgCircle2: {
    position: 'absolute',
    top: height * 0.2,
    left: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#E6FFFA',
    opacity: 0.6,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#718096',
    marginTop: 8,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FC8181',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2D3748',
    marginBottom: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    color: '#3182CE',
    fontSize: 13,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#3182CE',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF2F7',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '600',
  },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
  },
  googleIcon: {
    color: '#E53E3E',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  btnGoogleText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: '#3182CE',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});