# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dare Dragon Fellowship** is a cooperative card-based board game for 4–6 players.

## Repository Structure

Language versions have suffix: `<lang> = en | pl`

```
rules/
  base_<lang>.md            # Base rules
  sample_gameplay_<lang>.md # Sample gameplay (extracted from base rules)
  extensions_<lang>.md      # Rules extensions — new ideas, WIP, optional mechanics
design/
  decisions_<lang>.md       # Internal notes on mechanics and design choices
  style.md                  # Notes on how rules are written and presented
  story.md                  # Story commentary: characters, dragon, lair
gameplay/
  turn_<number>.jpg         # Photos of sample gameplay
board/
  base_<lang>.svg           # Board SVG source
  base_<lang>.pdf           # Board generated PDF
  extension_<lang>.svg      # Board extension SVG source
  extension_<lang>.pdf      # Board extension generated PDF
  cheat_sheet_<lang>.tex    # Cheat sheet source (LaTeX, for PDF generation)
  cheat_sheet_<lang>.pdf    # Cheat sheet generated PDF
  dragon_black_red.jpg      # Picture of the dragon
  title_dragon.svg          # Title card with game title and dragon
engine/                     # Rules engine (TypeScript, MIT) — see engine/README.md, issue #33
  src/                      # Modules, run directly via node --experimental-strip-types
  test/                     # npm test (node:test)
```

## Authoring Conventions

- When making changes, update the version number in two places:
  - The *Version: x.y.z* annotation near the top of section 3 in both `rules/base_en.md` and `rules/base_pl.md`
  - The **Revision History** table in both `README.md` and `README_pl.md`
- **Major version** (`0.13` → `0.14`): any change to game mechanics
- **Minor version** (`0.13.2` → `0.13.3`): wording, story, formatting — no mechanic change
- Version numbers kept identical between PL and EN at all times
- Damage modifiers use the `Ϟ` symbol in both languages (`+1Ϟ`, `-2Ϟ`)
- Card face values use local conventions: Polish uses `D` (Dama) and `W` (Walet) for Q and J; English uses `Q` and `J`
- Extensions files have no version history
- The version number tracks the official rules only. Changes in `engine/` do not bump it.

## Rules Engine

- `engine/` implements the rules as they stand; it does not define them. Where the rules are ambiguous, the engine adopts a provisional reading and records it in the ambiguity register (issue #38).
- Clarifications found while building the engine are synced back into the rules in one go (and may then bump the version). From that point on, the engine must stay consistent with the rules text.
