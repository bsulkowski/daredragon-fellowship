# Rules Presentation Style

Notes on how the rules are written and presented, independent of game logic.

---

## Language Versions

- Polish (`rules/pl.md`) is the canonical version — always complete and up to date.
- English (`rules/en.md`) is a translation in progress. Incomplete sections are marked `*(to be written)*`. Polish text left in the English file is intentional — it marks content awaiting translation, not an error.
- The modifier notation differs by language: Polish uses `s` suffix (`+1s`, `-2s`), English uses the Ϟ symbol (`+1Ϟ`, `-2Ϟ`).
- Card face values differ: Polish uses `D` (Dama = Queen) and `W` (Walet = Jack); English uses `Q` and `J`.

## Section Structure

The rules are divided into two conceptually distinct parts:

- **Sections 1–3**: Narrative, flowing prose intended to be read before the first game. Introduces the world, explains how to play step by step.
- **Sections 4–5**: Reference tables intended for lookup during play. Dense, terse, table-heavy. Not meant to be read linearly.
- **Section 6**: Meta-notes for the designer/player community (balance, future work, changelog).

Keep these registers separate. Section 4–5 entries should be as short as possible. Section 2 explanations can use examples and narrative.

## Table Conventions

Two-table pattern for actions (sections 4.1, 4.2):
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
- The role-playing section (2.7) is intentionally warmer and more personal in tone than the rest.
- Balance notes (6.1) can be candid and informal — they address engaged players who want to tune the experience.

## Examples

Examples appear inline in the rules text, not in separate boxes. They follow a consistent pattern:
> "For example, for 4 players, if [condition], then [outcome]."

The sample gameplay section (3) is a separate dedicated section, currently a placeholder.

---

## Story Commentary Characters

The story commentary woven through the rulebook follows a fixed fellowship of four. They are introduced gradually across sections — readers learn who they are piece by piece, mirroring how the players themselves will discover the game.

### The Fellowship

#### Gorrak Copperfist — Dwarf, tough melee, axe

Gorrak is built like a small mountain that learned to hold a grudge. His axe is ancient, his beard is legendary, and his sentences are short. He communicates mostly in grunts, but the fellowship has learned to read the grunts: one grunt means *fine*, two means *not fine*, three means *run*.

Beneath the gruffness is someone who would — and has — walked into a burning building for each of his companions without pausing to ask questions. He has given each team member a dwarvish nickname. None of them can pronounce the real ones.

**Motivation:** The dragon raided his clan's mine, collapsing the main shaft and burying the Great Axe of his great-great-grandmother Hildra under several tonnes of rock. Gorrak wants the axe back. He also wants revenge. If pressed, he will admit the axe is slightly more important.

---

#### Lirien Swiftblade — Elf, agile melee, sword

Lirien has been alive for three hundred and forty-seven years and has the patience to prove it — except when someone makes a tactical error she spotted two turns ago, in which case the patience evaporates immediately. She moves like water around obstacles, her blade finding gaps that shouldn't exist.

She keeps a journal of poetry about her companions. She has told no one about this journal. She never will.

**Motivation:** The dragon's fire swept through the Heartwood Grove, an ancient forest she had been sworn to protect since before any of her current companions were born. Centuries of growth turned to ash in a single afternoon. For an elf, the destruction of an old forest is not just a loss — it is a personal insult across generations.

---

#### Pip Bramblewick — Hobbit, ranged warrior, crossbow

Pip barely reaches Gorrak's shoulder, which suits him fine — he has an excellent view of the battlefield from down there, and nobody expects the small one to be the most dangerous shot in three counties. His crossbow is almost as tall as he is. He has named it. He will not say what the name is.

He always has food somewhere on his person. The origin and quantity of this food is unclear. It has never run out.

**Motivation:** The dragon destroyed his prize mushroom patch — twelve years of careful cultivation, including two varieties he had spent six years developing himself — and knocked over his mother's apple cart on the way out. His mother told him it wasn't worth the trouble and that he should let it go. Pip is, politely but firmly, proving her wrong.

---

#### Magnus Ashford — Human, sorcerer, hammer

Magnus carries a large enchanted hammer that once belonged to his warrior uncle. He uses it as a walking staff. He uses it as a hammer when the spells get complicated. His spells work reliably about 95% of the time. The remaining 5% are, in his words, "instructive."

His cat, Theorem, survived the tower fire and now travels with the fellowship. Theorem is perpetually unimpressed by everyone, including the dragon.

**Motivation:** The dragon incinerated his research tower, along with twelve years of notes and his only copy of *Advanced Draconic Theory, Vol. 7* — a book he had been waiting fourteen months to borrow from a colleague. He now has extremely personal reasons to study dragons up close.

---

### Shared History

The four met seven years ago, answering the same notice tacked to a village board:

> *WANTED: Brave souls. Dragon, probably small. Reward: negotiable.*

The dragon was not small. The reward was never negotiated. But they won — barely, chaotically, and with significant damage to a barn — and somehow kept finding each other on subsequent jobs.

They are now an unofficial, unlicensed adventuring company with no agreed name, a shared debt at one inn, and a complicated reputation in at least three towns. They bicker constantly and would not trade each other for anything.

They are not family by blood. By every other measure, they are.
