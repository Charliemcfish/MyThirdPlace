import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { resetPassword } from '../../services/auth';
import { validateEmail, getAuthErrorMessage } from '../../utils/validation';

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Reset Error', getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={globalStyles.centeredContainer}>
        <View style={globalStyles.headerContainer}>
          <Text style={globalStyles.headerText}>Reset Password</Text>
          <Text style={[globalStyles.captionText, { color: colors.white, textAlign: 'center', marginTop: 8 }]}>
            Enter your email to receive reset instructions
          </Text>
        </View>

        <View style={[globalStyles.formContainer, { marginTop: 32 }]}>
          {!emailSent ? (
            <>
              <Text style={[globalStyles.heading3, { textAlign: 'center', marginBottom: 24 }]}>
                Forgot Password?
              </Text>

              <Text style={[globalStyles.bodyText, { textAlign: 'center', marginBottom: 24 }]}>
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <TextInput
                style={[
                  globalStyles.input,
                  errors.email && { borderColor: colors.error }
                ]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}

              <TouchableOpacity
                style={[globalStyles.button, loading && { opacity: 0.6 }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={globalStyles.buttonText}>Send Reset Email</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[globalStyles.heading3, { textAlign: 'center', marginBottom: 24 }]}>
                Email Sent!
              </Text>

              <Text style={[globalStyles.bodyText, { textAlign: 'center', marginBottom: 24 }]}>
                We've sent password reset instructions to {email}
              </Text>

              <Text style={[globalStyles.captionText, { textAlign: 'center', marginBottom: 24 }]}>
                Check your email and follow the instructions to reset your password. 
                Don't forget to check your spam folder.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 24 }}
          >
            <Text style={[globalStyles.link, globalStyles.textCenter]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;