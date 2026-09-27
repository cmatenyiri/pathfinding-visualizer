import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { ALGORITHMS } from '../algorithms';
import { AlgorithmTags } from '../components/AlgorithmTags';
import { Keycap } from '../components/Keycap';
import { LogoMark } from '../components/Logo';
import { NodeSwatch, type SwatchType } from '../components/NodeSwatch';
import { WEIGHT_COST } from '../core/types';
import { fonts, gradients, tokens } from '../theme/tokens';
import { MiniBoard } from './MiniBoard';
import { scenes, type Scene } from './scenes';
import { rememberTutorialChoice, shouldShowTutorial } from './storage';

interface Step {
  eyebrow: string;
  title: string;
  body: ReactNode;
  /** Builds the illustration; called once per visit so random mazes differ each time. */
  scene?: () => Scene;
  caption?: ReactNode;
  wide?: ReactNode;
}

function Swatch({ type, children }: { type: SwatchType; children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <NodeSwatch type={type} size={14} />
      {children}
    </Box>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: 14.5, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function B({ children }: { children: ReactNode }) {
  return (
    <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
      {children}
    </Box>
  );
}

const SHORTCUTS: [string, string][] = [
  ['V', 'Visualize'],
  ['W', 'Hold to draw weights'],
  ['B', 'Add / remove bomb'],
  ['C', 'Clear path'],
  ['Esc', 'Stop animation'],
  ['?', 'Open this tutorial'],
];

const STEPS: Step[] = [
  {
    eyebrow: 'Welcome',
    title: 'Welcome to Wayfinder',
    body: (
      <>
        <P>
          An interactive playground for the algorithms that find their way through mazes, maps and
          networks. Draw obstacles, drop a bomb, pick an algorithm and watch it think — node by
          node.
        </P>
        <P>
          This quick tour covers everything in about a minute. Feel free to skip it; you can reopen
          it any time from the <B>graduation-cap</B> button in the top-right corner.
        </P>
      </>
    ),
    scene: scenes.hero,
    caption: 'A* weaving through walls and weights',
  },
  {
    eyebrow: 'The basics',
    title: 'What is a pathfinding algorithm?',
    body: (
      <>
        <P>
          At its core, a pathfinding algorithm searches a graph for the best route between two
          points — the same idea behind GPS navigation, game AI and network routing.
        </P>
        <P>
          Here the graph is a grid. Every square is a <B>node</B> and you can move up, down, left or
          right. Each move costs <B>1</B>, except stepping onto a weight node, which costs{' '}
          <B>{WEIGHT_COST}</B>. The shortest path is simply the one with the lowest total cost.
        </P>
      </>
    ),
    scene: scenes.ripple,
    caption: (
      <>
        <Swatch type="start">Start</Swatch>
        <Swatch type="visited">Explored</Swatch>
        <Swatch type="path">Shortest path</Swatch>
        <Swatch type="target">Target</Swatch>
      </>
    ),
  },
  {
    eyebrow: 'The contenders',
    title: 'Meet the algorithms',
    body: (
      <P>
        Not every algorithm is created equal. <B>Weighted</B> algorithms account for the cost of
        weight nodes while unweighted ones treat every move alike, and some <B>guarantee</B> the
        shortest path while others trade that promise for speed.
      </P>
    ),
    wide: (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        {ALGORITHMS.map((a) => (
          <Box
            key={a.id}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: `1px solid ${a.custom ? alpha(tokens.primary, 0.35) : tokens.line}`,
              bgcolor: a.custom ? alpha(tokens.primary, 0.05) : 'rgba(148,163,209,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 14.5 }}>
                {a.name}
              </Typography>
              <AlgorithmTags info={a} compact />
            </Box>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.5 }}>
              {a.tagline}
            </Typography>
          </Box>
        ))}
      </Box>
    ),
  },
  {
    eyebrow: 'Shape the board',
    title: 'Walls and weights',
    body: (
      <>
        <P>
          <B>Click and drag</B> anywhere on the board to draw <Swatch type="wall">walls</Swatch> —
          impassable nodes the path has to go around.
        </P>
        <P>
          Hold <Keycap>W</Keycap> while drawing (or pick the Weight tool) to place{' '}
          <Swatch type="weight">weights</Swatch> instead. They don&apos;t block the way, but
          crossing one costs {WEIGHT_COST} moves, so weighted algorithms will usually find a way
          around. Click an existing wall or weight to erase it.
        </P>
      </>
    ),
    scene: scenes.wallsAndWeights,
    caption: 'Drag to draw walls · hold W for weights',
  },
  {
    eyebrow: 'Raise the stakes',
    title: 'Adding a bomb',
    body: (
      <>
        <P>
          A <Swatch type="bomb">bomb</Swatch> changes the mission: the algorithm must first reach
          the bomb and defuse it, and only then continue on to the target.
        </P>
        <P>
          The search for the bomb is drawn in <Swatch type="visited-bomb">magenta</Swatch>, the rest
          of the journey in <Swatch type="visited">teal</Swatch>, and the final path runs through
          both. Use <B>Add bomb</B> in the toolbar (or press <Keycap>B</Keycap>).
        </P>
      </>
    ),
    scene: scenes.bomb,
    caption: 'Start → bomb → target',
  },
  {
    eyebrow: 'Move things around',
    title: 'Drag the nodes',
    body: (
      <>
        <P>
          Grab the <Swatch type="start">start</Swatch>, the <Swatch type="target">target</Swatch> or
          the <Swatch type="bomb">bomb</Swatch> and drop it wherever you like.
        </P>
        <P>
          Once a visualization has finished, the result <B>updates live</B> as you drag nodes or
          draw walls — a great way to see how each algorithm reacts to change.
        </P>
      </>
    ),
    scene: scenes.drag,
    caption: 'Results update instantly while you drag',
  },
  {
    eyebrow: "You're all set",
    title: 'Mazes, speed & shortcuts',
    body: (
      <>
        <P>
          Generate a maze from <B>Mazes &amp; Patterns</B>, choose an animation speed, then hit{' '}
          <B>Visualize</B>. Clear the path to race another algorithm on the same board, or clear the
          board to start fresh.
        </P>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 1.5,
            rowGap: 1,
            alignItems: 'center',
            mt: 2,
          }}
        >
          {SHORTCUTS.map(([key, label]) => (
            <Box key={key} sx={{ display: 'contents' }}>
              <Box sx={{ justifySelf: 'start' }}>
                <Keycap>{key}</Keycap>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    ),
    scene: () => scenes.maze(),
    caption: 'Recursive division, then A*',
  },
];

function Illustration({ step }: { step: Step }) {
  // Built once per mount; the parent remounts this per step via `key`.
  const [scene] = useState(() => step.scene?.());
  if (!scene) return null;
  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1, sm: 2 },
        borderRadius: '16px',
        border: `1px solid ${tokens.line}`,
        background: `radial-gradient(400px 200px at 50% 0%, ${alpha(tokens.primary, 0.08)}, transparent 70%), ${tokens.bg}`,
      }}
    >
      <MiniBoard scene={scene} />
      {step.caption && (
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            columnGap: 2,
            rowGap: 0.5,
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          {step.caption}
        </Box>
      )}
    </Box>
  );
}

export function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [hide, setHide] = useState(() => !shouldShowTutorial());
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const close = () => {
    rememberTutorialChoice(hide);
    onClose();
    // Start from the beginning next time it is opened.
    window.setTimeout(() => setIndex(0), 300);
  };
  const next = () => (last ? close() : setIndex((i) => i + 1));
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="md"
      fullWidth
      aria-labelledby="tutorial-title"
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 1.5, sm: 4 },
          width: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 64px)' },
        },
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') next();
        if (event.key === 'ArrowLeft') back();
      }}
    >
      <Box sx={{ position: 'relative', p: { xs: 2.5, sm: 4 }, pb: { xs: 2, sm: 3 } }}>
        <IconButton
          onClick={close}
          aria-label="Close tutorial"
          sx={{ position: 'absolute', top: 14, right: 14 }}
        >
          <CloseRounded />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
          <LogoMark size={26} />
          <Typography
            variant="overline"
            sx={{
              background: gradients.brand,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: 11,
            }}
          >
            {step.eyebrow}
          </Typography>
          <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: 11 }}>
            · {index + 1} / {STEPS.length}
          </Typography>
        </Box>

        <Box
          key={index}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: step.scene ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            },
            gap: { xs: 3, md: 4 },
            alignItems: 'center',
            minHeight: { md: 400 },
            animation: 'tutorial-in 280ms ease-out',
            '@keyframes tutorial-in': {
              from: { opacity: 0, transform: 'translateY(6px)' },
              to: { opacity: 1, transform: 'none' },
            },
          }}
        >
          <Box>
            <Typography
              id="tutorial-title"
              variant="h4"
              component="h2"
              sx={{ fontSize: { xs: 26, sm: 32 }, mb: 2, lineHeight: 1.15 }}
            >
              {step.title}
            </Typography>
            {step.body}
            {step.wide && <Box sx={{ mt: 2 }}>{step.wide}</Box>}
          </Box>
          {step.scene && <Illustration step={step} />}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mt: 3,
            pt: 2.5,
            borderTop: `1px solid ${tokens.line}`,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox size="small" checked={hide} onChange={(e) => setHide(e.target.checked)} />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don&apos;t show on startup
              </Typography>
            }
            sx={{ mr: 'auto' }}
          />

          <Box sx={{ display: 'flex', gap: 0.75 }} aria-hidden>
            {STEPS.map((s, i) => (
              <Box
                key={s.title}
                onClick={() => setIndex(i)}
                sx={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: i === index ? gradients.brand : tokens.lineStrong,
                  transition: 'all 220ms ease',
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            {!last && <Button onClick={close}>Skip tutorial</Button>}
            {index > 0 && (
              <Button variant="outlined" onClick={back} startIcon={<ArrowBackRounded />}>
                Back
              </Button>
            )}
            <Button variant="glow" onClick={next} endIcon={!last && <ArrowForwardRounded />}>
              {last ? "Let's go" : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
