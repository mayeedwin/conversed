/**
 * Conversed Design System Tokens
 *
 * Developers can pass a single `primaryColor` or individual token overrides.
 */
export interface ConversedThemeTokens {
  /** Primary brand accent color as a hex string (e.g. "#0071e3") */
  primaryColor?: string;
  /** Primary text color */
  textColor?: string;
  /** Secondary subtle text color */
  textMutedColor?: string;
  /** Component card/container background */
  cardBg?: string;
  /** Component border color */
  borderColor?: string;
  /** Component border radius (e.g. "12px", "0.75rem") */
  borderRadius?: string;
  /** Font family stack */
  fontFamily?: string;
}

/**
 * iOS-inspired neutral gray ramp (50 → 900), mapped from Apple's systemGray
 * scale. `--conversed-gray-200` is the default border shade.
 */
export const CONVERSED_GRAY = {
  50: '#f9f9fb',
  100: '#f2f2f7',
  200: '#e5e5ea',
  300: '#d1d1d6',
  400: '#c7c7cc',
  500: '#aeaeb2',
  600: '#8e8e93',
  700: '#636366',
  800: '#48484a',
  900: '#1c1c1e'
} as const;

export const generateCssVariables = (theme?: ConversedThemeTokens): Record<string, string> => {
  const primary = theme?.primaryColor || '#0071e3';

  return {
    '--conversed-primary': primary,
    '--conversed-primary-alpha15': `${primary}26`,
    '--conversed-primary-alpha30': `${primary}4d`,
    '--conversed-gray-50': CONVERSED_GRAY[50],
    '--conversed-gray-100': CONVERSED_GRAY[100],
    '--conversed-gray-200': CONVERSED_GRAY[200],
    '--conversed-gray-300': CONVERSED_GRAY[300],
    '--conversed-gray-400': CONVERSED_GRAY[400],
    '--conversed-gray-500': CONVERSED_GRAY[500],
    '--conversed-gray-600': CONVERSED_GRAY[600],
    '--conversed-gray-700': CONVERSED_GRAY[700],
    '--conversed-gray-800': CONVERSED_GRAY[800],
    '--conversed-gray-900': CONVERSED_GRAY[900],
    '--conversed-text': theme?.textColor || 'inherit',
    '--conversed-text-muted': theme?.textMutedColor || CONVERSED_GRAY[600],
    '--conversed-card-bg': theme?.cardBg || 'transparent',
    '--conversed-border-color': theme?.borderColor || CONVERSED_GRAY[200],
    '--conversed-radius': theme?.borderRadius || '8px',
    '--conversed-font-family': theme?.fontFamily || 'inherit'
  };
};

export const getCssStyleString = (theme?: ConversedThemeTokens): string => {
  const vars = generateCssVariables(theme);
  return Object.entries(vars)
    .map(([key, val]) => `${key}: ${val};`)
    .join(' ');
};
