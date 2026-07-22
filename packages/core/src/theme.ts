/**
 * Conversed Design System Tokens
 *
 * Developers can pass a single `primaryColor` or individual token overrides.
 */
export interface ConversedThemeTokens {
  /** Primary brand accent color (e.g. "#6366f1" or "hsl(243, 75%, 59%)") */
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

export const generateCssVariables = (theme?: ConversedThemeTokens): Record<string, string> => {
  const primary = theme?.primaryColor || '#6366f1';

  return {
    '--conversed-primary': primary,
    '--conversed-primary-alpha15': `${primary}26`,
    '--conversed-primary-alpha30': `${primary}4d`,
    '--conversed-text': theme?.textColor || 'inherit',
    '--conversed-text-muted': theme?.textMutedColor || 'rgba(255, 255, 255, 0.6)',
    '--conversed-card-bg': theme?.cardBg || 'rgba(255, 255, 255, 0.04)',
    '--conversed-border-color': theme?.borderColor || 'rgba(255, 255, 255, 0.1)',
    '--conversed-radius': theme?.borderRadius || '12px',
    '--conversed-font-family': theme?.fontFamily || 'inherit'
  };
};

export const getCssStyleString = (theme?: ConversedThemeTokens): string => {
  const vars = generateCssVariables(theme);
  return Object.entries(vars)
    .map(([key, val]) => `${key}: ${val};`)
    .join(' ');
};
