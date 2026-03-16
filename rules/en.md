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
5. Cheat-Sheet
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
| **Cards** | 2 standard 54-card decks (including 2 jokers), preferably in two different colours | One deck represents the daredevils' possible actions, the other the dragon's actions. |
| **Pieces** | 8–10 distinguishable tokens, able to represent 2 states (like chess pieces or meeples, that can stand or lie down)<br><br>2 tokens | Each daredevil receives 1 token. The dragon receives 4 tokens, one for each body part (jaws, paws, legs, tail).<br><br>The position of tokens on the board represents the remaining health points of the daredevils and the dragon (from 0 to 25). The secondary token state indicates status (daredevil lying down / dragon body part entangled).<br><br>One token tracks the current turn. The other marks the dragon's attack target. |
| **Printables** | `board.pdf` — Board<br>`board_extension.pdf` — Board Extension (5–6 players) | |

In a pinch, the game can also be played without tokens or a printed board, noting the required information on paper instead.

---

## 2. Core Game Rules

### 2.1. Actors and Their Attributes

Each player plays as one daredevil. Daredevils have endurance (health points; indicated by the position of their token on the board), stance (standing or lying on the ground; indicated by the token state) and a list of available actions (cards in hand; order does not matter).

The dragon is a large beast, so it has health points assigned separately to each of its four body parts (jaws, paws, legs, tail) indicated by tokens on the board. Each body part can be entangled, which is indicated by the state of the corresponding token.

Health points cannot drop below 0.

The dragon can have one of the daredevils as its persistent attack target. This is indicated by placing the target token next to the corresponding player.

### 2.2. Initial Setup

At the start of the game, each daredevil and each of the dragon's body parts has 25 health points.

The first deck, containing the dragon's actions, is shuffled and placed in the centre of the board.

The second deck, containing the daredevils' actions, is shuffled and placed next to the board. Each player draws 2 cards to their hand. The hand limit is 6, but may be reduced later as the daredevil's health points drop.

The dragon starts with no attack target. The target token is placed on the dragon's card deck in this case.

### 2.3. Turn Sequence

The player who most recently helped someone goes first.

Players take turns in clockwise order.

Between every two consecutive players there is a dragon turn.

For 4 players the sequence is:

1. Daredevil A
2. Dragon
3. Daredevil B
4. Dragon
5. Daredevil C
6. Dragon
7. Daredevil D
8. Dragon
9. and so on from the beginning

A token placed around the board helps track the current turn.

### 2.4. Performing Actions by Daredevils

Players keep their cards hidden from other players. It is important that each daredevil feels completely free to independently choose which action to perform, especially when it involves some sacrifice on their part.

On their turn, a daredevil may initiate an action by playing a card from their hand. A warm-up phase then begins, lasting a set number of daredevil turns depending on the action type. This is indicated by placing the action card on the edge of the board next to the turn on which the warm-up expires (not next to the turn of the daredevil who played it). At the start of that turn the action resolves and triggers its effect, and the corresponding card is placed on the daredevils' discard pile.

The warm-up for a daredevil always expires on a daredevil's turn. For example with 4 players: if the warm-up is 1 turn, it expires on the next daredevil's turn. If it is 2 turns, on the turn of the daredevil sitting opposite. If it is 4 turns, on the next turn of the daredevil who played it.

Guard-type actions (Intervention Dodge and Shield) have no warm-up time; instead they remain active until the daredevil's next turn. They trigger on the first dragon attack. The card for such an action is placed next to the turn of the daredevil who played it.

Daredevils decide the target of their actions at the very last moment — when the effect is triggered.

### 2.5. Performing Actions by The Dragon

The dragon has no hand of cards. To determine its next action, on its turn it plays the top card of its deck. A warm-up phase begins, lasting a set number of dragon turns. The action card is placed on the edge of the board next to the turn on which the warm-up expires. At the start of that turn the action resolves, followed by a cool-down phase. The action card is placed face down next to the turn on which the cool-down expires. At the start of that turn the card is placed on the dragon's discard pile and the dragon is ready for its next action.

The dragon's warm-up always expires on a dragon turn. If it is 1 turn, the action resolves on the next dragon turn (after 1 daredevil turn).

If a card has warm-up and cool-down of 0 (a Glare), it resolves with immediate effect, is placed on the dragon's discard pile, and the next card is played.

If the played card requires a target (direct or AoE attack) and the dragon has no target, the card is placed on the discard pile and the turn ends. The card triggers no effect. The dragon merely menaces the daredevils with a gesture alluding to the attack (baring its fangs, etc.).

### 2.6. The Goal

Your shared goal is to defeat the dragon, by reducing the health points of all its body parts to 0. Any incapacitated daredevils are then revived and the whole fellowship can celebrate the victory.

Defeat occurs when all daredevils are incapacitated.

There are no individual scores. The various acts of bravery and heroism in the game are not meant for comparing who is better, but to create positive experiences among you — ones that will leave a lasting impression even after the game ends.

### 2.7. Role-playing

The game imposes no single aesthetic, leaving the choice to you, according to your sensibilities, interests and imagination.

You are invited to better immerse yourselves in the game world through role-playing. The game mechanics provide only a framework — what happens, what the outcome of actions is. All of this can be dressed in a colourful story as commentary, according to your fancy.

For example, in one playtest session I ran with my children (aged 5–10), we chose the following heroes: Vege Knight, Snowman Chicken, Mistress of the Sweet, Cyber Ninja. The Mistress of the Sweet supported the rest of the fellowship, among other things by handing out sweets and gracing them with her sweet smile. Needless to say, the evil dragon didn't stand a chance against such a crew…

### 2.8. Cooperative Card Draw

On their turn, a player may opt to draw cards instead of playing an action. They do this by dealing one card to each of their fellow players. A player cannot directly get a card for themselves.

This is the only way to get cards. Keep an eye on your co-players — otherwise they might run out of cards…

If at any time a player has more cards in hand than their limit, they must discard the excess cards of their choice.

If the daredevils' deck runs out, shuffle the discard pile — it becomes the new deck.

### 2.9. The Dracometer (Ϟ)

Damage dealt by the dragon or daredevils always takes a value from a fixed sequence called the "dracometer".

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 13 | 16 | 20 | 25 |
|---|---|---|---|---|---|---|---|----|----|----|----|-----|

All damage modifiers are expressed as the corresponding change in position on the dracometer.

For example, with a base attack strength of 8, a +1Ϟ modifier increases the damage to 10, +2Ϟ to 13, and +3Ϟ to 16.

This solution achieves advanced attack scaling (linear for small values, roughly doubling every 3 steps above that), while sparing players from complex arithmetic.

For players' convenience, the dracometer is also marked via the red fields on the board.

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
| **Attack** | Deals damage to the chosen body part of the dragon.<br>+2Ϟ if immediately following the dragon's attack with that body part (riposte).<br>Orchestrated attack: if two or more attacks resolve on the same turn and the cards share the same suit, each attacker gains +1Ϟ per additional attacker landing on that turn.<br>If there is no target and a daredevil performs an attack, the dragon takes them as its target. If multiple attacks resolve on the same turn, the dragon targets the daredevil who initiated their attack last. |
| **Guard** | The action has no warm-up time. The daredevil stands guard until their next turn and performs the action on the first dragon attack. |
| **Entangle** | Can only be applied to a body part of the dragon that is not currently being used in an attack. Daredevils receive a +1Ϟ bonus when attacking an entangled body part. When that body part is first used in an attack, it spends an additional turn at the start of the warm-up freeing itself from the entanglement. |
| **Intervention Dodge** | The dragon's attack target avoids damage, but at the cost of being knocked to the ground. Cannot be used to save yourself. Cannot be performed on a daredevil already on the ground.<br>When the dragon's attack hits nothing, it loses its balance. The cool-down after the attack is extended by one turn, during which daredevils receive a +2Ϟ bonus to attacks. |
| **Draw Aggro** | The daredevil becomes the dragon's new attack target.<br>If performed during the dragon's warm-up, extends that warm-up by +1. |
| **Shield vs Direct Attack** | Shields another daredevil who is the dragon's attack target. Takes the damage on themselves while reducing it by -3Ϟ. Also takes the knockdown effect.<br>If multiple shields are active, the damage modifier stacks, but only the last shielder suffers the attack effects. |
| **Shield vs AoE Attack** | Shields all daredevils in the dragon's attack area, reducing damage by -3Ϟ.<br>A daredevil within the attack area does not shield themselves.<br>A daredevil outside the attack area also enters the area of effect but is shielded.<br>Multiple shields stack.<br><br>Example: The dragon's attack deals 8 damage and hits daredevils A, B and C. Shield is performed by daredevils C and D. In this case the daredevils receive damage: A — 1, B — 1, C — 4, D — 1. |
| **Helping Hand** | Helps another daredevil up from the ground. Cannot be used on yourself. |
| **First Aid** | Restores up to 8 health points, even if the daredevil is incapacitated. Helps them up. Cannot be used on yourself. |
| **On the ground** | When a daredevil is knocked to the ground, they cannot perform Guard-type actions or actions with a base warm-up of 4, i.e.:<br>— Intervention Dodge,<br>— Shield,<br>— Charge,<br>— First Aid.<br>Warm-up of remaining actions +1.<br>Damage dealt by the daredevil -2Ϟ. |

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
| **Direct Attack** | Deals damage to the target.<br>If during a daredevil's warm-up:<br>— damage +1Ϟ,<br>— causes knockdown unless there is a shield.<br><br>+2Ϟ if the daredevil is lying on the ground.<br><br>If there is no target, instead of attacking the dragon merely menaces and skips the turn. |
| **AoE Attack** | Deals damage to the target and both its neighbours. For example, with 4 players the neighbours of daredevil A are daredevils D and B.<br>Has no effect on daredevils lying on the ground.<br><br>If there is no target, instead of attacking the dragon merely menaces and skips the turn. |
| **Knockdown** | Cancels the daredevil's current action and knocks them to the ground. |
| **Roar** | Cancels all daredevils' actions. Each player discards 2 cards of their choice from their hand. |
| **Glare** | When the dragon plays a Glare, it shifts its attack target accordingly:<br>— Glare: by 1 to the right/left,<br>— Far Glare: by 2 to the right/left.<br><br>Imagine the dragon standing in the centre of the board, surrounded by daredevils. Turning right means selecting the next daredevil clockwise, turning left counter-clockwise.<br><br>For example with 4 players, if the current target was daredevil B, a Glare Left shifts the target to daredevil A, and a Far Glare Right to daredevil D.<br><br>If the dragon had no target, it has been watching the daredevils' actions, so it starts glaring from a position between the daredevil who had the previous turn and the next one. For example, if the turn before the dragon was daredevil B's, a Glare Left sets the target to daredevil B and a Glare Right to daredevil C. |
| **Health Regeneration** | Restores up to 8 health points to the weakest body part. In case of a tie, priority order is: jaws, paws, legs, tail. |
| **Number of Players** | If there are more than 4 players, the dragon gets a +1Ϟ bonus to damage on every attack. |

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

## 5. Cheat-Sheet

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

| Modifier | Dragon's Attacks | Daredevils' Attacks |
|---|---|---|
| +2Ϟ | Daredevil is lying on the ground.\* | Riposte right after dragon's attack with that body part.<br><br>Dragon knocked off balance (2 turns after Intervention Dodge). |
| +1Ϟ | Attack during daredevil's warm-up.\*<br><br>More than 4 players. | Attack on entangled body part.<br><br>Orchestrated attack: +1Ϟ per additional daredevil landing an attack on the same turn with the same suit. |
| -1Ϟ | HP of body part between 1 and 13. | HP between 1 and 13. |
| -2Ϟ | HP of body part equal 0. | Daredevil is lying on the ground. |
| -3Ϟ | For each shield.\*\* | |

(\*) Not applicable to AoE attacks.
(\*\*) Daredevil in AoE does not shield themselves.

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
| +1 | HP of body part equals 0.<br><br>Body part used in attack is entangled.<br><br>Draw Aggro is performed during warm-up. | Daredevil is lying on the ground.\* |

(\*) Not available: actions with warm-up time 4 nor Guard-type actions: [A] Intervention Dodge, [Q] [J] Shield.
Dragon's cool-down time +1, if lost balance due to Intervention Dodge.

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
| 0.14 | 2026-03-16 | Added orchestrated attack mechanic. |
| 0.13.2 | 2026-03-16 | Migrated to Markdown sources<br>Instructions (EN)<br>Moved cheat-sheet into rules |
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
