# Ambiguity Register

Places where the rules ([base_en.md](../rules/base_en.md), v1.0.2) can be read more than one way, or say nothing, and the engine had to pick a reading. Tracked in [issue #38](https://github.com/bsulkowski/daredragon-fellowship/issues/38).

The engine implements the rules as they stand. Where they are ambiguous, it adopts a reading and records it here; the code marks the spot with `#38`. Once the engine is complete, the clarifications are synced back into the rules in one go. From then on the engine follows the rules text.

Statuses:

- **Author**: decided by the author.
- **Provisional**: adopted by the engine, awaiting the author's review. *Outcome* marks readings that can change the result of a game.
- **Open**: not implemented yet; the engine has not chosen.

## Decided by the author

| # | Where | Decision |
|---|---|---|
| A1 | 2.1 Intervention Dodge | Being knocked to the ground is a full Knockdown: it cancels the saved daredevil's warming-up action. |
| A2 | 2.1 Shield vs Direct Attack | The +1Ϟ (target warming up) and +2Ϟ (target on the ground) bonuses come from the target's state. The Shield only prevents the warm-up knockdown. |
| A3 | 2.1 Guard | A guard that cannot act at the first dragon attack (the shielder or dodger is the target; the Dodge target is on the ground) stays active for later attacks until its owner's next turn. |
| A4 | Dummy (extensions) | The validity check for Shield and Intervention Dodge is to be removed (#8); in simulations both are always valid. |
| A5 | Dummy (extensions) | Shield and Dodge targets follow the rules; "lowest current HP" applies to Helping Hand and First Aid only. |
| A6 | Dummy at every seat | Count the cards of all other players, with thresholds scaled per player: ≤2n same suit, ≤4n same colour, more → different suit (n = number of other players; identical to the table for 4 players). |
| A7 | 2.3 (0 HP); 2.2 Knockdown | Dropping to 0 HP is an automatic knockdown: the daredevil's actions on the board (warming up or guard) are cancelled and they lie on the ground. Replaces P12 and P13. |
| A8 | 2.1 Guard, Intervention Dodge, Shield | When guards compete for the same attack, the one played last wins. Against a direct attack, a Dodge played after every Shield acts and the Shields keep waiting; otherwise the Shields act and the Dodge keeps waiting. Of several Dodges, the one played last acts. Replaces P8 and P9. |

## Provisional readings in the engine

### P1. Order of daredevil actions resolving on the same turn

- **Where:** 1.5; 2.1 Attack (targeting "the daredevil who initiated their attack last").
- **Readings:** (a) in the order they were initiated; (b) in an order the players choose; (c) simultaneously.
- **Adopted:** (a).
- **Why:** 2.1 already orders attacks by initiation for targeting; one fixed order keeps the engine deterministic without an extra decision.
- **Code:** `engine.ts` `heroTurn`.

### P2. The dragon's deck running out

- **Where:** 1.9 gives a reshuffle rule for the daredevils' deck only.
- **Readings:** (a) reshuffle the dragon's discard pile the same way; (b) the game ends.
- **Adopted:** (a).
- **Why:** it is the only rule for an exhausted deck. The author expects the dragon's deck to be hard to exhaust and may use it as a time limit; the baselines record reshuffles to check (#43).
- **Code:** `core.ts` `drawCard`.

### P3. Card draw and incapacitated players — *Outcome*

- **Where:** 1.9; 2.3 (an incapacitated daredevil holds no cards).
- **Readings:** (a) incapacitated players are skipped; (b) they are dealt a card that is discarded at once.
- **Adopted:** (a).
- **Why:** the sample gameplay skips them. (b) would drain the daredevils' deck faster.
- **Code:** `engine.ts` `dealCards`.

### P4. Passing

- **Where:** 1.5, 1.9.
- **Readings:** (a) a turn is either playing a card or dealing; (b) a player may also pass.
- **Adopted:** (a).
- **Why:** the rules name only these two options.
- **Code:** `engine.ts` `heroTurn`.

### P5. The dragon's warm-up +1 at 0 HP: when it is evaluated

- **Where:** 2.3 The Dragon ("All HP-based penalties are evaluated at the moment an attack resolves").
- **Readings:** (a) when the card is placed; (b) at resolution, which would move a card already on the board.
- **Adopted:** (a).
- **Why:** the sample gameplay (Turn 108❖) applies it at placement. Moving a placed card when a part drops to 0 has no support in the text.
- **Code:** `dragon.ts` `dragonWarmup`.

### P6. Combining Ϟ modifiers

- **Where:** 1.10.
- **Readings:** (a) sum all modifiers, then move along the dracometer once, stopping at its ends; (b) apply them one by one, stopping at the ends each time.
- **Adopted:** (a).
- **Why:** the results differ only at the ends of the scale, where (b) depends on an order the rules do not give.
- **Code:** `dracometer.ts` `modify`; `dragon.ts` `attackSteps`.

### P7. AoE neighbours of a target next to an incapacitated daredevil — *Outcome*

- **Where:** 2.2 AoE Attack ("the target and both its neighbours").
- **Readings:** (a) seat neighbours, incapacitated ones included (and then unaffected); (b) the nearest daredevils who are not incapacitated.
- **Adopted:** (a).
- **Why:** the sample gameplay (Turn 104❖) uses seat neighbours.
- **Code:** `dragon.ts` `aoeAttack`.

### P8. Several Intervention Dodges on one attack

Decided by the author: see A8.

### P9. Intervention Dodge together with Shield on a direct attack

Decided by the author: see A8.

### P10. Intervention Dodge against an AoE attack

- **Where:** 2.1 Intervention Dodge ("does not apply to AoE attacks" refers to loss of balance only).
- **Readings:** (a) the target avoids the attack and is knocked down; the neighbours are hit as usual; no loss of balance; (b) the Dodge does not work against AoE at all.
- **Adopted:** (a).
- **Why:** the text excludes only the loss of balance for AoE attacks. The Dodge and the Shields do not compete here (A8 does not apply): the Dodge covers the target, the Shields cover the others, and a Shield of the saved target's own still protects them.
- **Code:** `dragon.ts` `aoeAttack`.

### P11. Shields against an AoE attack that hits nobody

- **Where:** 2.1 Shield vs AoE Attack, Guard.
- **Readings:** (a) when everyone in the area is on the ground or dodged, the Shields keep waiting; (b) they are used up, and a shielder from outside enters the area and is hit.
- **Adopted:** (a).
- **Why:** per A3, a guard that has nothing to act on keeps waiting. Under (b) a shielder would be hurt for protecting nobody.
- **Code:** `dragon.ts` `aoeAttack`.
- **Note:** the author finds Shield vs AoE in need of rework to be consistent without being overcomplicated; to be revisited later.

### P12. Actions of a daredevil who becomes incapacitated

Decided by the author: see A7.

### P13. Incapacitated daredevils lie on the ground

Decided by the author: see A7.

### P14. Knockdown of a daredevil already on the ground

- **Where:** 2.2 Knockdown, Direct Attack.
- **Readings:** (a) it still cancels their action; (b) it has no effect.
- **Adopted:** (a).
- **Why:** Knockdown is defined by both effects: cancelling the current action, then knocking them to the ground. A target on the ground who is warming up gets both bonuses (+1Ϟ, +2Ϟ).
- **Code:** `dragon.ts` `knockDown`.

### P15. Roar against a hand of fewer than 2 cards

- **Where:** 2.2 Roar.
- **Readings:** (a) discard what there is; (b) the Roar has no effect on that player.
- **Adopted:** (a).
- **Why:** the plain reading; (b) would reward an empty hand.
- **Code:** `dragon.ts` `roar`.

### P16. An entangled body part when its attack only menaces

- **Where:** 2.1 Entangle; 1.6 (an attack without a target is discarded).
- **Readings:** (a) the part is not used, so it stays entangled; (b) the entanglement is removed.
- **Adopted:** (a).
- **Why:** the entanglement is removed "only when the attack resolves", and a menace resolves nothing.
- **Code:** `engine.ts` `dragonPlay`.

### P17. Entangle is an attack

- **Where:** 2.1 (table: Entangle is of type Attack; Attack: orchestrated attack, taking the target).
- **Readings:** (a) it counts as an attack for the orchestrated attack and takes the target when there is none; (b) it does neither.
- **Adopted:** (a).
- **Why:** the table gives it the type Attack, and the Attack rules speak of attacks without exceptions.
- **Code:** `heroes.ts` `attack`, `attackSteps`.

### P18. Entangle and damage modifiers

- **Where:** 2.1 Entangle (damage 0); Attack (riposte, orchestrated attack).
- **Readings:** (a) no damage, whatever the modifiers; (b) the modifiers move 0 along the dracometer (+2Ϟ riposte → 2).
- **Adopted:** (a).
- **Why:** the sample gameplay says "Entangle itself deals 0 damage; its value is the +1Ϟ bonus" (Turn 56). Its effect is the entanglement.
- **Code:** `heroes.ts` `attack`.

### P19. Which body parts Entangle can target

- **Where:** 2.1 Entangle ("not currently being used in an attack").
- **Readings:** "being used" means (a) the part of the dragon's attack warming up; (b) also a part whose attack is cooling down. And a part already entangled: (c) allowed, without further effect; (d) not allowed.
- **Adopted:** (a) and (c).
- **Why:** the cool-down comes after the attack has resolved; the entanglement is a single token, so entangling twice changes nothing.
- **Code:** `heroes.ts` `attack`, `partInUse`.

### P20. Orchestrated attack with mixed suits — *Outcome*

- **Where:** 2.1 Attack ("if two or more attacks resolve on the same turn and the cards share the same suit, each attacker gains +1Ϟ per additional attacker").
- **Readings:** (a) each attack gains +1Ϟ per other attack of its own suit resolving that turn (♠♠♥: the spades +1 each, the heart nothing); (b) the bonus applies only when all the attacks share a suit.
- **Adopted:** (a).
- **Why:** it extends the two-card case without discarding the matching pair because of a third attack.
- **Code:** `heroes.ts` `attackSteps`.

### P21. On the ground: when the penalties are evaluated (#24) — *Outcome*

- **Where:** 2.1 On the ground (warm-up +1, damage −2Ϟ); 2.3 ("All HP-based penalties are evaluated at the moment an attack resolves").
- **Readings:** for a daredevil who played a card on the ground and is helped up before it resolves: (a) the warm-up stays as placed, the −2Ϟ is evaluated at resolution (and so drops); (b) both stay; (c) both are re-evaluated (the card moves).
- **Adopted:** (a).
- **Why:** the card is placed on a turn when played, as with the dragon (P5); damage modifiers follow 2.3 and are evaluated at resolution. A Helping Hand resolving on the same turn as the helped daredevil's attack, but initiated earlier, removes the penalty (P1).
- **Code:** `heroes.ts` `heroWarmup`, `attackSteps`.

### P22. Helping Hand on an incapacitated daredevil

- **Where:** 2.1 Helping Hand, First Aid; 2.3.
- **Readings:** (a) not eligible; (b) they stand up, still at 0 HP.
- **Adopted:** (a).
- **Why:** First Aid explicitly works "even if the daredevil is incapacitated", which suggests other actions do not; standing at 0 HP would change nothing anyway (A7).
- **Code:** `heroes.ts` `helpingHand`.

### P23. Draw Aggro: which dragon warm-ups it extends

- **Where:** 2.1 Draw Aggro ("If performed during the dragon's warm-up, extends that warm-up by +1").
- **Readings:** (a) any action warming up (rules text), including Roar and Health Regeneration; (b) attacks only (sample gameplay, Turn 54: "while the dragon has an attack in progress").
- **Adopted:** (a).
- **Why:** the engine follows the rules text; the sample's wording covers the case it shows.
- **Code:** `heroes.ts` `drawAggro`.

### P24. Draw Aggro and attacks taking the target on the same turn

- **Where:** 2.1 Attack (no target: the dragon takes the attacker initiated last), Draw Aggro.
- **Readings:** (a) actions resolve in the order of initiation (P1); an attack takes the target only when there is none, or when it was taken by an attack earlier that turn; Draw Aggro always sets it; (b) Draw Aggro always wins.
- **Adopted:** (a).
- **Why:** it applies both rules literally in one order. Draw Aggro initiated after the attacks wins; initiated before them, it fills the empty target and the attacks leave it.
- **Code:** `heroes.ts` `attack`, `drawAggro`.

### P25. Targets of daredevil actions

- **Where:** 1.5; 2.1.
- **Readings:** whether the engine should offer only useful targets.
- **Adopted:** every target the rules allow is offered: any body part for an attack, even one at 0 HP; any other daredevil for First Aid, even at full HP. A Helping Hand or First Aid with nobody eligible resolves without effect.
- **Why:** the engine does not judge choices; agents do.
- **Code:** `heroes.ts`.

## Open: to be decided later

- Dummy: where received cards go in the pile; Joker vs a suited card in the play condition (#9); the "lowest current HP" body part: does it include parts already at 0?
