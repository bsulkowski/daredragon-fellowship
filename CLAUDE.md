# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dare Dragon Fellowship** is a board game design project. The repository contains game assets in Polish and English, with no source code or build system.

## File Types & Tooling

- `.af` — Affinity Designer source file (`board_sketch.af`), the primary design source
- `.svg` — Exported vector graphics (boards, QR codes); editable with Inkscape or Affinity Designer
- `.pdf` — Print-ready exports generated from SVG sources
- `.odt` — Game rules / cheat sheets (LibreOffice Writer)
- `.xls` — Card mapping spreadsheets (`mapowanie kart`, LibreOffice Calc / Excel)

## Naming Conventions

- Version suffix: `_v0.13`, `_v0.13.1`, etc.
- Language suffix: `_pl` = Polish; no suffix = English
- Board variants: `board_4_players` (4-player layout), `board_extension` (expansion board)

## Content Structure

The latest versions as of the last update:
- **Main board:** `board_v0.12` (English/Polish)
- **4-player board:** `board_4_players_v0.3`
- **Extension board:** `board_extension_v0.13` (English/Polish)
- **Cheat sheet:** `cheat-sheet_v0.13.1` (English/Polish)
- **Card mapping:** `mapowanie kart v0.4.xls`

When adding new file versions, follow the existing versioning pattern and produce both SVG and PDF exports. For bilingual content, maintain both unsuffixed (English) and `_pl` (Polish) variants.
