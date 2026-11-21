# Board Game "Daredragon Fellowship" — Rules Extensions

English / [Polski](extensions_pl.md)

A collection of new ideas, work-in-progress mechanics, and rules too complex or too specific to include in the base game. When and how these will be published is to be decided.

---

## Automated Player (The Dummy)

Allows the game to be played by exactly 3 people without altering the base mechanics designed for 4 players. Inspired by the Bridge concept of playing with a dummy hand.

One player position is taken by an automated player — the Dummy. The Dummy follows all regular rules for daredevils. The additions below define how its actions are chosen automatically, based on an unambiguous algorithm. No human decisions are made on the Dummy's behalf.

### Setup

The Dummy's hand cards lie face down in a single pile, placed at the corresponding edge of the board. At the start of the game the Dummy receives 2 cards normally. Cards the Dummy receives are placed on top of the pile.

### Algorithm

On the Dummy's turn:

1. **Reveal** the top card of the Dummy's hand pile.
2. **Validity check.** If playing the card would be invalid or pointless in the current situation (see below), move it to the bottom of the hand pile and perform the Draw Cards action instead. End of turn.
3. **Count cards.** Total up all cards currently held by the other (human) players.
4. **Probability check.** Based on the count, determine the condition using the suits of the revealed card and the top card of the shared discard pile:

| Cards held by others | Play condition | Probability |
|---|---|---|
| 0–6 | Revealed card and discard top have the **same suit** | 25% |
| 7–12 | Revealed card and discard top have the **same color** | 50% |
| ≥13 | Revealed card and discard top have a **different suit** | 75% |

5. **If condition is met:** play the revealed card normally.
6. **If condition is not met:** move the revealed card to the bottom of the hand pile and perform the Draw Cards action instead.

### Validity Check

A card is considered invalid or pointless if:

- **First Aid** (Joker): no other daredevil has fewer than 8 HP or is incapacitated.
- **Any card the rules do not allow at the moment**, e.g. Charge, First Aid or a guard while the Dummy is lying on the ground.
- All other cards are considered valid. This includes Intervention Dodge, Shield and Helping Hand, even when there is nothing for them to do yet: the situation may change before they act.

### Targeting

When the Dummy's attack resolves, it targets the dragon body part with the **lowest current HP** above 0 (the most damaged one, working to disable it; a part at 0 is already disabled). Tiebreak order: Jaws → Paws → Legs → Tail.

When the Dummy's Helping Hand or First Aid resolves, it targets the daredevil with the **lowest current HP** among those it can help. Tiebreak: the player seated to the Dummy's left, then onwards clockwise. Shield and Intervention Dodge follow the base rules.

### Notes

- The Dummy's hand limit follows the same HP-based rules as regular players.
- If the Dummy's hand exceeds its limit (e.g. after receiving cards), or a Roar makes it discard, discard from the **bottom** of the pile.
- If the discard pile is empty, treat the play condition as not met (fallback to drawing).
- A Joker has neither suit nor color: against a suited card it meets only the "different suit" condition.
- Joker (Dummy hand) vs Joker (discard): treat as same suit — condition met in all brackets.
- With more than one Dummy (e.g. in simulations), each counts the cards of all other players, Dummies included, and the brackets scale with their number n: up to 2n cards same suit, up to 4n same color, more — different suit. For 3 other players this gives the table above.

---

## Dragon Name and Trait Generation

Each dragon has a name of four syllables, one per body part, in fixed order: **Jaws · Paws · Legs · Tail**. The syllables are drawn from an ancient dragon language (the same in all versions of the game). Each syllable encodes a trait that body part possesses, giving the dragon a unique mechanical profile alongside its name.

### Determining Traits in Play

The trait of each body part is not set before the game — it is revealed during play. The **first action card played by the dragon** using a given body part determines that part's trait, based on the card's suit:

| Suit | Trait | Effect |
|---|---|---|
| ♠ | **Power** | +1Ϟ to all damage dealt by attacks using this body part. |
| ♥ | **Durability** | -1Ϟ to all damage dealt by attacks *targeting* this body part. |
| ♣ | **Agility** | -1 warm-up time for all actions using this body part (minimum 0). |
| ♦ | **None** | No modification. |

Once the trait is determined, look up the corresponding syllable in the table below and record it. The dragon's full name is assembled as the game progresses, one body part at a time.

### Syllable Table

| Body Part | Power | Durability | Agility | None |
|---|---|---|---|---|
| Jaws | Vrak | Thorm | Skael | Dru |
| Paws | Gorr | Brath | Zel | Mur |
| Legs | Krath | Ston | Vel | Dar |
| Tail | Zauth | Kroth | Skar | Ash |

### Reading a Name

To derive traits from a dragon's name, split it into four syllables and look each up in the table. The body part is determined by position, not by the syllable itself.

**Example — Vrak·Zel·Dar·Kroth:**
- *Vrak* (Jaws, Power): jaws attacks deal +1Ϟ damage.
- *Zel* (Paws, Agility): paws actions have warm-up reduced by 1.
- *Dar* (Legs, None): legs have no modification.
- *Kroth* (Tail, Durability): attacks targeting the tail deal -1Ϟ damage.

**Example — Dru·Mur·Dar·Ash:** all four body parts have no traits. The weakest possible dragon — and the most insulting name one can have in dragon society.

**Example — Vrak·Gorr·Krath·Zauth:** Power in all four body parts. Referred to in ancient texts simply as *a problem*.
