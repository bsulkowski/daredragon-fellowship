// Game state: plain data, so it can be copied with structuredClone and
// inspected by agents, validators and user interfaces alike.
//
// Time. Daredevil turns are numbered 1, 2, 3, …; dragon turn k❖ follows
// daredevil turn k. Daredevil turn k belongs to seat (k − 1) mod N, seat 0
// being the player who goes first (rules 1.4). The sample gameplay numbers its
// fragments the same way (Turn 51 is Pip's, seat 2 of 4).

import { BODY_PARTS, type BodyPart } from './actions.ts';
import { type Card, fullDeck } from './cards.ts';
import { type Deck, createDeck } from './deck.ts';
import { type Rng, createRng } from './random.ts';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 6;
export const MAX_HP = 25;
export const STARTING_HAND = 2;

export interface GameConfig {
  /** Number of daredevils, 4–6. */
  players: number;
  /** Extra Ϟ steps on every dragon attack — the difficulty knob of rules 3.1. */
  dragonModifier: number;
  /** Seed for all randomness inside the game (shuffles). */
  seed: number;
  /** Daredevil names, seat by seat; used in events and reports only. */
  names: string[];
}

export interface Hero {
  name: string;
  /** 0–25; at 0 the daredevil is incapacitated. */
  hp: number;
  /** Lying on the ground (rules 1.2 "stance"). */
  prone: boolean;
  /** Order carries no meaning in the rules; new cards are appended. */
  hand: Card[];
}

export interface Part {
  hp: number;
  entangled: boolean;
}

/** A daredevil action warming up on the board. */
export interface HeroPending {
  actor: number;
  card: Card;
  /** Daredevil turn on which the card was played. */
  played: number;
  /** Daredevil turn at whose start it resolves. */
  resolves: number;
}

/** A guard action (Intervention Dodge, Shield) standing by. */
export interface GuardPending {
  actor: number;
  card: Card;
  /** Daredevil turn on which it was placed. */
  placed: number;
  /** Daredevil turn at whose start it expires — its owner's next turn. */
  expires: number;
}

/** The dragon's card on the board, warming up or cooling down. */
export interface DragonPending {
  card: Card;
  /** Dragon turn on which it was played. */
  played: number;
  /** Dragon turn at whose start it resolves. */
  resolves: number;
  /** Dragon turn at whose start the cool-down ends; null while warming up. */
  cooldownEnds: number | null;
}

/**
 * The riposte window (2.1 Attack): daredevil turns `from`–`to` in which attacks
 * on `part` get +2Ϟ. One turn after the dragon's attack resolves, two when it
 * hit nothing and the dragon lost its balance (2.1 Intervention Dodge).
 */
export interface Riposte {
  part: BodyPart;
  from: number;
  to: number;
}

export type OutcomeResult = 'victory' | 'defeat' | 'timeout';

export interface Outcome {
  result: OutcomeResult;
  /** Turn number and phase in which the game ended. */
  turn: number;
  phase: Phase;
  /** HP of the body parts at the end, in BODY_PARTS order. */
  partsHp: number[];
  /** HP of the daredevils at the end, seat by seat. */
  heroesHp: number[];
}

export type Phase = 'hero' | 'dragon';

export interface GameState {
  config: GameConfig;
  /** Current turn number and phase. */
  turn: number;
  phase: Phase;
  heroes: Hero[];
  parts: Record<BodyPart, Part>;
  /** Seat of the dragon's attack target, or null. */
  target: number | null;
  heroDeck: Deck;
  dragonDeck: Deck;
  rng: Rng;
  pending: HeroPending[];
  guards: GuardPending[];
  dragon: DragonPending | null;
  /** The latest riposte window; stale once `to` has passed. */
  riposte: Riposte | null;
  outcome: Outcome | null;
}

// ---------------------------------------------------------------------------
// Helpers

export function seatOf(turn: number, players: number): number {
  return (((turn - 1) % players) + players) % players;
}

export function isIncapacitated(hero: Hero): boolean {
  return hero.hp === 0;
}

/** Hand limit by HP (rules 2.3). */
export function handLimit(hp: number): number {
  if (hp >= 21) return 6;
  if (hp >= 14) return 5;
  if (hp >= 7) return 4;
  if (hp >= 1) return 3;
  return 0;
}

export function defaultNames(players: number): string[] {
  return Array.from({ length: players }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, …
}

function resolveConfig(config: Partial<GameConfig>): GameConfig {
  const players = config.players ?? MIN_PLAYERS;
  if (!Number.isInteger(players) || players < MIN_PLAYERS || players > MAX_PLAYERS) {
    throw new RangeError(`players must be ${MIN_PLAYERS}–${MAX_PLAYERS}, got ${players}`);
  }
  const names = config.names ?? defaultNames(players);
  if (names.length !== players) throw new RangeError(`expected ${players} names, got ${names.length}`);
  const dragonModifier = config.dragonModifier ?? 0;
  if (!Number.isInteger(dragonModifier)) throw new RangeError(`dragonModifier must be an integer`);
  return { players, dragonModifier, seed: config.seed ?? 0, names: [...names] };
}

function freshParts(): Record<BodyPart, Part> {
  const parts = {} as Record<BodyPart, Part>;
  for (const part of BODY_PARTS) parts[part] = { hp: MAX_HP, entangled: false };
  return parts;
}

// ---------------------------------------------------------------------------
// New game (rules 1.3)

/** A new game: full HP, shuffled decks, two cards in each hand, no target, turn 1. */
export function createGame(config: Partial<GameConfig> = {}): GameState {
  const cfg = resolveConfig(config);
  const rng = createRng(cfg.seed);
  const dragonDeck = createDeck(fullDeck(), rng);
  const heroDeck = createDeck(fullDeck(), rng);
  const heroes: Hero[] = cfg.names.map((name) => ({ name, hp: MAX_HP, prone: false, hand: [] }));
  for (const hero of heroes) for (let i = 0; i < STARTING_HAND; i++) hero.hand.push(heroDeck.drawPile.pop()!);
  return {
    config: cfg, turn: 1, phase: 'hero', heroes, parts: freshParts(), target: null,
    heroDeck, dragonDeck, rng, pending: [], guards: [], dragon: null, riposte: null, outcome: null,
  };
}

// ---------------------------------------------------------------------------
// Game from a given position (e.g. a Setup block of the sample gameplay)

export interface HeroSetup {
  hp: number;
  prone?: boolean;
  hand: Card[];
}

export interface Setup {
  /** Daredevil turn the game resumes at (its start, before anything resolves). */
  turn: number;
  heroes: HeroSetup[];
  parts?: Partial<Record<BodyPart, { hp: number; entangled?: boolean }>>;
  target: number | null;
  pending?: HeroPending[];
  guards?: GuardPending[];
  dragon?: DragonPending | null;
  riposte?: Riposte | null;
}

/**
 * A game resuming from a given position. Both decks hold every card not
 * accounted for in the position, shuffled; discard piles start empty (their
 * content is usually unknown, and forced draws take cards from either pile).
 */
export function createGameFrom(config: Partial<GameConfig>, setup: Setup): GameState {
  const cfg = resolveConfig({ players: setup.heroes.length, ...config });
  if (setup.heroes.length !== cfg.players) throw new RangeError(`setup has ${setup.heroes.length} heroes`);
  const rng = createRng(cfg.seed);

  const heroes: Hero[] = setup.heroes.map((h, i) => {
    if (!Number.isInteger(h.hp) || h.hp < 0 || h.hp > MAX_HP) throw new RangeError(`bad HP ${h.hp}`);
    return { name: cfg.names[i], hp: h.hp, prone: h.prone ?? h.hp === 0, hand: [...h.hand] };
  });
  const parts = freshParts();
  for (const [part, value] of Object.entries(setup.parts ?? {})) {
    parts[part as BodyPart] = { hp: value.hp, entangled: value.entangled ?? false };
  }
  const pending = (setup.pending ?? []).map((p) => ({ ...p }));
  const guards = (setup.guards ?? []).map((g) => ({ ...g }));
  const dragon = setup.dragon ? { ...setup.dragon } : null;

  const heroCards = [...heroes.flatMap((h) => h.hand), ...pending.map((p) => p.card), ...guards.map((g) => g.card)];
  const dragonCards = dragon ? [dragon.card] : [];
  return {
    config: cfg, turn: setup.turn, phase: 'hero', heroes, parts, target: setup.target,
    heroDeck: createDeck(remainingCards(heroCards, "the daredevils' deck"), rng),
    dragonDeck: createDeck(remainingCards(dragonCards, "the dragon's deck"), rng),
    rng, pending, guards, dragon, riposte: setup.riposte ? { ...setup.riposte } : null, outcome: null,
  };
}

/** A full deck minus the given cards (as a multiset). Throws if a card is used too often. */
function remainingCards(used: Card[], deckName: string): Card[] {
  const rest = fullDeck();
  for (const card of used) {
    const index = rest.indexOf(card);
    if (index < 0) throw new Error(`${card} appears more often than ${deckName} holds`);
    rest.splice(index, 1);
  }
  return rest;
}
