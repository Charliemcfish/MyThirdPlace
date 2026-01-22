import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  containerPadded: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  maxWidthContainer: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },

  maxWidthContainerPadded: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    padding: spacing.md,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
    marginVertical: spacing.sm,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  
  buttonTextSecondary: {
    ...typography.button,
    color: colors.primary,
  },
  
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  
  successText: {
    color: colors.success,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  
  heading1: typography.h1,
  heading2: typography.h2,
  heading3: typography.h3,
  heading4: typography.h4,
  bodyText: typography.body1,
  captionText: typography.caption,
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  marginTop: {
    marginTop: spacing.md,
  },
  
  marginBottom: {
    marginBottom: spacing.md,
  },
  
  marginVertical: {
    marginVertical: spacing.md,
  },
  
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  
  headerContainer: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  
  headerText: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
  }
});