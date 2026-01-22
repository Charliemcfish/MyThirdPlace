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
import { registerUser } from '../../services/auth';
import { createUserProfile } from '../../services/user';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateDisplayName,
  getAuthErrorMessage 
} from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const displayNameValidation = validateDisplayName(formData.displayName);
    if (!displayNameValidation.isValid) {
      newErrors.displayName = displayNameValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await registerUser(
        formData.email, 
        formData.password, 
        formData.displayName
      );
      
      await createUserProfile(userCredential.user.uid, {
        email: formData.email,
        displayName: formData.displayName
      });

      // User is automatically signed in after successful registration
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Registration Error', getAuthErrorMessage(error.code));
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
          <Text style={globalStyles.headerText}>Join MyThirdPlace</Text>
          <Text style={[globalStyles.captionText, { color: colors.white, textAlign: 'center', marginTop: 8 }]}>
            Start discovering your local community
          </Text>
        </View>

        <View style={[globalStyles.formContainer, { marginTop: 32 }]}>
          <Text style={[globalStyles.heading3, { textAlign: 'center', marginBottom: 24 }]}>
            Create Account
          </Text>

          <TextInput
            style={[
              globalStyles.input,
              errors.displayName && { borderColor: colors.error }
            ]}
            placeholder="Display Name"
            value={formData.displayName}
            onChangeText={(value) => updateFormData('displayName', value)}
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.displayName && <Text style={globalStyles.errorText}>{errors.displayName}</Text>}

          <TextInput
            style={[
              globalStyles.input,
              errors.email && { borderColor: colors.error }
            ]}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
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
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            autoComplete="new-password"
          />
          {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}

          <TextInput
            style={[
              globalStyles.input,
              errors.confirmPassword && { borderColor: colors.error }
            ]}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
            autoComplete="new-password"
          />
          {errors.confirmPassword && <Text style={globalStyles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity
            style={[globalStyles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={[globalStyles.row, { justifyContent: 'center', marginTop: 24 }]}>
            <Text style={globalStyles.bodyText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={globalStyles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;