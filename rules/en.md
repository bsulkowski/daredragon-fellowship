# Board Game "Daredragon Fellowship"

*Author: Bartosz Sułkowski*

## Table of Contents

1. Introduction
   1. Design Principles
   2. Prerequisites
2. Core Game Rules
   1. Actors and Their Attributes
   2. Initial Setup
   3. Turn Sequence
   4. Performing Actions by Daredevils
   5. Performing Actions by The Dragon
   6. The Goal
   7. Role-playing
   8. Cooperative Card Draw
   9. The Dracometer
3. Sample Gameplay
4. Reference Tables
   1. Daredevils' Actions
   2. Dragon's Actions
   3. Health Points
5. Summary Sheets
   1. Damage Dealt
   2. Modifiers to Damage Dealt
   3. Warm-up Time
   4. Modifiers to Warm-up Time
6. Release Notes
   1. Game Balance
   2. Revision History

---

## 1. Introduction

In the game you play as a fellowship of heroes dare to stand against a dreadful dragon.

### 1.1. Design Principles

1. Extreme cooperation: built upon direct positive interactions, sacrifice of personal gain and being heavily interdependent.
2. Spatially agnostic: available player actions and enemy behaviour determined by cards.
3. Simple tactical gameplay, based on proper timing of actions, adapted to dynamically evolving situation.
4. Epic adventure and ad-hoc role-playing experience.
5. Open game design: widely accessible for players, game developers and publishers.

### 1.2. Prerequisites

| | | |
|---|---|---|
| **Players** | 4–6 people | |
| **Cards** | 2 standard 54-card decks (including 2 jokers) | |
| **Pieces** | 8–10 distinguishable tokens, able to represent 2 states (like chess pieces or meeples, that can stand or lie down)<br><br>2 tokens | |
| **Printables** | `board_v0.12.pdf` — Board<br>`board_extension_v0.13.pdf` — Board Extension (5–6 players)<br>Cheat-sheet | |

---

## 2. Core Game Rules

### 2.1. Actors and Their Attributes

Heroes, dragon, body parts

HP, stance, entanglement

Persistent target

### 2.2. Initial Setup

HP = 25

2 cards each player

Dragon no target

First player to move — one who most recently helped someone

### 2.3. Turn Sequence

*(to be written)*

### 2.4. Performing Actions by Daredevils

Resolving actions

Initiating action

Smok nie ma kart na ręce. Zawsze gra pierwszą kartę z góry swojej talii.

As soon as prev action finished

### 2.5. Performing Actions by The Dragon

*(to be written)*

### 2.6. The Goal

Players shared goal is to defeat the dragon, by disabling all of its body parts. Any incapacitated heroes are then revived, so the whole fellowship can celebrate the victory. There are no individual scores. Particular actions of bravery and heroism are not to compare them against each other, but to build…, that would last even after the game is finished.

Players fail to achieve the goal if all of them happen to get incapacitated by the dragon.

### 2.7. Role-playing

Players encouraged

immersion

game mechanics as a framework, which can be filled with the story

as long as it fits chosen "klimat" and follows mechanics

### 2.8. Cooperative Card Draw

On their turn, player may opt to draw cards, instead of playing action. They do this by dealing one card to each of their fellow players. Player cannot directly get a card for themselves.

This is the only way to get cards, so keep an eye on your co-players and take care they do not run out of cards.

If, at any time, a player gets more cards on hand than their allowance, they have to discard extra cards.

### 2.9. The Dracometer (Ϟ)

The damage inflicted via dragon or heroes attacks are subject to various modifiers. It is always done according to the following sequence, called the "dracometer".

For players convenience, it is also marked via the red numbers on the board.

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 13 | 16 | 20 | 25 |
|---|---|---|---|---|---|---|---|----|----|----|----|-----|

---

## 3. Sample Gameplay

*(to be done)*

---

## 4. Reference Tables

### 4.1. Daredevils' Actions

| Card | Action | Type | Warm-up | Damage |
|---|---|---|---|---|
| A | Intervention Dodge | Support, Guard | — | — |
| K | Draw Aggro | Support | 1 | — |
| Q, J | Shield | Support, Guard | — | — |
| 10 | Entangle | Attack | 3 | 0 |
| 9 | Charge | Attack | 4 | 8 |
| 8 | Precision Strike | Attack | 3 | 6 |
| 7, 6 | Strike | Attack | 2 | 5 |
| 5 | Quick Strike | Attack | 1 | 5 |
| 4, 3, 2 | Helping Hand | Support | 2 | — |
| Joker | First Aid | Support | 4 | (8) |

| Action | Description |
|---|---|
| **Attack** | Deal damage to chosen body part of the dragon. If proper timing, get +2Ϟ.<br>Przy braku celu, jeśli śmiałek wykona atak, to smok bierze go na cel. |
| **Guard** | *(to be written)* |
| **Entangle** | Oplątana może zostać część ciała smoka, która nie jest w danej chwili używana w ataku. Przy pierwszym użyciu tej części ciała zostaje ona uwolniona, kosztem czasu przygotowania +1 oraz obrażeń -1Ϟ. |
| **Intervention Dodge** | Cancel the damage, but make a fellow hero fall to the ground. |
| **Draw Aggro** | Set the player as a target for the dragon. If during warm-up, +1 turns. |
| **Shield vs Direct Attack** | *(to be written)* |
| **Shield vs AoE Attack** | Obrażenia -2Ϟ, jeśli osłania śmiałek będący w obszarze ataku. W przeciwnym razie -3Ϟ, ale osłaniający wchodzi także w obszar działania ataku. Zmniejsza obrażenia dla wszystkich. |
| **Helping Hand** | *(to be written)* |
| **First Aid** | Heal |
| **On the ground** | Distraction, Helping Hand, Draw Cards<br>Warm-up +1 |

### 4.2. Dragon's Actions

| Card | Body Part | Action | Type | Warm-up | Cool-down | Damage |
|---|---|---|---|---|---|---|
| A ♥♦ | — | Fire Breath | AoE Attack | 2 | 1 | 8 |
| A ♠♣ | — | Roar | Special | 1 | 1 | — |
| K | Jaws | Crush | Direct Attack | 4 | 2 | 13 |
| Q | Jaws | Bite | Direct Attack | 3 | 2 | 10 |
| J | Tail | Swing | AoE Attack, Knockdown | 3 | 2 | 6 |
| 10, 9 | Legs | Trample | Direct Attack, Knockdown | 2 | 2 | 8 |
| 8 | Paws | Heavy Strike | Direct Attack | 3 | 1 | 8 |
| 7, 6 | Paws | Strike | Direct Attack | 2 | 1 | 6 |
| 5 | Paws | Quick Strike | Direct Attack | 1 | 1 | 5 |
| 4 ♥♦ | — | Far Glare Right | Special | 0 | 0 | — |
| 4 ♠♣ | — | Far Glare Left | Special | 0 | 0 | — |
| 3, 2 ♥♦ | — | Glare Right | Special | 0 | 0 | — |
| 3, 2 ♠♣ | — | Glare Left | Special | 0 | 0 | — |
| Joker | — | Health Regeneration | Special | 1 | 1 | (8) |

| Action | Description |
|---|---|
| **Direct Attack** | Deal damage to target. If proper timing, get +1Ϟ, and cause knockdown unless player is shielded.<br>If hero lays on the ground, get +2Ϟ.<br>Przy braku celu, zamiast ataku, smok tylko straszy i kończy ruch. |
| **AoE Attack** | Area of Effect Attack. Deal damage to target and its both neighbours. Does not affect players on the ground.<br>If no target, *(to be written)* |
| **Knockdown** | Cancel current player action and make them fall. |
| **Roar** | Cancel all players actions and make them discard 2 cards from hand each. |
| **Glare** | Gdy smok zagra łypnięcie, to zmienia odpowiednio cel (łypnięcie o 1 w prawo/lewo, dalekie łypnięcie o 2 w prawo/lewo), licząc od obecnego celu. Przy braku celu liczy od pola między graczami. |
| **Health Regeneration** | *(to be written)* |
| **Number of Players** | +1Ϟ |

### 4.3. Health Points

#### Daredevils

| HP | Impact |
|---|---|
| 25–21 | Max 6 cards on hand. |
| 20–14 | Max 5 cards on hand. |
| 13–1 | Damage dealt -1Ϟ. |
| 13–7 | Max 4 cards on hand. |
| 6–1 | Max 3 cards on hand. |
| 0 | No cards at hand (incapacitated).<br>Daredevil can no longer be a target of dragon's attacks. |

#### The Dragon

| HP of given body part | Impact on attacks using this body part |
|---|---|
| 13–1 | Damage dealt -1Ϟ. |
| 0 | Warm-up time +1.<br>Damage dealt -2Ϟ. |

---

## 5. Summary Sheets

### 5.1. Damage Dealt

| Damage | Dragon's Direct Attacks | Dragon's AoE Attacks | Daredevils' Attacks |
|---|---|---|---|
| 13 | [K] Crush | | |
| 10 | [Q] Bite | | |
| 8 | [10] [9] Trample\*<br>[8] Heavy Strike | [A♥♦] Fire Breath | [9] Charge |
| 6 | [7] [6] Strike | [J] Tail Swing\* | [8] Precision Strike |
| 5 | [5] Quick Strike | | [7] [6] Strike<br>[5] Quick Strike |

(\*) Causes knockdown.

### 5.2. Modifiers to Damage Dealt

| Damage | Dragon's Attacks | Daredevils' Attacks |
|---|---|---|
| +2Ϟ | Daredevil is lying on the ground.\* | Riposte right after dragon's attack. |
| +1Ϟ | Attack during daredevil's warm-up.\*<br><br>More than 4 players. | Attack on entangled body part. |
| -1Ϟ | HP of body part between 1 and 13. | HP between 1 and 13. |
| -2Ϟ | HP of body part equal 0. | Daredevil is lying on the ground. |
| -3Ϟ | For each shield.\*\* | |

(\*) Not applicable to AoE attacks.
(\*\*) Daredevil in AoE does not shield itself.

### 5.3. Warm-up Time

| Warm-up Time | Dragon's Actions, Cool-down = 2 | Dragon's Actions, Cool-down = 1 | Daredevils' Actions | Daredevils' Actions |
|---|---|---|---|---|
| 4 | [K] Crush | | [9] Charge | [Joker] First Aid |
| 3 | [Q] Bite<br>[J] Tail Swing | [8] Heavy Strike | [8] Precision Strike | [10] Entangle |
| 2 | [10] [9] Trample | [7] [6] Strike<br>[A♥♦] Fire Breath | [7] [6] Strike | [4] [3] [2] Helping Hand |
| 1 | | [5] Quick Strike<br>[A♠♣] Roar<br>[Joker] Health Regeneration | [5] Quick Strike | [K] Draw Aggro |

### 5.4. Modifiers to Warm-up Time

| Warm-up Time | Dragon's Actions | Daredevils' Actions |
|---|---|---|
| +1 | HP of body part equals 0.<br><br>Body part used in attack is entangled.<br><br>Draw aggro is performed during warm-up. | Daredevil is lying on the ground.\* |

(\*) Not available: actions with warm-up time 4 nor standby actions: [A] Intervention Dodge, [Q] [J] Shield.
Dragon's cool-down time +1, if lost balance due to intervention dodge.

---

## 6. Release Notes

At the current state, the game is complete, fully playable and enjoyable. However, there still might be balance issues that need polishing. I am also going to extend it with new features.

### 6.1. Game Balance

Fighting the dragon is not a routine activity. It is supposed to be a challenge, that forces players to cooperate extensively. However, if you find the game too easy or too hard to enjoy, you can adjust the difficulty by making dragon's attacks stronger or weaker. For example adding +1Ϟ modifier to all attacks will make the dragon stronger by roughly 25%.

You can also adjust the pace of the game, by adjusting strength of attacks for both the dragon and daredevils, while keeping the same level of HP.

Some of the dragon's attacks might appear "unfairly" powerful or annoying… Well, the dragon was never meant to be your sparring buddy.

### 6.2. Revision History

| Version | Date | Changes |
|---|---|---|
| 0.13.x | 2025-x-x | Instructions (EN) |
| 0.13.1 | 2025-04-07 | Small corrections |
| 0.13 | 2025-02-05 | Redesigned shield and dodge mechanics<br>Simplified cheat-sheet<br>Extended supported number of players |
| 0.12.1 | 2025-01-02 | Structure and style of page<br>Rules clarification |
| 0.12 | 2024-11-12 | Mechanics adjustment (target selection, modifiers)<br>Extended cheat-sheet |
| 0.11.2 | 2024-11-11 | Downloadable board and cheat-sheet |
| 0.11.1 | 2024-08-24 | Instructions — detailed description of game rules (PL) |
| 0.9 | 2023-12-29 | Designed the board |
| 0.7 | 2023-09-24 | Introduced the dracometer |
| 0.3 | 2023-06-18 | Introduced cooperative card drawing |
| 0.2 | 2022-10-08 | Detailed mechanics prototype |
| 0.1 | 2022-09-23 | Inception of design principles |
