# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dare Dragon Fellowship** is a cooperative card-based board game for 4–6 players. The repository is transitioning to a Markdown-based structure. Files in the repository root are legacy/archival and will be migrated or cleaned up systematically.

## Repository Structure

```
rules/
  pl.md              # Polish rules — canonical, complete (v0.13.1)
  en.md              # English rules — in progress; stubs marked *(to be written)*
design/
  decisions.md       # Internal notes on mechanics and design choices
  style.md           # Notes on how rules are written and presented
(root)               # Legacy files: SVG/PDF boards, ODT cheat sheets, XLS card mappings
```

## Authoring Conventions

- Rules files are versioned in their own **6.x Revision History** table — update it when making changes
- Damage modifiers use `s` suffix in Polish (`+1s`, `-2s`) and `Ϟ` symbol in English (`+1Ϟ`, `-2Ϟ`)
- Incomplete English sections are marked with `*(to be written)*` — do not remove stubs, fill them in
- Card face values use local conventions: Polish uses `D` (Dama) and `W` (Walet) for Q and J; English uses `Q` and `J`

## Legacy Files

Files in the repository root (`.svg`, `.pdf`, `.odt`, `.xls`, `.af`) are the archival versions. The primary sources going forward are the Markdown files in `rules/`. Legacy files are referenced by filename in the requirements tables (section 1.2 of each rules file).
