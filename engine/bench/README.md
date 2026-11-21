# Balance Baselines

How do play without strategy and the Dummy fare against the dragon? Tracked in [issue #43](https://github.com/bsulkowski/daredragon-fellowship/issues/43).

```sh
npm run baselines          # 2000 games per setting, about 30 s
npm run baselines -- 500   # fewer games
```

## Setup

- **Agents:**
  - **random (a)**: uniform over all legal options at each decision;
  - **random (b)**: chooses between playing and dealing first, then the card;
  - **Dummy**: the automated player of the rules extensions, at every seat.

  See `src/agents/`.
- **Settings:** 4, 5 and 6 players; dragon modifier −3Ϟ to +1Ϟ (rules 3.1; +0Ϟ is the standard game).
- **Games:** 2000 per setting, 90 000 in all. Game *i* of every setting uses the same seed, so all agents and modifiers face the same shuffled decks.
- **Turn limit:** 1000 daredevil turns. No game reached it.
- **Results** in `results/`:
  - `games.csv.gz`: one row per game;
  - `summary.json`: aggregates per setting;
  - `tables.md`: every measure as a table.
- **Rules readings:** all decided by the author except those still provisional in [AMBIGUITIES.md](../AMBIGUITIES.md). Of those that can change outcomes: P11, Shield vs an AoE attack that hits nobody (rare), and P28, the Dummy's Joker matching (2 cards in 54).

## Findings

Win rates in %, with the 95% interval in `tables.md`:

| Players | Agent | −3Ϟ | −2Ϟ | −1Ϟ | **+0Ϟ** | +1Ϟ |
|---|---|---|---|---|---|---|
| 4 | random (a) | 31.2 | 6.7 | 0.9 | **0.2** | 0.0 |
| 4 | random (b) | 0.5 | 0.1 | 0.0 | **0.0** | 0.0 |
| 4 | Dummy | 25.1 | 6.3 | 1.4 | **0.4** | 0.1 |
| 5 | random (a) | 48.3 | 16.6 | 3.6 | **0.9** | 0.1 |
| 5 | random (b) | 0.7 | 0.1 | 0.0 | **0.0** | 0.0 |
| 5 | Dummy | 35.0 | 13.6 | 3.9 | **0.8** | 0.1 |
| 6 | random (a) | 86.5 | 52.8 | 20.6 | **5.2** | 1.3 |
| 6 | random (b) | 3.5 | 0.8 | 0.0 | **0.0** | 0.0 |
| 6 | Dummy | 74.0 | 40.5 | 17.4 | **5.0** | 1.1 |

1. **The game does not play itself.** In the standard game (+0Ϟ), random play wins at most about 5% of games (6 players) and practically never with 4. On a loss the dragon keeps on average 50 / 42 / 28 of its 100 HP under random (a), for 4 / 5 / 6 players.
2. **The Dummy is no stronger than uniform random play.** At +0Ϟ the two are within their intervals. At −3Ϟ the Dummy is clearly weaker: 25% against 31% with 4 players, 74% against 87% with 6.
   - The gap between random play and a simple strategy was to give a lower bound on how much the players' decisions matter. With the Dummy as that strategy, the bound is about zero.
   - The Dummy's algorithm mostly paces dealing against playing; it encodes little tactics. A more telling bound needs a better bot, which is beyond this stage.
3. **(a) and (b) differ widely.** Random (b) deals on half of its turns and almost never wins: at most 3.5%, even at −3Ϟ. How often the fellowship acts rather than deals is what decides these baselines.
4. **The modifier is a strong lever.** Each step of −1Ϟ multiplies the win rate several times over, e.g. random (a) with 4 players: 0.2% → 0.9% → 6.7% → 31%.
5. **Six players have it much easier than four,** despite the dragon's +1Ϟ above 4 players: at −2Ϟ, 53% against 7% for random (a). A likely reason: the fellowship's combined HP grows by 50% while the dragon's damage grows by one step, and the dragon still acts after every daredevil turn.
6. **The dragon's deck rarely runs out.** At +0Ϟ it happens in 0.1–9% of games. The median turn of the first reshuffle (87–128) lies beyond the 75th percentile of game length. This supports the author's impression (#43). As a time limit, the deck would mostly cut long games at easier settings: at −2Ϟ the deck runs out in 3–35% of games.

These are baselines, not a verdict on balance. Players who coordinate attacks, guards and riposte windows — as in the sample gameplay — play far better than any of these agents.
