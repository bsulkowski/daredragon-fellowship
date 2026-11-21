// Replays a fragment of the sample gameplay in the engine: the recorded moves
// answer the engine's decisions, and the recorded cards are forced as the next
// draws. Any decision or draw the record cannot answer is a problem; so is a
// recorded move the engine never asks for.

import type { Card } from '../../src/cards.ts';
import type { DeckName } from '../../src/core.ts';
import type { Agent, Decision } from '../../src/decisions.ts';
import { runGame } from '../../src/engine.ts';
import type { GameEvent } from '../../src/events.ts';
import { type GameState, type Outcome, createGameFrom, seatOf } from '../../src/state.ts';
import { type DragonMove, type Fragment, type HeroMove, NAMES } from './moves.ts';

export interface Replay {
  state: GameState;
  outcome: Outcome | null;
  /** Mismatches between the record and the engine, in the order found. */
  problems: string[];
  /** Decisions taken by default because the markdown leaves them open. */
  defaults: string[];
}

class ReplayStop extends Error {}

const label = (turn: number, dragon: boolean) => `${turn}${dragon ? '❖' : ''}`;

export function replay(
  fragment: Fragment,
  onEvent?: (event: GameEvent, state: Readonly<GameState>) => void,
): Replay {
  const state = createGameFrom({ names: NAMES }, fragment.setup);
  const problems: string[] = [];
  const defaults: string[] = [];

  // Mutable queues per turn, consumed as the engine asks. Cards dealt are
  // queued in dealing order: clockwise from the dealer (rules 1.9).
  const n = fragment.setup.heroes.length;
  const heroMoves = new Map<number, HeroMove>();
  const dragonMoves = new Map<number, DragonMove>();
  const dealt = new Map<number, { to: number; card: Card }[]>();
  for (const move of fragment.moves) {
    const copy = structuredClone(move);
    if (copy.dragon) {
      dragonMoves.set(copy.turn, copy);
      continue;
    }
    heroMoves.set(copy.turn, copy);
    if (copy.deal) {
      const dealer = seatOf(copy.turn, n);
      const queue = [];
      for (let i = 1; i < n; i++) {
        const to = (dealer + i) % n;
        const card = copy.deal[to];
        if (card !== undefined) queue.push({ to, card });
      }
      dealt.set(copy.turn, queue);
    }
  }
  const expectedDeals: { to: number; card: Card }[] = [];
  const played = new Set<number>();

  const stop = (message: string): never => {
    problems.push(message);
    throw new ReplayStop(message);
  };

  const nextCard = (deck: DeckName, s: Readonly<GameState>): Card | undefined => {
    const at = label(s.turn, s.phase === 'dragon');
    if (deck === 'hero') {
      if (s.phase !== 'hero') stop(`${at}: the daredevils' deck is drawn from outside a deal`);
      const next = dealt.get(s.turn)?.shift();
      if (next === undefined) return stop(`${at}: a card dealt is not in the record`);
      expectedDeals.push(next);
      return next.card;
    }
    const card = dragonMoves.get(s.turn)?.draws?.shift();
    return card ?? stop(`${at}: a dragon card drawn is not in the record`);
  };

  const agent: Agent = {
    decide(d: Decision, s: Readonly<GameState>): number {
      const dragonPhase = s.phase === 'dragon';
      const at = label(s.turn, dragonPhase);
      const move = dragonPhase ? undefined : heroMoves.get(s.turn);
      switch (d.kind) {
        case 'turn': {
          if (move?.play !== undefined) {
            const i = d.options.findIndex((o) => o.type === 'play' && o.card === move.play);
            if (i < 0) stop(`${at}: ${NAMES[d.player]} cannot play ${move.play}`);
            return i;
          }
          if (move?.deal === undefined) stop(`${at}: ${NAMES[d.player]}'s turn is not in the record`);
          return d.options.findIndex((o) => o.type === 'draw');
        }
        case 'target': {
          const want = move?.targets?.[d.card];
          if (want === undefined) return stop(`${at}: no target recorded for ${NAMES[d.player]}'s ${d.card}`);
          delete move!.targets![d.card];
          const i = d.options.findIndex((o) => (o.type === 'part' ? o.part === want : o.hero === want));
          if (i < 0) stop(`${at}: ${d.card} cannot target ${typeof want === 'number' ? NAMES[want] : want}`);
          return i;
        }
        case 'discard': {
          const queue = move?.discards;
          if (d.reason === 'roar' || queue === undefined) {
            if (d.reason !== 'roar') stop(`${at}: ${NAMES[d.player]} must discard, but no discard is recorded`);
            defaults.push(`${at}: ${NAMES[d.player]} discards ${d.options[0]} (${d.reason}, unspecified)`);
            return 0;
          }
          const card = queue.shift();
          const i = card === undefined ? -1 : d.options.indexOf(card);
          if (i < 0) stop(`${at}: ${NAMES[d.player]} cannot discard ${card ?? '(nothing recorded)'}`);
          return i;
        }
      }
    },
  };

  let outcome: Outcome | null = null;
  try {
    outcome = runGame(state, agent, {
      maxTurns: fragment.end.turn,
      nextCard,
      onEvent: (event, s) => {
        // A turn counts as taken even when it was not asked (an incapacitated player can only deal).
        if ((event.type === 'play' || event.type === 'deal') && s.phase === 'hero') played.add(s.turn);
        if (event.type === 'deal') {
          const expected = expectedDeals.shift();
          if (expected?.to !== event.to) {
            problems.push(`${s.turn}: ${event.card} went to ${NAMES[event.to]}, the record says ${NAMES[expected?.to ?? -1]}`);
          }
        }
        onEvent?.(event, s);
      },
    });
  } catch (error) {
    if (!(error instanceof ReplayStop)) throw error;
  }

  if (problems.length === 0) {
    for (const [turn, move] of heroMoves) {
      const left = [
        ...(dealt.get(turn) ?? []).map((d) => `dealt ${d.card} to ${NAMES[d.to]}`),
        ...Object.keys(move.targets ?? {}).map((c) => `target for ${c}`),
        ...(move.discards ?? []).map((c) => `discard ${c}`),
      ];
      if ((move.play !== undefined || move.deal !== undefined) && !played.has(turn)) left.push('the turn itself');
      if (left.length > 0) problems.push(`${turn}: recorded but never used: ${left.join(', ')}`);
    }
    for (const [turn, move] of dragonMoves) {
      if (move.draws?.length) problems.push(`${turn}❖: recorded but never drawn: ${move.draws.join(', ')}`);
    }
    const end = fragment.end;
    if (outcome && !(outcome.result === 'timeout' && end.phase === 'dragon' && outcome.turn === end.turn + 1) &&
        !(outcome.result !== 'timeout' && outcome.turn === end.turn && outcome.phase === end.phase)) {
      problems.push(`the game ended (${outcome.result}) at ${label(outcome.turn, outcome.phase === 'dragon')}, ` +
        `not after ${label(end.turn, end.phase === 'dragon')}`);
    }
  }
  return { state, outcome, problems, defaults };
}
