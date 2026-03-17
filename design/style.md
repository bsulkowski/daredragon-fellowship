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
- The modifier notation differs by language: Polish uses `s` suffix (`+1s`, `-2s`), English uses the Ϟ symbol (`+1Ϟ`, `-2Ϟ`).
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
- Correct: "obrażenia +1s" / "damage +1Ϟ"
- Avoid: "increases damage by 1" (ambiguous — could mean a flat +1 HP)

## Tone

- Player-facing rules (sections 1–4) use second person plural ("you", "Wam/Wasze" in Polish). The game is addressed to the group, not an individual.
- The role-playing section (1.8) is intentionally warmer and more personal in tone than the rest.
- Balance notes (5.1) can be candid and informal — they address engaged players who want to tune the experience.

## Examples

Examples appear inline in the rules text, not in separate boxes. They follow a consistent pattern:
> "For example, for 4 players, if [condition], then [outcome]."

The sample gameplay section (3) is a separate dedicated section, currently a placeholder.

Story characters and world details are in `design/story.md`.

## Story Commentary

Story commentary is woven into the rules files alongside the technical content:

- Story parts are written in **italics** to visually distinguish them from rules text.
- Each story fragment in `design/story.md` is annotated with a **reveal** keyword indicating which section or subsection it belongs to.
- Within that section, story commentary follows the technical information — rules text comes first, story text after.
- Story sections do not interrupt or replace rules text; they are always appended at the end of the relevant block.
