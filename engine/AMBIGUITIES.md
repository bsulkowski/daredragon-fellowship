# Ambiguity Register

Places where the rules ([base_en.md](../rules/base_en.md), v1.0.2) can be read more than one way, or say nothing, and the engine had to pick a reading. Tracked in [issue #38](https://github.com/bsulkowski/daredragon-fellowship/issues/38).

The engine implements the rules as they stand. Where they are ambiguous, it adopts a reading and records it here; the code marks the spot with `#38`. Once the engine is complete, the clarifications are synced back into the rules in one go. From then on the engine follows the rules text.

Statuses:

- **Author**: decided by the author (A1, A2, …).
- **Approved**: adopted by the engine and approved by the author as it stands (P1, P2, …). *Outcome* marks readings that can change the result of a game.
- **Open**: still to be decided by the author; the engine has adopted a reading meanwhile.

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
| A9 | 2.1 Attack (orchestrated attack) | Each attack gains +1Ϟ per other attack of its own suit resolving on the same turn; with ♠♠♥ the spades gain +1Ϟ each, the heart nothing. Replaces P20. |
| A10 | 2.1 On the ground; #24 | A card played on the ground keeps the warm-up it was placed with (+1). The −2Ϟ damage penalty is evaluated at resolution, so it drops if the daredevil has been helped up meanwhile. Replaces P21. |
| A11 | 2.1 Draw Aggro | Draw Aggro extends the dragon's warm-up only when an attack is warming up, not Roar or Health Regeneration. It rewards the player who draws the attack onto themselves and makes the dragon pay for redirecting an attack in preparation. As the sample gameplay says (Turn 54); the rules text to be clarified. Replaces P23. |
| A12 | 1.9 Cooperative Card Draw | Incapacitated players are skipped when dealing. Replaces P3. |
| A13 | 2.2 AoE Attack; 2.3 | An incapacitated daredevil is treated as lying on the ground (A7), so an AoE attack has no effect on them. The area stays the target and its seat neighbours; it does not extend past an incapacitated neighbour. Replaces P7. |
| A14 | Dummy (extensions) | Helping Hand is always valid, even with nobody on the ground: someone may be knocked down before it resolves. The validity check for Helping Hand is to be removed from the extensions, as for the guards (A4). Changes P27. |

## Approved readings

Adopted by the engine and approved by the author on 2026-11-21, except P10 and P11, which are open. Entries replaced by a decision point to it.

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

### P3. Card draw and incapacitated players

Decided by the author: see A12.

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

### P7. AoE neighbours of a target next to an incapacitated daredevil

Decided by the author: see A13.

### P8. Several Intervention Dodges on one attack

Decided by the author: see A8.

### P9. Intervention Dodge together with Shield on a direct attack

Decided by the author: see A8.

### P10. Intervention Dodge against an AoE attack — *Open*

- **Where:** 2.1 Intervention Dodge ("does not apply to AoE attacks" refers to loss of balance only).
- **Readings:** (a) the target avoids the attack and is knocked down; the neighbours are hit as usual; no loss of balance; (b) the Dodge does not work against AoE at all.
- **Adopted:** (a).
- **Why:** the text excludes only the loss of balance for AoE attacks. The Dodge and the Shields do not compete here (A8 does not apply): the Dodge covers the target, the Shields cover the others, and a Shield of the saved target's own still protects them.
- **Code:** `dragon.ts` `aoeAttack`.

### P11. Shields against an AoE attack that hits nobody — *Open*

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

### P20. Orchestrated attack with mixed suits

Decided by the author: see A9.

### P21. On the ground: when the penalties are evaluated (#24)

Decided by the author: see A10.

### P22. Helping Hand on an incapacitated daredevil

- **Where:** 2.1 Helping Hand, First Aid; 2.3.
- **Readings:** (a) not eligible; (b) they stand up, still at 0 HP.
- **Adopted:** (a).
- **Why:** First Aid explicitly works "even if the daredevil is incapacitated", which suggests other actions do not; standing at 0 HP would change nothing anyway (A7).
- **Code:** `heroes.ts` `helpingHand`.

### P23. Draw Aggro: which dragon warm-ups it extends

Decided by the author: see A11.

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

### P26. The Dummy's pile: where received cards go

- **Where:** extensions, Dummy (Setup: "a single pile"; Notes: discards "from the bottom").
- **Readings:** received cards go (a) on top; (b) to the bottom.
- **Adopted:** (a).
- **Why:** placing a dealt card on a pile puts it on top. Under (b), the bottom discards would throw away the newest cards.
- **Code:** `agents/dummy.ts` `dummyAgent`.

### P27. The Dummy's validity check beyond the listed cards

- **Where:** extensions, Dummy (Validity Check); 2.1 On the ground.
- **Readings:** a card the rules do not allow at the moment (Charge, First Aid or a guard while on the ground) is (a) invalid: to the bottom, deal instead; (b) not covered by the check.
- **Adopted:** (a). Helping Hand, by contrast, is always valid (A14).
- **Why:** under (b) the algorithm would demand an illegal move.
- **Code:** `agents/dummy.ts` `isValid`.

### P28. Joker against a suited card in the Dummy's play condition (#9) — *Outcome*

- **Where:** extensions, Dummy (Probability check; Notes: "Joker vs Joker: treat as same suit — condition met in all brackets").
- **Readings:** a Joker against a suited card (either one revealed, the other on the discard pile) (a) has neither suit nor colour: it fails "same suit" and "same colour" and meets "different suit"; (b) matches anything: met in all brackets; (c) never meets the condition.
- **Adopted:** (a).
- **Why:** the literal reading; the note on two Jokers is an explicit exception. The effect is small (2 Jokers in 54 cards).
- **Code:** `agents/dummy.ts` `playConditionMet`.

### P29. The Dummy's attack target: the "lowest current HP" body part

- **Where:** extensions, Dummy (Targeting: "the most damaged one, working to disable it").
- **Readings:** (a) the lowest HP among parts still above 0; (b) including parts at 0, which a Dummy would then keep hitting for nothing.
- **Adopted:** (a). For Entangle, the lowest among the parts it may target.
- **Why:** a part at 0 is already disabled; the stated aim is to disable one.
- **Code:** `agents/dummy.ts` `chooseTarget`.

### P30. The Dummy's tie-break and its Roar discards

- **Where:** extensions, Dummy (Targeting: "the player seated to the Dummy's left"; Notes); 2.2 Roar.
- **Adopted:** the player to the left is the next one clockwise (the turn order, 1.4); further ties continue clockwise. After a Roar the Dummy discards from the bottom of its pile, as it does over the hand limit.
- **Why:** facing the board, the next seat clockwise is on one's left; the Notes give the bottom as the Dummy's way of discarding.
- **Code:** `agents/dummy.ts`.

## Open: to be decided later

- Shield vs AoE Attack as a whole (P10, P11): to be reworked by the author.
- Whether Intervention Dodge works against an AoE attack at all (P10). The author's doubt: the Dodge pushes the target out of the path of an aimed attack, hard enough to knock them down. An AoE attack is not aimed.
