import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { fonts, tokens } from '../theme/tokens';

export function Keycap({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <Box
      component="kbd"
      sx={{
        display: 'inline-grid',
        placeItems: 'center',
        minWidth: 20,
        height: 20,
        px: 0.6,
        fontFamily: fonts.mono,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        color: active ? '#04121A' : tokens.text,
        bgcolor: active ? tokens.primary : tokens.surfaceHigh,
        border: `1px solid ${active ? tokens.primary : tokens.lineStrong}`,
        borderBottomWidth: active ? 1 : 2,
        borderRadius: '6px',
        boxShadow: active ? `0 0 14px ${tokens.primary}` : 'none',
        transform: active ? 'translateY(1px)' : 'none',
        transition: 'all 120ms ease',
      }}
    >
      {children}
    </Box>
  );
}
