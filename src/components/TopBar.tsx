import AutoAwesomeMosaicRounded from '@mui/icons-material/AutoAwesomeMosaicRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { ALGORITHMS, getAlgorithm, type AlgorithmInfo } from '../algorithms';
import { engine, useEngineSnapshot } from '../core/engine';
import type { AlgorithmId, Speed } from '../core/types';
import { MAZES } from '../mazes';
import { tokens } from '../theme/tokens';
import { AlgorithmTags } from './AlgorithmTags';
import { Keycap } from './Keycap';
import { Brand } from './Logo';

interface TopBarProps {
  algorithm: AlgorithmId;
  onAlgorithmChange: (id: AlgorithmId) => void;
  speed: Speed;
  onSpeedChange: (speed: Speed) => void;
  onOpenTutorial: () => void;
}

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 'fast', label: 'Fast' },
  { value: 'average', label: 'Average' },
  { value: 'slow', label: 'Slow' },
];

function Overline({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      component="span"
      sx={{ display: 'block', color: 'text.disabled', lineHeight: 1.3 }}
    >
      {children}
    </Typography>
  );
}

function AlgorithmOption({ info }: { info: AlgorithmInfo }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{info.name}</Typography>
        <AlgorithmTags info={info} compact />
      </Box>
      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.35 }}>
        {info.tagline}
      </Typography>
    </Box>
  );
}

export function TopBar({
  algorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  onOpenTutorial,
}: TopBarProps) {
  const { status } = useEngineSnapshot();
  const [mazeAnchor, setMazeAnchor] = useState<HTMLElement | null>(null);
  const busy = status === 'running' || status === 'generating';
  const info = getAlgorithm(algorithm);

  const renderAlgorithmItems = (weighted: boolean) =>
    ALGORITHMS.filter((a) => a.weighted === weighted).map((a) => (
      <MenuItem key={a.id} value={a.id} sx={{ py: 1 }}>
        <AlgorithmOption info={a} />
      </MenuItem>
    ));

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 2,
        rowGap: 1.5,
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderBottom: `1px solid ${tokens.line}`,
        bgcolor: alpha(tokens.bgRaised, 0.6),
        backdropFilter: 'blur(12px)',
      }}
    >
      <Brand />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.25,
          flex: 1,
          justifyContent: { xs: 'flex-start', lg: 'center' },
        }}
      >
        <Select
          size="small"
          value={algorithm}
          onChange={(event) => onAlgorithmChange(event.target.value)}
          inputProps={{ 'aria-label': 'Algorithm' }}
          renderValue={(value) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <Overline>Algorithm</Overline>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
                {getAlgorithm(value).name}
              </Typography>
            </Box>
          )}
          sx={{ width: 250, '& .MuiSelect-select': { py: '5px' } }}
          MenuProps={{ slotProps: { paper: { sx: { maxWidth: 420 } } } }}
        >
          <ListSubheader>Weighted</ListSubheader>
          {renderAlgorithmItems(true)}
          <ListSubheader>Unweighted</ListSubheader>
          {renderAlgorithmItems(false)}
        </Select>

        <Button
          variant="outlined"
          onClick={(event) => setMazeAnchor(event.currentTarget)}
          startIcon={<AutoAwesomeMosaicRounded sx={{ color: tokens.secondary }} />}
          endIcon={<ExpandMoreRounded sx={{ color: 'text.secondary' }} />}
          aria-haspopup="menu"
          aria-expanded={Boolean(mazeAnchor)}
          sx={{ height: 46, justifyContent: 'flex-start', textAlign: 'left' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, mr: 0.5 }}>
            <Overline>Generate</Overline>
            <span>Mazes &amp; Patterns</span>
          </Box>
        </Button>
        <Menu
          anchorEl={mazeAnchor}
          open={Boolean(mazeAnchor)}
          onClose={() => setMazeAnchor(null)}
          slotProps={{ paper: { sx: { width: 340 } } }}
        >
          {(['Mazes', 'Patterns'] as const).flatMap((group) => [
            <ListSubheader key={group}>{group}</ListSubheader>,
            ...MAZES.filter((m) => m.group === group).map((maze) => (
              <MenuItem
                key={maze.id}
                onClick={() => {
                  setMazeAnchor(null);
                  engine.generateMaze(maze.id);
                }}
                sx={{ py: 0.9, whiteSpace: 'normal' }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{maze.name}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.35 }}>
                    {maze.description}
                  </Typography>
                </Box>
              </MenuItem>
            )),
          ])}
        </Menu>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: 1.5,
            pr: 0.5,
            height: 46,
            borderRadius: '12px',
            border: `1px solid ${tokens.lineStrong}`,
            bgcolor: 'rgba(148, 163, 209, 0.03)',
          }}
        >
          <Overline>Speed</Overline>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={speed}
            onChange={(_event, value: Speed | null) => value && onSpeedChange(value)}
            aria-label="Animation speed"
            sx={{ border: 0, bgcolor: 'transparent', p: 0 }}
          >
            {SPEEDS.map(({ value, label }) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {busy ? (
          <Button
            variant="outlined"
            onClick={() => engine.stop()}
            startIcon={<StopRounded />}
            sx={{
              minWidth: 196,
              minHeight: 44,
              color: tokens.target,
              borderColor: alpha(tokens.target, 0.5),
              '&:hover': { borderColor: tokens.target, bgcolor: alpha(tokens.target, 0.08) },
            }}
          >
            {status === 'generating' ? 'Stop building' : 'Stop'}
            <Box component="span" sx={{ ml: 1 }}>
              <Keycap>Esc</Keycap>
            </Box>
          </Button>
        ) : (
          <Button
            variant="glow"
            onClick={() => engine.visualize()}
            startIcon={<PlayArrowRounded />}
            sx={{ minWidth: 196, minHeight: 44 }}
          >
            Visualize {info.shortName}
          </Button>
        )}
        <Tooltip title="Open the tutorial (?)">
          <IconButton onClick={onOpenTutorial} aria-label="Open tutorial">
            <SchoolRounded />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
