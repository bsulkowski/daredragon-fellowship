# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dare Dragon Fellowship** is a cooperative card-based board game for 4–6 players.

## Repository Structure

```
rules/
  pl.md              # Polish rules — v0.13.2
  en.md              # English rules — v0.13.2
design/
  decisions.md       # Internal notes on mechanics and design choices
  style.md           # Notes on how rules are written and presented
  story.md           # Story commentary: characters, dragon, lair
board/               # Board SVG sources and generated PDFs (EN and _pl variants)
```

## Authoring Conventions

- Rules files are versioned in their own **6.x Revision History** table — update it when making changes
- Damage modifiers use `s` suffix in Polish (`+1s`, `-2s`) and `Ϟ` symbol in English (`+1Ϟ`, `-2Ϟ`)
- Card face values use local conventions: Polish uses `D` (Dama) and `W` (Walet) for Q and J; English uses `Q` and `J`
