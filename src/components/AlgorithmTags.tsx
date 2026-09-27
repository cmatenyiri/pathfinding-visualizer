import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import type { AlgorithmInfo } from '../algorithms';
import { fonts, tokens } from '../theme/tokens';

interface Tag {
  label: string;
  hint: string;
  color: string;
}

function tagsFor(info: AlgorithmInfo): Tag[] {
  const tags: Tag[] = [
    info.weighted
      ? {
          label: 'Weighted',
          hint: 'Takes the extra cost of weight nodes into account.',
          color: tokens.weight,
        }
      : {
          label: 'Unweighted',
          hint: 'Treats weight nodes like normal nodes.',
          color: tokens.textMuted,
        },
    info.optimal
      ? {
          label: 'Shortest path',
          hint: info.weighted
            ? 'Guarantees the cheapest possible path.'
            : 'Guarantees the path with the fewest moves.',
          color: tokens.start,
        }
      : {
          label: 'No guarantee',
          hint: 'May return a longer path than necessary.',
          color: tokens.bomb,
        },
  ];
  if (info.custom) {
    tags.unshift({
      label: 'Custom',
      hint: 'An original algorithm made for this app.',
      color: tokens.primary,
    });
  }
  return tags;
}

export function AlgorithmTags({
  info,
  compact = false,
}: {
  info: AlgorithmInfo;
  compact?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
      {tagsFor(info).map((tag) => {
        const chip = (
          <Box
            component="span"
            key={tag.label}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: compact ? 0.6 : 0.9,
              height: compact ? 18 : 22,
              borderRadius: '6px',
              fontFamily: fonts.display,
              fontSize: compact ? 10.5 : 11.5,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: tag.color,
              bgcolor: alpha(tag.color, 0.1),
              border: `1px solid ${alpha(tag.color, 0.22)}`,
            }}
          >
            {!compact && (
              <Box
                component="span"
                sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tag.color }}
              />
            )}
            {tag.label}
          </Box>
        );
        // Compact tags live inside menus, where a tooltip can outlive its closing anchor.
        return compact ? (
          chip
        ) : (
          <Tooltip key={tag.label} title={tag.hint} disableInteractive>
            {chip}
          </Tooltip>
        );
      })}
    </Box>
  );
}
