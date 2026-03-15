# Design Decisions

Internal notes on game mechanics and design choices, not communicated directly to players.

---

## Setting Agnosticism

The rules are deliberately setting-agnostic. The only fixed elements of the fictional world are:
- A **dragon** — a powerful, evil creature
- **Daredevils** — fearless warriors committed to extreme team effort (though any character class is valid: sorcerer, bard, knight, cyber-ninja, etc.)

Everything else — the world, the aesthetic, the character names — is left to the players. The game can be played in low fantasy, sci-fi, medieval, modern, or any other setting without changing a single rule.

Action names in the rules are abstract on purpose (Strike, Charge, Precision Strike, Shield, etc.) and are meant to be re-interpreted for the chosen setting. A "Charge" might be a cavalry rush, a rocket boost, or a sugar-fuelled sprint. A "Shield" might be a magical barrier, a riot shield, or an outstretched cape.

## Story Commentary in the Rulebook

As an exception to the setting-agnostic principle, the rulebook will include a role-playing-style story that interleaves with the abstract rules sections. This story is set in a generic fantasy universe and serves as a worked example / flavour layer.

Tone requirements:
- Rich, vivid language — not dry or technical
- A bit humorous, with warmth and lightness
- Age-appropriate for roughly 7–12 years old; no higher rating than that. Safe for kids, enjoyable for adults.
- The story should not contradict or overshadow the mechanics, only illustrate and colour them.

The story commentary is the one place where setting is fixed. Everywhere else in the rules, setting-neutral language is preferred.

---

## The Dracometer

Non-linear damage scale: `0 1 2 3 4 5 6 8 10 13 16 20 25`

Values roughly double every 3 steps above 6. This achieves two goals simultaneously:
- Low values scale linearly (fine-grained for small HP pools and weak attacks)
- High values scale exponentially (a +1s modifier on a strong attack is much more impactful than on a weak one)

Expressing all modifiers as steps on the scale (rather than flat additions) keeps in-game arithmetic trivial — players only ever look up a position on the scale, never add numbers. This is intentional to maintain game flow.

The name "smokometr" (dracometer) and the symbol Ϟ (lightning) are flavour choices to reinforce the game's identity.

## Cooperative Card Draw

Players cannot draw cards for themselves — only for others. This is the sole source of new cards. The constraint is a core cooperation mechanic: players who focus on attacking will starve their hand unless teammates actively support them. It creates a natural tension between offensive and supportive play without requiring a dedicated "support role".

## Turn Interleaving

The dragon acts between every pair of players (not once per round). This keeps all players engaged and prevents long idle stretches. For 4 players it means 4 dragon turns per round — the dragon is a constant, active presence rather than a periodic threat.

## Separate HP per Body Part

Each of the dragon's four body parts has independent HP. This means:
- Players can make strategic choices about which part to focus on
- Weakening a body part has mechanical consequences (-1s at 1–13 HP, +1 warm-up and -2s at 0 HP)
- Partial progress is always visible on the board, maintaining motivation in long fights

The dragon is defeated only when all four parts reach 0, preventing a single concentrated attack strategy.

## Guard Actions (Standby Mechanic)

Shield and Intervention Dodge have no warm-up time but are consumed at the first dragon attack. This models reactive defence: a player commits to guarding without knowing the exact timing or target of the attack. It creates meaningful decisions around when to guard vs. when to act offensively.

The guard mechanic being a "czuwanie" (standby) type means it cannot be used by a prone hero — a hero on the ground is truly vulnerable.

## Dragon Without a Target

When the dragon has no target, attack cards are discarded without effect (the dragon "bluffs"). This means glare mechanics (target-shifting) are strategically interesting: letting the dragon lose its target is sometimes beneficial. It also means the initial phase of the game (before any daredevil attacks) is completely safe from direct dragon attacks.

## Prone State

Being knocked to the ground is a significant debuff:
- Warm-up +1 on most actions
- Damage dealt -2s
- Cannot use standby actions or warm-up 4 actions

This creates a recovery problem: the prone hero needs help (Helping Hand, First Aid) but has limited ability to contribute while down. Interdependence is reinforced.

## Number of Players Scaling

For more than 4 players: dragon gets +1s on all attacks. This compensates for the increased total HP of the fellowship and the greater number of cards in circulation. No other scaling is applied — the board extension handles physical layout for 5–6 players.

## Card Mapping Rationale

High face-value cards → powerful/slow actions (Charge = 9, warm-up 4; Precision Strike = 8, warm-up 3).
Low face-value cards → fast/weak or utility actions (Quick Strike = 5, warm-up 1; Helping Hand = 4/3/2, warm-up 2).
Face cards → special/support roles (A = Intervention Dodge, K = Draw Aggro, Q/J = Shield).
Joker → exceptional effects (First Aid restores HP; Dragon's Joker = Regeneration).

This keeps card selection intuitive: drawing a high card generally means more power but more commitment.
