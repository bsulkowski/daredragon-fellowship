# Daredragon Fellowship — Rules Engine

English / [Polski](README_PL.md)

A reference implementation of the rules of [Daredragon Fellowship](../README.md), a cooperative card-based board game for 4–6 players. It serves three purposes:

1. **Verifying the rules.** Writing them down as code surfaces ambiguities.
2. **Checking the [sample gameplay](../rules/sample_gameplay_en.md)** move by move.
3. **Balance baselines.** How do random play and the automated player (the Dummy) fare against the dragon?

The work is tracked in [issue #33](https://github.com/bsulkowski/daredragon-fellowship/issues/33).

## Status

Stage 1 of 4 of the engine is done: the core building blocks.

| Module | Contents |
|---|---|
| `src/dracometer.ts` | The damage scale (rules 1.10) and modifiers as steps along it |
| `src/cards.ts` | Cards as strings in the rules' notation (`9♣`, `10♠`, `Joker`), suits, colours, the 54-card deck |
| `src/actions.ts` | The action tables for the daredevils (2.1) and the dragon (2.2), as data |
| `src/random.ts` | Seeded random numbers and shuffling; the same seed always gives the same game |
| `src/deck.ts` | Draw pile and discard pile, reshuffling, forcing a specific next card (for replaying the sample gameplay) |

Coming next: the turn timeline and decision interface, then the dragon's and the daredevils' actions.

## Design

- **No dependencies, no DOM.** Plain TypeScript modules that run in Node and in the browser.
- **TypeScript source is the package.** Node runs it directly with `--experimental-strip-types`, so there is no build step. The code therefore uses only erasable syntax (no `enum`, `namespace` or parameter properties) and imports with `.ts` extensions.
- **Plain data state.** Decks and random generator states are plain objects that can be copied with `structuredClone`.
- **Deterministic.** All randomness comes from a seeded generator. Any card can also be forced to come next, which the sample gameplay validator needs.

## Usage

```ts
import { createRng, createDeck, fullDeck, draw, dragonAction, modify } from 'ddf-engine';

const rng = createRng(42);
const dragonDeck = createDeck(fullDeck(), rng);
const card = draw(dragonDeck, rng)!;
dragonAction(card); // e.g. { name: 'Bite', part: 'jaws', type: 'direct', warmup: 3, cooldown: 2, damage: 10, ... }
modify(8, 2);       // 13: base 8 with +2Ϟ
```

## Development

Requires Node.js 22.12 or newer.

```sh
npm test
```

## License

The code in this directory is under the [MIT License](LICENSE). The game rules and the rest of the repository are under [CC BY 4.0](../LICENSE).
