import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import LinearProgress from '@mui/material/LinearProgress';
import { ThemeProvider } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { AlgorithmSummary } from './components/AlgorithmSummary';
import { Board } from './components/Board';
import { Legend } from './components/Legend';
import { Notices } from './components/Notices';
import { StatsPanel } from './components/StatsPanel';
import { Toolbar } from './components/Toolbar';
import { TopBar } from './components/TopBar';
import { engine, useEngineSnapshot } from './core/engine';
import type { AlgorithmId, Speed } from './core/types';
import { useShortcuts } from './hooks/useShortcuts';
import { theme } from './theme/theme';
import { tokens } from './theme/tokens';
import { Tutorial } from './tutorial/Tutorial';
import { shouldShowTutorial } from './tutorial/storage';

export default function App() {
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('dijkstra');
  const [speed, setSpeed] = useState<Speed>('fast');
  const [tutorialOpen, setTutorialOpen] = useState(shouldShowTutorial);
  const { status } = useEngineSnapshot();
  const busy = status === 'running' || status === 'generating';

  const openTutorial = useCallback(() => setTutorialOpen(true), []);
  useShortcuts(!tutorialOpen, openTutorial);

  const changeAlgorithm = (id: AlgorithmId) => {
    setAlgorithm(id);
    engine.setAlgorithm(id);
  };
  const changeSpeed = (next: Speed) => {
    setSpeed(next);
    engine.setSpeed(next);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: { xs: 'auto', md: '100dvh' },
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <TopBar
          algorithm={algorithm}
          onAlgorithmChange={changeAlgorithm}
          speed={speed}
          onSpeedChange={changeSpeed}
          onOpenTutorial={openTutorial}
        />
        <Box sx={{ height: 2 }}>{busy && <LinearProgress aria-label="Working" />}</Box>
        <Toolbar />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            px: { xs: 2, md: 3 },
            pt: 0.5,
            pb: 1.75,
          }}
        >
          <AlgorithmSummary algorithm={algorithm} />
          <StatsPanel />
        </Box>

        <Board />

        <Box
          component="footer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            px: { xs: 2, md: 3 },
            py: 1.5,
            color: tokens.textDim,
          }}
        >
          <Legend />
          <Box sx={{ fontSize: 12, color: 'text.disabled' }}>
            Built with React, TypeScript &amp; MUI
          </Box>
        </Box>
      </Box>

      <Tutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <Notices />
    </ThemeProvider>
  );
}
