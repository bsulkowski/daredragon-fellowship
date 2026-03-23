# Design Decisions

Internal notes on game mechanics and design choices, not communicated directly to players.

---

## Design Philosophy and Identity

Foundational constraints that define what kind of game this is — and what it deliberately refuses to be.

### Setting Agnosticism

The rules are deliberately setting-agnostic. The only fixed elements of the fictional world are:
- A **dragon** — a powerful, evil creature
- **Daredevils** — fearless warriors committed to extreme team effort (though any character class is valid: sorcerer, bard, knight, cyber-ninja, etc.)

Everything else — the world, the aesthetic, the character names — is left to the players. The game can be played in low fantasy, sci-fi, medieval, modern, or any other setting without changing a single rule.

Action names in the rules are abstract on purpose (Strike, Charge, Precision Strike, Shield, etc.) and are meant to be re-interpreted for the chosen setting. A "Charge" might be a cavalry rush, a rocket boost, or a sugar-fuelled sprint. A "Shield" might be a magical barrier, a riot shield, or an outstretched cape.

### Spatial Agnosticism

There is no notion of position or location in the game. Characters do not occupy specific squares, zones, or coordinates. No character is "closer" or "farther" from the dragon or from each other in any mechanical sense. Available actions are determined entirely by the cards a player holds — not by where they are standing.

The board (or rather *boardlet* — it is deliberately small and minimal) does not represent a battlefield. It serves two purely administrative purposes: tracking HP levels and tracking turn sequence. The circular layout of the turn track is a convenience, not a map.

This is an intentional design constraint, not an omission. Removing spatial logic eliminates a whole category of tactical complexity, keeping the game focused on timing, cooperation, and card management. It also makes the game playable anywhere — no table large enough for a map required.

The AoE attack mechanic (hitting target and both neighbours) is the one exception that has a spatial flavour: players sit in a circle and "neighbours" are defined by seating order. This is a social/physical arrangement, not a tracked game state.

### No Differentiation Between Player Characters

All daredevils share identical statistics and have access to the same set of actions. There are no classes, specialisations, or permanent trait differences between players.

The alternative — giving each character a fixed trait profile (high HP tank, maximum-damage attacker, support specialist) — would narrow what each player is expected or incentivised to do. A player locked into a tank role does not get to feel the urgency of saving someone. A player locked into a support role does not get to land a decisive blow. Fixed roles compress the range of meaningful experiences and make large parts of the game feel routine for whoever drew the "wrong" character for the current situation.

With equal statistics and a random hand, the game instead creates roles dynamically and temporarily. The tactical situation — who has the right card, who is prone, who has the highest HP right now — determines who acts as shield, who acts as attacker, who sacrifices their turn to pull a teammate off the ground. These decisions land with weight precisely because they are not predetermined. Choosing to shield when you could attack is a meaningful act of sacrifice. Choosing to attack when you are the most vulnerable person at the table is a meaningful act of courage.

The design does not leave players free to ignore each other — cooperative card draw and the Helping Hand mechanic make interdependence structural, not optional. But within that constraint, it pushes players toward experiencing every role over the course of a session: acting with initiative, feeling exposed and supported, and making hard calls that have consequences for the whole group.

---

## Core Loop and Timing

How a round actually flows: the central engine, its rhythm, and the card abstraction that drives it.

### Warm-up as the Central Mechanic

With few exceptions, actions are not resolved instantly. Both daredevils and the dragon spend several turns preparing before an action takes effect. This warm-up mechanic is the core of the game.

Several consequences follow from this:

- **Overlapping execution.** Multiple actions from multiple actors are in preparation simultaneously. At any given moment, a daredevil may be mid-charge while the dragon is mid-swing and another daredevil is deciding whether to shield or attack. The board edge serves as a timeline for all of this.
- **Timing as skill.** Knowing when to start an action — so that it resolves at the right moment relative to what else is happening — is the primary tactical challenge. A riposte lands hardest immediately after a dragon attack; a slow charge started at the wrong time is a wasted turn.
- **Tension and interruption.** A prepared action can be disrupted before it resolves: the dragon's Roar cancels all in-progress daredevil actions; a Knockdown cancels a specific one; a prone daredevil faces warm-up penalties. This creates persistent tension — committing to a slow, powerful action is a risk, not just a choice.
- **Readable battlefield.** Because cards are placed face-up on the board edge at the turn they will resolve, all players can see what is coming — for both sides. This transparency is intentional: the challenge is not hidden information but coordination under pressure.

The dragon's cool-down (a recovery period after its action resolves) is the complement to warm-up: it creates windows of vulnerability that reward well-timed attacks.

### Turn Interleaving

The dragon acts between every pair of players (not once per round). This keeps all players engaged and prevents long idle stretches. For 4 players it means 4 dragon turns per round — the dragon is a constant, active presence rather than a periodic threat.

### Card Mapping Rationale

High face-value cards → powerful/slow actions (Charge = 9, warm-up 4; Precision Strike = 8, warm-up 3).
Low face-value cards → fast/weak or utility actions (Quick Strike = 5, warm-up 1; Helping Hand = 4/3/2, warm-up 2).
Face cards → special/support roles (A = Intervention Dodge, K = Draw Aggro, Q/J = Shield).
Joker → exceptional effects (First Aid restores HP; Dragon's Joker = Regeneration).

This keeps card selection intuitive: drawing a high card generally means more power but more commitment.

### The Dracometer

Non-linear damage scale: `0 1 2 3 4 5 6 8 10 13 16 20 25`

Values roughly double every 3 steps above 6. This achieves two goals simultaneously:
- Low values scale linearly (fine-grained for small HP pools and weak attacks)
- High values scale exponentially (a +1s modifier on a strong attack is much more impactful than on a weak one)

Expressing all modifiers as steps on the scale (rather than flat additions) keeps in-game arithmetic trivial — players only ever look up a position on the scale, never add numbers. This is intentional to maintain game flow.

The name "smokometr" (dracometer) and the symbol Ϟ (lightning) are flavour choices to reinforce the game's identity.

---

## Daredevil-Side Mechanics

What the fellowship can do, what limits them, and how the game scales with group size.

### Cooperative Card Draw

Players cannot draw cards for themselves — only for others. This is the sole source of new cards. The constraint is a core cooperation mechanic: players who focus on attacking will starve their hand unless teammates actively support them. It creates a natural tension between offensive and supportive play without requiring a dedicated "support role".

### Hand Size Tied to HP

A player's maximum hand size is determined by their current HP via a stepped mapping (see rules 3.3): full health allows 6 cards; as HP drops through defined thresholds, the limit falls to 5, then 4, then 3, reaching 0 (incapacitated) at 0 HP. This is not a bookkeeping detail — it is a core expression of what HP means in this game.

The intent is to make every threshold crossed feel like a real, immediate loss of capability, not just a countdown toward elimination. A player at low HP does not simply have less margin for error; they have fewer cards, which means fewer options, less influence over what actions they can even attempt. The degradation is felt at the table, not only on the HP track.

This serves several purposes:

- **HP loss is never "innocent".** Players cannot treat their HP as a resource to be spent freely until they hit zero. Each threshold crossed narrows what they can do right now, which creates pressure throughout the fight — not just at the end.
- **Incapacitation is less of a cliff edge.** Because a player's effectiveness has already been declining across thresholds, the moment of being knocked out of play carries less shock. The game has been communicating the loss progressively. Elimination is a continuation of a trend, not a sudden surprise.
- **Recovery actions gain weight.** Restoring HP (via First Aid or Helping Hand) is not just about survival thresholds — crossing a threshold back upward directly restores a player's range of action. Healing becomes tangibly empowering, not merely damage-undoing.

The hand-limit mechanism keeps the game's emotional arc honest: the fellowship genuinely weakens as the fight wears on, and players feel it in their hands before they feel it on the board.

### Target Selection at Execution, Not Warm-Up Start

Players choose the target of their actions at the moment of execution, not when warm-up begins. This is a deliberate simplification: early playtests showed that committing to a target at warm-up start created significant overhead — players had to track and remember their declared target across multiple turns, which added cognitive load without meaningful strategic gain.

The lore fit is imperfect (a warrior mid-charge probably has a target in mind), but the tradeoff favours playability. The game already asks players to track warm-up progress, prone states, and dragon timing; adding target tracking was one bookkeeping burden too many.

### Guard Actions (Standby Mechanic)

Shield and Intervention Dodge have no warm-up time but are consumed at the first dragon attack. This models reactive defence: a player commits to guarding without knowing the exact timing or target of the attack. It creates meaningful decisions around when to guard vs. when to act offensively.

The guard mechanic being a "czuwanie" (standby) type means it cannot be used by a prone hero — a hero on the ground is truly vulnerable.

### Prone State

Being knocked to the ground is a significant debuff:
- Warm-up +1 on most actions
- Damage dealt -2s
- Cannot use standby actions or warm-up 4 actions

This creates a recovery problem: the prone hero needs help (Helping Hand, First Aid) but has limited ability to contribute while down. Interdependence is reinforced.

### Number of Players Scaling

For more than 4 players: dragon gets +1s on all attacks. This compensates for the increased total HP of the fellowship and the greater number of cards in circulation. No other scaling is applied — the board extension handles physical layout for 5–6 players.

---

## Dragon-Side Mechanics

How the dragon operates as a mechanical system — damage, structure, and targeting behaviour.

### Separate HP per Body Part

Each of the dragon's four body parts has independent HP. This means:
- Players can make strategic choices about which part to focus on
- Weakening a body part has mechanical consequences (-1s at 1–13 HP, +1 warm-up and -2s at 0 HP)
- Partial progress is always visible on the board, maintaining motivation in long fights

The dragon is defeated only when all four parts reach 0, preventing a single concentrated attack strategy.

### Dragon Target: Persistent, Not Random

The dragon's target does not change each turn — once a daredevil draws aggro, the dragon fixates on them and attacks that same target repeatedly until the target shifts. This is a deliberate design choice with several cascading effects:

- **Predictable threat, organised response.** The targeted player can anticipate incoming damage. This makes coordinated protection viable and meaningful: teammates know *who* to shield, *when*, and can plan around it. If the target changed every turn, organised defence would be guesswork.
- **Draw Aggro becomes high-stakes.** Voluntarily drawing the dragon's attention is not a neutral repositioning — it is a commitment to absorb sustained fire. The action carries real personal risk, which makes it a genuine act of sacrifice when a teammate is low on HP.
- **The targeted player is not helpless, but truly under pressure.** Knowing you are the target across multiple turns creates a distinct psychological experience: urgency, reliance on teammates, and the relief when the focus finally shifts. This is a narrative beat as much as a mechanical state.
- **Glare actions matter precisely because the target is otherwise locked.** If the target shifted freely, glare effects would be unremarkable. Because the target is persistent, a glare is a meaningful disruption — either a lifeline for the current victim or a tactical redirect. No player is ever completely safe, since a glare can land the dragon's attention on anyone at any moment.

When the dragon has no target, attack cards are discarded without effect (the dragon "bluffs"). This means deliberately letting the dragon lose its target is sometimes a valid strategy — and it means the opening phase of the game (before any daredevil has attacked) is completely safe from direct dragon attacks.

---

## Presentation and Story

How the game is communicated through the rulebook's narrative layer.

### Story Commentary in the Rulebook

As an exception to the setting-agnostic principle, the rulebook will include a role-playing-style story that interleaves with the abstract rules sections. This story is set in a generic fantasy universe and serves as a worked example / flavour layer.

Tone requirements:
- Rich, vivid language — not dry or technical
- A bit humorous, with warmth and lightness
- Age-appropriate for roughly 7–12 years old; no higher rating than that. Safe for kids, enjoyable for adults.
- The story should not contradict or overshadow the mechanics, only illustrate and colour them.

The story commentary is the one place where setting is fixed. Everywhere else in the rules, setting-neutral language is preferred.

### Dragon archetype: magic predator, not treasure hoarder

The story dragon (Skeldrath) is not the classic gold-hoarding dragon. He is indifferent to wealth and entirely uninterested in the inner lives of lesser creatures. His fixation is magical energy — he hunts artifacts of accumulated power and drains them to compound his own strength.

This choice serves several purposes:
- It gives each fellowship member a personal loss that is *specific* and *recoverable* (a rune-axe still in the lair, still faintly glowing) rather than just destroyed
- It makes Skeldrath more threatening as a concept: he doesn't hate people, he simply doesn't register them. Indifference is scarier than malice for this age group.
- It avoids the "greedy dragon" cliché while staying true to the game's design principle that the dragon is powerful and evil, not comedic or sympathetic
- The lair becomes a graveyard of drained artifacts rather than a treasure room — visually distinct and tonally fitting
