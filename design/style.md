# Rules Presentation Style

Notes on how the rules are written and presented, independent of game logic.

---

## Versioning

- **Major version** (`0.13` → `0.14`): any change to game mechanics — new rules, modified rules, rebalancing.
- **Minor version** (`0.13.2` → `0.13.3`): changes that do not affect gameplay — wording, examples, story commentary, structure, formatting.
- Version numbers are kept **identical between PL and EN** at all times.
- Each version history entry has a **one-sentence summary** of what changed.
- Changes made on the same date are released together under a single version bump — do not increment separately for each change.

## Language Versions

- Both language versions are kept in sync and treated as equals. Conflicts are resolved via git history.
- Both language versions use the Ϟ symbol for modifier notation (`+1Ϟ`, `-2Ϟ`).
- Card face values differ: Polish uses `D` (Dama = Queen) and `W` (Walet = Jack); English uses `Q` and `J`.

## Section Structure

The rules are divided into two conceptually distinct parts:

- **Sections 1–2**: Narrative, flowing prose intended to be read before the first game. Introduces the world, explains how to play step by step.
- **Sections 3–4**: Reference tables intended for lookup during play. Dense, terse, table-heavy. Not meant to be read linearly.
- **Section 5**: Meta-notes for the designer/player community (balance, future work, changelog).

Keep these registers separate. Section 3–4 entries should be as short as possible. Section 1 explanations can use examples and narrative.

## Table Conventions

Two-table pattern for actions (sections 3.1, 3.2):
1. **Summary table**: card → action name, type, warm-up, damage. One row per card value. Quick lookup during play.
2. **Description table**: action name → full rules text. One row per distinct action (not per card). Cross-referenced from the summary.

Footnotes under tables use `(\*)`, `(\*\*)` format.

Missing values in tables use `—` (em dash), not `-` or blank.

Healing amounts in parentheses, e.g. `(8)`, indicate restoration rather than damage dealt.

## Modifier Notation

All modifiers are expressed as steps on the dracometer, not as absolute values. This should be reflected in the language used:
- Correct: "obrażenia +1Ϟ" / "damage +1Ϟ"
- Avoid: "increases damage by 1" (ambiguous — could mean a flat +1 HP)

## Tone

- Player-facing rules (sections 1–4) use second person plural ("you", "Wam/Wasze" in Polish). The game is addressed to the group, not an individual.
- The role-playing section (1.8) is intentionally warmer and more personal in tone than the rest.
- Balance notes (5.1) can be candid and informal — they address engaged players who want to tune the experience.

## Examples

Examples appear inline in the rules text, not in separate boxes. They follow a consistent pattern:
> "For example, for 4 players, if [condition], then [outcome]."

## Sample Gameplay Template (Section 2)

Section 2 presents a concrete play-through split into subsections (e.g. 2.1 Overture, 2.2 Trial of Strength, 2.3 Finale), each covering roughly 30 turns.

### Setup block

Each subsection opens with a setup block showing the initial state before Turn 1.

```
**Setup**

**HP:** Gorrak 25 · Lirien 25 · Pip 25 · Magnus 25 | Jaws 25 · Paws 25 · Legs 25 · Tail 25

**Target:** none

**Hands:** Gorrak: [Card] [Card] · Lirien: [Card] [Card] · Pip: [Card] [Card] · Magnus: [Card] [Card]
```

### Turn numbering

Turns are numbered in pairs: daredevil turns use plain integers, the dragon turn immediately following uses the same number with ❖. For 4 players:

**1** (Gorrak) → **1❖** (Skeldrath) → **2** (Lirien) → **2❖** (Skeldrath) → **3** (Pip) → **3❖** (Skeldrath) → **4** (Magnus) → **4❖** (Skeldrath) → **5** (Gorrak) → …

### Daredevil turn block

```
---

**Turn [N] — [Daredevil name]**

**Hand:** [Card] [Card] [Card]  *(Lirien: 2 · Pip: 3 · Magnus: 1)*

**HP:** Gorrak 25 · Lirien 18↓ · Pip 25 · Magnus 22 | Jaws 20 · Paws 25 · Legs 25~ · Tail 25

**Target:** Gorrak

**Pending:** Lirien's Strike (7♠) → Turn 3 · Dragon's Trample (10♥) → Turn 2❖

**Resolves:** [e.g. "Gorrak's Strike (7♠): 5 damage to Jaws (25→20 HP)"]

**Plays:** [Card] — [Action name], warm-up [N], card placed at Turn [M]

> **Mechanics:** [Technical note — damage formula, rule interaction. Omit if straightforward.]

*[Story — 1–3 sentences in italics, from the perspective of the acting player or the player whose action just fired.]*
```

### Dragon turn block

```
---

**Turn [N❖] — Skeldrath**

**HP:** Gorrak 25 · Lirien 18↓ · Pip 25 · Magnus 22 | Jaws 20 · Paws 25 · Legs 25~ · Tail 25

**Target:** Gorrak

**Dragon:** Trample (10♥) · warm-up 2/2 — **resolves**

**Resolves:** [Effect, if any]

**Plays:** [New card, if action slot is free]

> **Mechanics:** [Technical note — omit if straightforward.]

*[Story — Skeldrath's action described from the daredevils' perspective.]*
```

### Turn block notation

| Symbol | Meaning |
|---|---|
| `↓` suffix on daredevil | On the ground (standing is default, not shown) |
| `~` suffix on dragon body part | Entangled |
| `\|` in **HP** line | Separator between daredevil HP and dragon HP |
| `(25→20 HP)` in Resolves | HP change this turn |
| `warm-up N/M` | Currently on warm-up step N of M total |
| `cool-down N/M` | Currently on cool-down step N of M total |

## Story Commentary

Story characters and world details are in `design/story.md`.

Story commentary is woven into the rules files alongside the technical content:

- Story parts are written in **italics** to visually distinguish them from rules text.
- Each story fragment in `design/story.md` is annotated with a **reveal** keyword indicating which section or subsection it belongs to.
- Within that section, story commentary follows the technical information — rules text comes first, story text after.
- Story sections do not interrupt or replace rules text; they are always appended at the end of the relevant block.
