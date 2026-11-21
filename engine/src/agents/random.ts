// Random agents — the lower baseline of #41. The result depends on what
// "random" means, so there are two variants:
//
// (a) uniform over all legal options at each decision: playing each distinct
//     card in hand and dealing are equally likely;
// (b) the kind of move first (play or deal, half and half when both are
//     possible), then the card; targets and discards are uniform in both.
//
// Each agent draws from its own seeded stream, so the engine's shuffles do not
// depend on the agents, and a game is reproducible from the two seeds.

import type { Agent } from '../decisions.ts';
import { createRng, nextInt } from '../random.ts';

export type RandomVariant = 'a' | 'b';

export function randomAgent(seed: number, variant: RandomVariant = 'a'): Agent {
  const rng = createRng(seed);
  return {
    decide(decision) {
      const n = decision.options.length;
      if (variant === 'b' && decision.kind === 'turn') {
        const plays = decision.options.flatMap((o, i) => (o.type === 'play' ? [i] : []));
        const draw = decision.options.findIndex((o) => o.type === 'draw');
        if (plays.length === 0 || nextInt(rng, 2) === 0) return draw;
        return plays[nextInt(rng, plays.length)];
      }
      return nextInt(rng, n);
    },
  };
}
