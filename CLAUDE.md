# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dare Dragon Fellowship** is a cooperative card-based board game for 4–6 players.

## Repository Structure

Language versions have suffix: `<lang> = en | pl`

```
rules/
  <lang>.md               # Base rules
  cheat_sheet_<lang>.md   # Cheat sheet
  extensions_<lang>.md    # Rules extensions — new ideas, WIP, optional mechanics
design/
  decisions_<lang>.md     # Internal notes on mechanics and design choices
  style.md                # Notes on how rules are written and presented
  story.md                # Story commentary: characters, dragon, lair
board/
  base_<lang>.svg         # Board SVG source
  base_<lang>.pdf         # Board generated PDF
  extension_<lang>.svg    # Board extension SVG source
  extension_<lang>.pdf    # Board extension generated PDF
  qrcode_web_<lang>       # QR Code link to rules on web page
  dragon_background.jpeg      
```

## Authoring Conventions

- Rules files are versioned in their own **6.x Revision History** table — update it when making changes
- **Major version** (`0.13` → `0.14`): any change to game mechanics
- **Minor version** (`0.13.2` → `0.13.3`): wording, story, formatting — no mechanic change
- Version numbers kept identical between PL and EN at all times
- Damage modifiers use `s` suffix in Polish (`+1s`, `-2s`) and `Ϟ` symbol in English (`+1Ϟ`, `-2Ϟ`)
- Card face values use local conventions: Polish uses `D` (Dama) and `W` (Walet) for Q and J; English uses `Q` and `J`
- Extensions files have no version history
