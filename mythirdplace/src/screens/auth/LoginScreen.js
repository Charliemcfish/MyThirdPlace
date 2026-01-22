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
import { loginUser } from '../../services/auth';
import { validateEmail } from '../../utils/validation';
import { getAuthErrorMessage } from '../../utils/validation';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      // Navigate to home after successful login
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Error', getAuthErrorMessage(error.code));
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
          <Text style={globalStyles.headerText}>Welcome to MyThirdPlace</Text>
          <Text style={[globalStyles.captionText, { color: colors.white, textAlign: 'center', marginTop: 8 }]}>
            Connect with your local community spaces
          </Text>
        </View>

        <View style={[globalStyles.formContainer, { marginTop: 32 }]}>
          <Text style={[globalStyles.heading3, { textAlign: 'center', marginBottom: 24 }]}>
            Sign In
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

          <TextInput
            style={[
              globalStyles.input,
              errors.password && { borderColor: colors.error }
            ]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}

          <TouchableOpacity
            style={[globalStyles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPassword')}
            style={{ marginTop: 16 }}
          >
            <Text style={[globalStyles.link, globalStyles.textCenter]}>
              Forgot your password?
            </Text>
          </TouchableOpacity>

          <View style={[globalStyles.row, { justifyContent: 'center', marginTop: 24 }]}>
            <Text style={globalStyles.bodyText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={globalStyles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;