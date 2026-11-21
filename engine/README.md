# Daredragon Fellowship — Rules Engine

English / [Polski](README_PL.md)

A reference implementation of the rules of [Daredragon Fellowship](../README.md), a cooperative card-based board game for 4–6 players. It serves three purposes:

1. **Verifying the rules.** Writing them down as code surfaces ambiguities.
2. **Checking the [sample gameplay](../rules/sample_gameplay_en.md)** move by move.
3. **Balance baselines.** How do random play and the automated player (the Dummy) fare against the dragon?

The work is tracked in [issue #33](https://github.com/bsulkowski/daredragon-fellowship/issues/33).

## Status

The engine is complete: the building blocks, the turn loop, the dragon's actions with the guards that react to them, and the daredevils' actions. The moves of the [sample gameplay](../rules/sample_gameplay_en.md) are recorded in `test/sample/` and replayed by the tests. The balance baselines come next.

Where the rules can be read more than one way, the engine's reading is recorded in the [ambiguity register](AMBIGUITIES.md).

| Module | Contents |
|---|---|
| `src/dracometer.ts` | The damage scale (rules 1.10) and modifiers as steps along it |
| `src/cards.ts` | Cards as strings in the rules' notation (`9♣`, `10♠`, `Joker`), suits, colours, the 54-card deck |
| `src/actions.ts` | The action tables for the daredevils (2.1) and the dragon (2.2), as data |
| `src/random.ts` | Seeded random numbers and shuffling; the same seed always gives the same game |
| `src/deck.ts` | Draw pile and discard pile, reshuffling, forcing a specific next card (for replaying the sample gameplay) |
| `src/state.ts` | The game state as plain data; a new game, or a game resuming from a given position |
| `src/decisions.ts` | The decision interface between the engine and the agents |
| `src/events.ts` | Events reported while a game runs |
| `src/engine.ts`, `src/core.ts` | The turn loop: interleaved turns, warm-ups and cool-downs, card draw, hand limits, end of the game |
| `src/heroes.ts` | The daredevils' actions (2.1): attacks with riposte, orchestration and entanglement, Entangle, Draw Aggro, Helping Hand, First Aid; the on-the-ground restrictions |
| `src/agents/dummy.ts` | The Dummy (rules extensions), usable at any seat |
| `src/agents/random.ts` | Random agents: (a) uniform over all legal options, (b) play or deal first, then the card |
| `src/dragon.ts` | The dragon's actions (2.2): direct and AoE attacks, Knockdown, Roar, Glare, Health Regeneration; Shield and Intervention Dodge (2.1); incapacitation |

### Decisions

Whenever the rules leave a choice to a player, the engine issues a decision listing every legal option, and an agent answers with the index of its pick:

- `turn`: play one of the cards in hand, or deal cards to the others,
- `target`: the target of an action, chosen when the action resolves,
- `discard`: a card to discard (over the hand limit, or after the dragon's Roar).

A decision with a single legal option is not asked. The same interface serves random play, the Dummy, the replay of the sample gameplay and, later, human players.

## Design

- **No dependencies, no DOM.** Plain TypeScript modules that run in Node and in the browser.
- **TypeScript source is the package.** Node runs it directly with `--experimental-strip-types`, so there is no build step. The code therefore uses only erasable syntax (no `enum`, `namespace` or parameter properties) and imports with `.ts` extensions.
- **Plain data state.** Decks and random generator states are plain objects that can be copied with `structuredClone`.
- **Deterministic.** All randomness comes from a seeded generator. Any card can also be forced to come next, which replaying the sample gameplay needs.

## Usage

Play a whole game with an agent:

```ts
import { createGame, runGame, type Agent } from 'ddf-engine';

const firstOption: Agent = { decide: () => 0 };
const outcome = runGame(createGame({ players: 4, seed: 42 }), firstOption, { maxTurns: 500 });
// { result: 'victory' | 'defeat' | 'timeout', turn, phase, partsHp, heroesHp }
```

Or drive it step by step, e.g. from a user interface:

```ts
import { createGame, play } from 'ddf-engine';

const game = play(createGame({ seed: 42 }), { onEvent: (event) => console.log(event) });
let step = game.next();
while (!step.done) step = game.next(0); // step.value is the decision; answer with an option index
```

The building blocks can be used on their own:

```ts
import { createRng, createDeck, fullDeck, draw, dragonAction, modify } from 'ddf-engine';

const rng = createRng(42);
const card = draw(createDeck(fullDeck(), rng), rng)!;
dragonAction(card); // e.g. { name: 'Bite', part: 'jaws', type: 'direct', warmup: 3, cooldown: 2, damage: 10, ... }
modify(8, 2);       // 13: base 8 with +2Ϟ
```

## Development

Requires Node.js 22.12 or newer.

```sh
npm test
```

Node strips the types without checking them. To check the sources, use a one-off TypeScript compiler (it is not a dependency):

```sh
npx -p typescript@5.8 tsc --noEmit --strict --target es2022 --module nodenext \
  --allowImportingTsExtensions --verbatimModuleSyntax --erasableSyntaxOnly src/*.ts
```

## License

The code in this directory is under the [MIT License](LICENSE). The game rules and the rest of the repository are under [CC BY 4.0](../LICENSE).
