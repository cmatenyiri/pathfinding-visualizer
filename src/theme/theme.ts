import { alpha, createTheme } from '@mui/material/styles';
import { cssVariables, fonts, gradients, tokens } from './tokens';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    /** Gradient call-to-action button. */
    glow: true;
  }
}

const focusRing = `0 0 0 3px ${alpha(tokens.primary, 0.28)}`;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.primary, contrastText: '#03131A' },
    secondary: { main: tokens.secondary, contrastText: '#0B0820' },
    success: { main: tokens.start },
    error: { main: tokens.target },
    warning: { main: tokens.bomb },
    info: { main: tokens.accent },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.text, secondary: tokens.textMuted, disabled: tokens.textDim },
    divider: tokens.line,
    action: {
      hover: 'rgba(148, 163, 209, 0.08)',
      selected: alpha(tokens.primary, 0.12),
      disabled: tokens.textDim,
      disabledBackground: 'rgba(148, 163, 209, 0.08)',
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: fonts.body,
    fontSize: 14,
    h1: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: fonts.display, fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: fonts.display, fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontFamily: fonts.display, fontWeight: 600 },
    subtitle2: { fontFamily: fonts.display, fontWeight: 600 },
    button: { fontFamily: fonts.display, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    overline: {
      fontFamily: fonts.display,
      fontWeight: 600,
      letterSpacing: '0.14em',
      fontSize: '0.66rem',
      lineHeight: 1.6,
    },
    caption: { color: tokens.textMuted },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': { ...cssVariables, colorScheme: 'dark' },
        'html, body, #root': { height: '100%' },
        body: {
          backgroundColor: tokens.bg,
          backgroundImage: [
            `radial-gradient(1200px 500px at 12% -10%, ${alpha(tokens.primary, 0.09)}, transparent 60%)`,
            `radial-gradient(900px 480px at 100% 0%, ${alpha(tokens.secondary, 0.11)}, transparent 60%)`,
          ].join(', '),
          backgroundAttachment: 'fixed',
          WebkitFontSmoothing: 'antialiased',
          // The app is a fixed full-screen workspace on desktop; small screens scroll instead.
          '@media (min-width: 900px)': { overflow: 'hidden' },
        },
        '::selection': { background: alpha(tokens.primary, 0.3) },
        '*': { scrollbarWidth: 'thin', scrollbarColor: `${tokens.lineStrong} transparent` },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: tokens.line },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 14,
          minHeight: 36,
          transition: 'background-color 160ms, border-color 160ms, color 160ms, box-shadow 160ms',
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
        text: {
          color: tokens.textMuted,
          '&:hover': { color: tokens.text, backgroundColor: 'rgba(148, 163, 209, 0.08)' },
        },
        outlined: {
          color: tokens.text,
          borderColor: tokens.lineStrong,
          backgroundColor: 'rgba(148, 163, 209, 0.03)',
          '&:hover': {
            borderColor: alpha(tokens.primary, 0.5),
            backgroundColor: alpha(tokens.primary, 0.06),
          },
        },
      },
      variants: [
        {
          props: { variant: 'glow' },
          style: {
            color: '#04121A',
            background: gradients.brand,
            backgroundSize: '160% 160%',
            backgroundPosition: '0% 50%',
            fontWeight: 700,
            paddingInline: 20,
            minHeight: 40,
            boxShadow: `0 8px 28px -8px ${alpha(tokens.primary, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
            transition:
              'background-position 400ms ease, box-shadow 200ms ease, transform 120ms ease',
            '&:hover': {
              backgroundPosition: '100% 50%',
              boxShadow: `0 10px 34px -6px ${alpha(tokens.secondary, 0.65)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
            },
            '&:active': { transform: 'translateY(1px)' },
            '&.Mui-disabled': { color: 'rgba(4, 18, 26, 0.55)', opacity: 0.5 },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          color: tokens.textMuted,
          '&:hover': { color: tokens.text, backgroundColor: 'rgba(148, 163, 209, 0.08)' },
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(148, 163, 209, 0.04)',
          transition: 'background-color 160ms, box-shadow 160ms',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.lineStrong },
          '&:hover': { backgroundColor: 'rgba(148, 163, 209, 0.07)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(tokens.primary, 0.45) },
          '&.Mui-focused': { boxShadow: focusRing },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.primary,
            borderWidth: 1,
          },
        },
        input: { paddingBlock: 8.5 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: tokens.textMuted },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          backgroundColor: alpha(tokens.surfaceHigh, 0.92),
          backdropFilter: 'blur(14px)',
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 14,
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.7)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 36,
          gap: 10,
          '&:hover': { backgroundColor: 'rgba(148, 163, 209, 0.08)' },
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.primary, 0.12),
            '&:hover': { backgroundColor: alpha(tokens.primary, 0.18) },
          },
          '&.Mui-focusVisible': { backgroundColor: 'rgba(148, 163, 209, 0.1)' },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          fontFamily: fonts.display,
          fontSize: '0.66rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          lineHeight: '30px',
          color: tokens.textDim,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          padding: 3,
          gap: 2,
          borderRadius: 12,
          backgroundColor: 'rgba(148, 163, 209, 0.04)',
          border: `1px solid ${tokens.lineStrong}`,
        },
        grouped: {
          border: 0,
          borderRadius: '9px !important',
          margin: 0,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: fonts.display,
          fontWeight: 600,
          textTransform: 'none',
          color: tokens.textMuted,
          paddingBlock: 5,
          paddingInline: 12,
          gap: 6,
          lineHeight: 1.4,
          '&:hover': { color: tokens.text, backgroundColor: 'rgba(148, 163, 209, 0.08)' },
          '&.Mui-selected': {
            color: tokens.primary,
            backgroundColor: alpha(tokens.primary, 0.13),
            boxShadow: `inset 0 0 0 1px ${alpha(tokens.primary, 0.3)}`,
            '&:hover': { backgroundColor: alpha(tokens.primary, 0.18) },
          },
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 350 },
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surfaceHigh,
          border: `1px solid ${tokens.lineStrong}`,
          color: tokens.text,
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 10px',
          borderRadius: 8,
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.6)',
        },
        arrow: {
          color: tokens.surfaceHigh,
          '&::before': { border: `1px solid ${tokens.lineStrong}` },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.bgRaised,
          backgroundImage: `radial-gradient(700px 280px at 0% 0%, ${alpha(tokens.primary, 0.08)}, transparent 70%), radial-gradient(600px 300px at 100% 100%, ${alpha(tokens.secondary, 0.1)}, transparent 70%)`,
          border: `1px solid ${tokens.lineStrong}`,
          borderRadius: 22,
          boxShadow: '0 40px 120px -20px rgba(0, 0, 0, 0.85)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': {
            backgroundColor: 'rgba(3, 5, 12, 0.72)',
            backdropFilter: 'blur(6px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 7, fontWeight: 600, fontSize: 11.5, height: 22 },
        label: { paddingInline: 8 },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.line } },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: alpha(tokens.surfaceHigh, 0.95),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${tokens.lineStrong}`,
          color: tokens.text,
          boxShadow: '0 18px 50px -12px rgba(0,0,0,0.75)',
          alignItems: 'center',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: { root: { color: tokens.textDim } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: 'transparent', height: 2 },
        bar: { background: gradients.brand },
      },
    },
  },
});
