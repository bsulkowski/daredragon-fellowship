// The Dummy (rules/extensions_en.md, "Automated Player"): an automated
// daredevil whose choices follow a fixed algorithm. Used here at every seat as
// a baseline (#42), which goes beyond its purpose of filling one seat.
//
// Readings agreed with the author (#38): no validity check for Shield and
// Intervention Dodge (A4, #8), nor for Helping Hand (A14); "lowest current HP" for Helping Hand and First
// Aid only, guards having no target to choose (A5); with Dummies at every seat,
// the cards of all other players are counted against thresholds scaled by
// their number n: ≤2n same suit, ≤4n same colour, more a different suit (A6).

import { heroAction } from '../actions.ts';
import { type Card, JOKER, colorOf, suitOf } from '../cards.ts';
import type { Agent, Decision } from '../decisions.ts';
import { canPlay } from '../heroes.ts';
import type { GameState } from '../state.ts';

/** First Aid is pointless unless another daredevil is below this HP or incapacitated. */
const FIRST_AID_BELOW = 8;

/**
 * A Dummy for one seat. Its hand is a face-down pile kept by the agent: cards
 * received go on top (#38), the top card is revealed on its turn and goes to
 * the bottom when not played, discards come from the bottom. The pile is
 * reconciled with the hand in the game state at every decision.
 */
export function dummyAgent(seat: number): Agent {
  /** Bottom first, top last. */
  let pile: Card[] = [];

  function reconcile(hand: readonly Card[]): void {
    const rest = [...hand];
    pile = pile.filter((card) => {
      const i = rest.indexOf(card);
      if (i < 0) return false; // played, discarded or cancelled
      rest.splice(i, 1);
      return true;
    });
    pile.push(...rest); // received, in the order they arrived
  }

  function toBottom(): void {
    pile.unshift(pile.pop()!);
  }

  return {
    decide(decision: Decision, state: Readonly<GameState>): number {
      reconcile(state.heroes[seat].hand);
      switch (decision.kind) {
        case 'turn': {
          const draw = decision.options.findIndex((o) => o.type === 'draw');
          const top = pile.at(-1);
          if (top === undefined) return draw;
          const play = decision.options.findIndex((o) => o.type === 'play' && o.card === top);
          if (play < 0 || !isValid(state, seat, top) || !playConditionMet(state, seat, top)) {
            toBottom();
            return draw;
          }
          return play;
        }
        case 'target':
          return chooseTarget(decision, state, seat);
        case 'discard':
          // Over the hand limit — and after a Roar (#38) — from the bottom.
          return decision.options.indexOf(pile[0]);
      }
    },
  };
}

/**
 * Validity check. A card the rules do not allow now (e.g. Charge on the
 * ground) counts as invalid too (P27). Helping Hand is always valid: someone
 * may be on the ground by the time it resolves (A14).
 */
export function isValid(state: Readonly<GameState>, seat: number, card: Card): boolean {
  if (!canPlay(state, seat, card)) return false;
  if (heroAction(card).name === 'First Aid') return state.heroes.some((h, i) => i !== seat && h.hp < FIRST_AID_BELOW);
  return true;
}

/**
 * Probability check: the revealed card against the top of the daredevils'
 * discard pile, the condition depending on how many cards the others hold.
 * A Joker has neither suit nor colour, so against a suited card it meets only
 * "different suit" (#38, #9); two Jokers meet every condition (extensions).
 */
export function playConditionMet(state: Readonly<GameState>, seat: number, card: Card): boolean {
  const top = state.heroDeck.discardPile.at(-1);
  if (top === undefined) return false;
  if (card === JOKER && top === JOKER) return true;
  const n = state.config.players - 1;
  const held = state.heroes.reduce((sum, h, i) => (i === seat ? sum : sum + h.hand.length), 0);
  const [suit, topSuit] = [suitOf(card), suitOf(top)];
  if (held <= 2 * n) return suit !== null && suit === topSuit;
  if (held <= 4 * n) return colorOf(card) !== null && colorOf(card) === colorOf(top);
  return suit !== topSuit;
}

/**
 * Targeting: attacks go to the body part with the lowest HP — among parts
 * still above 0, attacking a disabled part being pointless (#38) — ties in the
 * order jaws, paws, legs, tail. Support goes to the daredevil with the lowest
 * HP, ties to the player seated to the Dummy's left, then onwards clockwise.
 */
function chooseTarget(decision: Extract<Decision, { kind: 'target' }>, state: Readonly<GameState>, seat: number): number {
  const n = state.config.players;
  let best = -1;
  let bestKey = [Infinity, Infinity];
  decision.options.forEach((option, i) => {
    const key = option.type === 'part'
      ? [state.parts[option.part].hp === 0 ? Infinity : state.parts[option.part].hp, i]
      : [state.heroes[option.hero].hp, (option.hero - seat + n) % n];
    if (key[0] < bestKey[0] || (key[0] === bestKey[0] && key[1] < bestKey[1])) [best, bestKey] = [i, key];
  });
  return best < 0 ? 0 : best;
}
