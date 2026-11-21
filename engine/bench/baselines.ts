// Balance baselines (#43): random play (a), random play (b) and the Dummy at
// every seat, for 4–6 players and a range of dragon modifiers (rules 3.1).
//
//   node --experimental-strip-types bench/baselines.ts [games per setting]
//
// Writes to bench/results/: games.csv.gz (one row per game), summary.json
// (aggregates per setting) and tables.md (the same as tables).
//
// Game i of every setting uses game seed i, so all agents and modifiers face
// the same shuffled decks (common random numbers); random agents get their own
// seed per game.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { dummyAgent } from '../src/agents/dummy.ts';
import { randomAgent } from '../src/agents/random.ts';
import { BODY_PARTS } from '../src/actions.ts';
import type { Agent } from '../src/decisions.ts';
import { runGame } from '../src/engine.ts';
import { createGame } from '../src/state.ts';

const AGENTS = ['random-a', 'random-b', 'dummy'] as const;
type AgentName = (typeof AGENTS)[number];
const PLAYERS = [4, 5, 6];
const MODIFIERS = [-3, -2, -1, 0, 1];
const MAX_TURNS = 1000;
const GAMES = Number(process.argv[2] ?? 2000);

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'results');

interface Game {
  agent: AgentName;
  players: number;
  modifier: number;
  seed: number;
  result: string;
  /** Daredevil turn in which the game ended. */
  turns: number;
  partsHp: number[];
  heroesHp: number[];
  /** Times the dragon's deck ran out, and the turn it first did (0 if never). */
  dragonReshuffles: number;
  firstDragonReshuffle: number;
  heroReshuffles: number;
}

function agentsFor(name: AgentName, players: number, seed: number): Agent | Agent[] {
  if (name === 'dummy') return Array.from({ length: players }, (_, i) => dummyAgent(i));
  return randomAgent(0x5eed0000 + seed, name === 'random-a' ? 'a' : 'b');
}

function playOne(agent: AgentName, players: number, modifier: number, seed: number): Game {
  const state = createGame({ players, seed, dragonModifier: modifier });
  let firstDragonReshuffle = 0;
  const outcome = runGame(state, agentsFor(agent, players, seed), {
    maxTurns: MAX_TURNS,
    onEvent: (e, s) => {
      if (e.type === 'reshuffle' && e.deck === 'dragon' && firstDragonReshuffle === 0) firstDragonReshuffle = s.turn;
    },
  });
  return {
    agent, players, modifier, seed,
    result: outcome.result,
    turns: outcome.turn,
    partsHp: outcome.partsHp,
    heroesHp: outcome.heroesHp,
    dragonReshuffles: state.dragonDeck.reshuffles,
    firstDragonReshuffle,
    heroReshuffles: state.heroDeck.reshuffles,
  };
}

// ---------------------------------------------------------------------------
// Statistics

/** Wilson score interval for a proportion, 95%. */
function wilson(successes: number, n: number): [number, number] {
  const z = 1.959964;
  const p = successes / n;
  const centre = (p + (z * z) / (2 * n)) / (1 + (z * z) / n);
  const half = (z / (1 + (z * z) / n)) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const i = (sorted.length - 1) * q;
  const [lo, hi] = [Math.floor(i), Math.ceil(i)];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const round = (x: number, d = 2) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);

function summarise(games: Game[]) {
  const n = games.length;
  const wins = games.filter((g) => g.result === 'victory');
  const losses = games.filter((g) => g.result === 'defeat');
  const turns = games.map((g) => g.turns).sort((a, b) => a - b);
  const [lo, hi] = wilson(wins.length, n);
  const incapacitatedOnWin = wins.map((g) => g.heroesHp.filter((hp) => hp === 0).length);
  return {
    games: n,
    wins: wins.length,
    losses: losses.length,
    timeouts: n - wins.length - losses.length,
    winRate: round(wins.length / n, 4),
    winRateCI95: [round(lo, 4), round(hi, 4)],
    turns: { mean: round(mean(turns), 1), p25: quantile(turns, 0.25), median: quantile(turns, 0.5), p75: quantile(turns, 0.75) },
    onLoss: {
      dragonHpMean: round(mean(losses.map((g) => sum(g.partsHp))), 1),
      partsAtZeroMean: round(mean(losses.map((g) => g.partsHp.filter((hp) => hp === 0).length)), 2),
    },
    onWin: {
      incapacitatedMean: round(mean(incapacitatedOnWin), 2),
      incapacitated: [0, 1, 2, 3, 4, 5].map((k) => incapacitatedOnWin.filter((x) => x === k).length),
    },
    dragonDeck: {
      reshuffledShare: round(games.filter((g) => g.dragonReshuffles > 0).length / n, 4),
      firstReshuffleTurnMedian: quantile(games.filter((g) => g.firstDragonReshuffle > 0).map((g) => g.firstDragonReshuffle).sort((a, b) => a - b), 0.5),
    },
  };
}

// ---------------------------------------------------------------------------

const started = Date.now();
const all: Game[] = [];
const settings: { agent: AgentName; players: number; modifier: number; summary: ReturnType<typeof summarise> }[] = [];
for (const agent of AGENTS) {
  for (const players of PLAYERS) {
    for (const modifier of MODIFIERS) {
      const games: Game[] = [];
      for (let seed = 0; seed < GAMES; seed++) games.push(playOne(agent, players, modifier, seed));
      all.push(...games);
      const summary = summarise(games);
      settings.push({ agent, players, modifier, summary });
      console.log(`${agent} ${players}p ${modifier >= 0 ? '+' : ''}${modifier}Ϟ: win ${(summary.winRate! * 100).toFixed(1)}%`);
    }
  }
}

mkdirSync(OUT, { recursive: true });
const header = ['agent', 'players', 'modifier', 'seed', 'result', 'turns',
  ...BODY_PARTS.map((p) => `${p}_hp`), 'heroes_hp', 'dragon_reshuffles', 'first_dragon_reshuffle', 'hero_reshuffles'];
const rows = all.map((g) => [g.agent, g.players, g.modifier, g.seed, g.result, g.turns, ...g.partsHp,
  g.heroesHp.join(' '), g.dragonReshuffles, g.firstDragonReshuffle, g.heroReshuffles].join(','));
writeFileSync(join(OUT, 'games.csv.gz'), gzipSync([header.join(','), ...rows].join('\n') + '\n'));

const meta = { gamesPerSetting: GAMES, maxTurns: MAX_TURNS, agents: AGENTS, players: PLAYERS, modifiers: MODIFIERS };
writeFileSync(join(OUT, 'summary.json'), JSON.stringify({ meta, settings }, null, 2) + '\n');

// Tables: win rate with its interval, then the other measures, per agent.
const pct = (x: number | null) => (x === null ? '—' : `${(x * 100).toFixed(1)}`);
const lines: string[] = [
  '# Baselines — tables',
  '',
  `Generated by \`bench/baselines.ts\`: ${GAMES} games per setting, limit ${MAX_TURNS} daredevil turns. ` +
    'Rows: players; columns: the dragon modifier (rules 3.1). Win rates in %, with the 95% Wilson interval.',
  '',
];
const cell = (agent: AgentName, players: number, modifier: number) =>
  settings.find((s) => s.agent === agent && s.players === players && s.modifier === modifier)!.summary;
const table = (title: string, agent: AgentName, f: (s: ReturnType<typeof summarise>) => string) => {
  lines.push(`### ${title}`, '', `| Players | ${MODIFIERS.map((m) => `${m >= 0 ? '+' : ''}${m}Ϟ`).join(' | ')} |`,
    `|---|${MODIFIERS.map(() => '---').join('|')}|`);
  for (const players of PLAYERS) lines.push(`| ${players} | ${MODIFIERS.map((m) => f(cell(agent, players, m))).join(' | ')} |`);
  lines.push('');
};
for (const agent of AGENTS) {
  lines.push(`## ${agent}`, '');
  table('Win rate', agent, (s) => `${pct(s.winRate)} (${pct(s.winRateCI95[0])}–${pct(s.winRateCI95[1])})`);
  table('Game length: median daredevil turn (25th–75th percentile)', agent, (s) => `${s.turns.median} (${s.turns.p25}–${s.turns.p75})`);
  table("On a loss: the dragon's remaining HP, mean (of 100)", agent, (s) => `${s.onLoss.dragonHpMean ?? '—'}`);
  table('On a win: incapacitated daredevils, mean', agent, (s) => `${s.onWin.incapacitatedMean ?? '—'}`);
  table("Games in which the dragon's deck ran out, %", agent, (s) => pct(s.dragonDeck.reshuffledShare));
}
lines.push(`Timeouts: ${settings.reduce((a, s) => a + s.summary.timeouts, 0)} of ${all.length} games.`, '');
writeFileSync(join(OUT, 'tables.md'), lines.join('\n'));

console.log(`${all.length} games in ${((Date.now() - started) / 1000).toFixed(0)} s → ${OUT}`);
