export const colors = {
  primary: '#006548',
  primaryLight: '#00754F',
  primaryDark: '#004A36',
  lightGreen: '#E8F5E8',
  text: '#000000',
  textSecondary: '#333333',
  textLight: '#333333',
  darkGrey: '#333333',
  mediumGrey: '#333333',
  lightGrey: '#E0E0E0',
  background: '#FFFFFF',
  backgroundLight: '#F8F9FA',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  white: '#FFFFFF',
  black: '#000000'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    color: colors.text,
    fontFamily: 'Barlow, sans-serif'
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    color: colors.text,
    fontFamily: 'Barlow, sans-serif'
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    color: colors.text,
    fontFamily: 'Barlow, sans-serif'
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
    fontFamily: 'Barlow, sans-serif'
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    color: colors.text
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    color: colors.textSecondary
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
    color: colors.textLight
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 999
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }
};

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440
};