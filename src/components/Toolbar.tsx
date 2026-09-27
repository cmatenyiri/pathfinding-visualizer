import BackspaceRounded from '@mui/icons-material/BackspaceRounded';
import LayersClearRounded from '@mui/icons-material/LayersClearRounded';
import MouseRounded from '@mui/icons-material/MouseRounded';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import { engine, useEngineSnapshot } from '../core/engine';
import type { Brush } from '../core/types';
import { tokens } from '../theme/tokens';
import { Keycap } from './Keycap';
import { NodeSwatch } from './NodeSwatch';

export function Toolbar() {
  const { activeBrush, hasBomb, status, stats, hasObstacles } = useEngineSnapshot();
  const busy = status === 'running' || status === 'generating';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        px: { xs: 2, md: 3 },
        py: 1.25,
      }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={activeBrush}
        onChange={(_event, value: Brush | null) => value && engine.setBrush(value)}
        aria-label="Drawing tool"
      >
        <Tooltip title="Click and drag on the board to draw walls">
          <ToggleButton value="wall" aria-label="Wall brush">
            <NodeSwatch type="wall" size={14} />
            Wall
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Or hold W while you draw">
          <ToggleButton value="weight" aria-label="Weight brush">
            <NodeSwatch type="weight" size={14} />
            Weight
            <Keycap active={activeBrush === 'weight'}>W</Keycap>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      <Tooltip
        title={
          hasBomb
            ? 'Remove the bomb (B)'
            : 'The path must defuse the bomb before reaching the target (B)'
        }
      >
        <span>
          <Button
            variant="outlined"
            disabled={busy}
            onClick={() => (hasBomb ? engine.removeBomb() : engine.addBomb())}
            startIcon={<NodeSwatch type="bomb" size={16} />}
            sx={
              hasBomb
                ? {
                    color: tokens.bomb,
                    borderColor: alpha(tokens.bomb, 0.45),
                    bgcolor: alpha(tokens.bomb, 0.08),
                    '&:hover': { borderColor: tokens.bomb, bgcolor: alpha(tokens.bomb, 0.12) },
                  }
                : undefined
            }
          >
            {hasBomb ? 'Remove bomb' : 'Add bomb'}
          </Button>
        </span>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.75, my: 0.5, display: { xs: 'none', sm: 'block' } }}
      />

      <Tooltip title="Remove the explored area and path (C)">
        <span>
          <Button
            startIcon={<BackspaceRounded />}
            disabled={!busy && !stats}
            onClick={() => engine.clearPath()}
          >
            Clear path
          </Button>
        </span>
      </Tooltip>
      <Button
        startIcon={<LayersClearRounded />}
        disabled={!hasObstacles}
        onClick={() => engine.clearWallsAndWeights()}
      >
        Clear walls &amp; weights
      </Button>
      <Button startIcon={<RestartAltRounded />} onClick={() => engine.clearBoard()}>
        Clear board
      </Button>

      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          gap: 0.75,
          color: 'text.disabled',
          fontSize: 12,
          whiteSpace: 'nowrap',
        }}
      >
        <MouseRounded sx={{ fontSize: 15 }} />
        Drag to draw · hold <Keycap active={activeBrush === 'weight'}>W</Keycap> for weights · drag
        nodes to move them
      </Box>
    </Box>
  );
}
