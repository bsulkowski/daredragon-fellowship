// The action tables of rules section 2, as data. This module only maps cards to
// what is printed in the tables; how actions resolve belongs to the engine.

import { type Card, type Rank, type Suit, JOKER, parseCard } from './cards.ts';

// ---------------------------------------------------------------------------
// 2.1 Daredevils' actions

export type HeroActionName =
  | 'Intervention Dodge'
  | 'Draw Aggro'
  | 'Shield'
  | 'Entangle'
  | 'Charge'
  | 'Precision Strike'
  | 'Strike'
  | 'Quick Strike'
  | 'Helping Hand'
  | 'First Aid';

export interface HeroAction {
  name: HeroActionName;
  /** Card ranks mapped to this action; 'Joker' for First Aid. */
  ranks: readonly (Rank | typeof JOKER)[];
  type: 'attack' | 'support';
  /** Guard actions (Intervention Dodge, Shield) have no warm-up and wait for a dragon attack. */
  guard: boolean;
  /** Base warm-up in daredevil turns; null for guards ("—" in the table). */
  warmup: number | null;
  /** Base damage for attacks; null otherwise. */
  damage: number | null;
  /** Health points restored (First Aid's "(8)"); null otherwise. */
  heal: number | null;
}

export const HERO_ACTIONS: readonly HeroAction[] = [
  { name: 'Intervention Dodge', ranks: ['A'], type: 'support', guard: true, warmup: null, damage: null, heal: null },
  { name: 'Draw Aggro', ranks: ['K'], type: 'support', guard: false, warmup: 1, damage: null, heal: null },
  { name: 'Shield', ranks: ['Q', 'J'], type: 'support', guard: true, warmup: null, damage: null, heal: null },
  { name: 'Entangle', ranks: ['10'], type: 'attack', guard: false, warmup: 3, damage: 0, heal: null },
  { name: 'Charge', ranks: ['9'], type: 'attack', guard: false, warmup: 4, damage: 8, heal: null },
  { name: 'Precision Strike', ranks: ['8'], type: 'attack', guard: false, warmup: 3, damage: 6, heal: null },
  { name: 'Strike', ranks: ['7', '6'], type: 'attack', guard: false, warmup: 2, damage: 5, heal: null },
  { name: 'Quick Strike', ranks: ['5'], type: 'attack', guard: false, warmup: 1, damage: 5, heal: null },
  { name: 'Helping Hand', ranks: ['4', '3', '2'], type: 'support', guard: false, warmup: 2, damage: null, heal: null },
  { name: 'First Aid', ranks: [JOKER], type: 'support', guard: false, warmup: 4, damage: null, heal: 8 },
];

const HERO_BY_RANK = new Map<string, HeroAction>();
for (const action of HERO_ACTIONS) for (const rank of action.ranks) HERO_BY_RANK.set(rank, action);

/** The daredevil action a card from the daredevils' deck stands for. */
export function heroAction(card: Card): HeroAction {
  const action = HERO_BY_RANK.get(parseCard(card).rank);
  if (!action) throw new Error(`no daredevil action for ${card}`);
  return action;
}

// ---------------------------------------------------------------------------
// 2.2 Dragon's actions

/** Body parts in the rules' fixed order, which is also the tie-break order (2.2 Health Regeneration). */
export const BODY_PARTS = ['jaws', 'paws', 'legs', 'tail'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

export type DragonActionName =
  | 'Fire Breath'
  | 'Roar'
  | 'Crush'
  | 'Bite'
  | 'Swing'
  | 'Trample'
  | 'Heavy Strike'
  | 'Strike'
  | 'Quick Strike'
  | 'Far Glare Right'
  | 'Far Glare Left'
  | 'Glare Right'
  | 'Glare Left'
  | 'Health Regeneration';

export interface Glare {
  /** Right = next daredevil clockwise, left = counter-clockwise. */
  direction: 'right' | 'left';
  steps: 1 | 2;
}

export interface DragonAction {
  name: DragonActionName;
  ranks: readonly (Rank | typeof JOKER)[];
  /** Suits this row applies to; null when the row covers every suit (or the Joker). */
  suits: readonly Suit[] | null;
  /** Body part performing the action; null for "—". */
  part: BodyPart | null;
  type: 'direct' | 'aoe' | 'special';
  /** Inherent knockdown (Swing, Trample). */
  knockdown: boolean;
  /** Warm-up in dragon turns. */
  warmup: number;
  /** Cool-down in dragon turns. */
  cooldown: number;
  /** Base damage for attacks; null otherwise. */
  damage: number | null;
  /** Health points restored (Health Regeneration's "(8)"); null otherwise. */
  heal: number | null;
  /** Target shift for Glare and Far Glare; null otherwise. */
  glare: Glare | null;
}

const RED: readonly Suit[] = ['♥', '♦'];
const BLACK: readonly Suit[] = ['♠', '♣'];

function dragon(
  name: DragonActionName,
  ranks: DragonAction['ranks'],
  suits: DragonAction['suits'],
  part: BodyPart | null,
  type: DragonAction['type'],
  warmup: number,
  cooldown: number,
  damage: number | null,
  extra: { knockdown?: boolean; heal?: number; glare?: Glare } = {},
): DragonAction {
  return {
    name, ranks, suits, part, type, warmup, cooldown, damage,
    knockdown: extra.knockdown ?? false,
    heal: extra.heal ?? null,
    glare: extra.glare ?? null,
  };
}

export const DRAGON_ACTIONS: readonly DragonAction[] = [
  dragon('Fire Breath', ['A'], RED, null, 'aoe', 2, 1, 8),
  dragon('Roar', ['A'], BLACK, null, 'special', 1, 1, null),
  dragon('Crush', ['K'], null, 'jaws', 'direct', 4, 2, 13),
  dragon('Bite', ['Q'], null, 'jaws', 'direct', 3, 2, 10),
  dragon('Swing', ['J'], null, 'tail', 'aoe', 3, 2, 6, { knockdown: true }),
  dragon('Trample', ['10', '9'], null, 'legs', 'direct', 2, 2, 8, { knockdown: true }),
  dragon('Heavy Strike', ['8'], null, 'paws', 'direct', 3, 1, 8),
  dragon('Strike', ['7', '6'], null, 'paws', 'direct', 2, 1, 6),
  dragon('Quick Strike', ['5'], null, 'paws', 'direct', 1, 1, 5),
  dragon('Far Glare Right', ['4'], RED, null, 'special', 0, 0, null, { glare: { direction: 'right', steps: 2 } }),
  dragon('Far Glare Left', ['4'], BLACK, null, 'special', 0, 0, null, { glare: { direction: 'left', steps: 2 } }),
  dragon('Glare Right', ['3', '2'], RED, null, 'special', 0, 0, null, { glare: { direction: 'right', steps: 1 } }),
  dragon('Glare Left', ['3', '2'], BLACK, null, 'special', 0, 0, null, { glare: { direction: 'left', steps: 1 } }),
  dragon('Health Regeneration', [JOKER], null, null, 'special', 1, 1, null, { heal: 8 }),
];

/** The dragon action a card from the dragon's deck stands for. */
export function dragonAction(card: Card): DragonAction {
  const { rank, suit } = parseCard(card);
  const action = DRAGON_ACTIONS.find(
    (a) => a.ranks.includes(rank) && (a.suits === null || (suit !== null && a.suits.includes(suit))),
  );
  if (!action) throw new Error(`no dragon action for ${card}`);
  return action;
}

/** Whether a dragon action is an attack (Direct or AoE) — the ones that need a target. */
export function isAttack(action: DragonAction): boolean {
  return action.type === 'direct' || action.type === 'aoe';
}
