# Daredragon Fellowship — silnik reguł

[English](README.md) / Polski

Referencyjna implementacja reguł gry [Daredragon Fellowship](../README_pl.md), kooperacyjnej gry karciano-planszowej dla 4–6 osób. Służy trzem celom:

1. **Weryfikacji reguł.** Zapisanie ich jako kod wyłapuje niejednoznaczności.
2. **Sprawdzeniu [przykładowej rozgrywki](../rules/sample_gameplay_pl.md)** ruch po ruchu.
3. **Punktom odniesienia do balansu.** Jak radzi sobie ze smokiem gra losowa, a jak automatyczny gracz (Dummy)?

Postęp prac: [zgłoszenie #33](https://github.com/bsulkowski/daredragon-fellowship/issues/33).

## Stan

Gotowy jest etap 1 z 4 silnika, czyli podstawowe klocki.

| Moduł | Zawartość |
|---|---|
| `src/dracometer.ts` | Skala obrażeń (reguły 1.10) i modyfikatory jako kroki na niej |
| `src/cards.ts` | Karty jako napisy w notacji reguł (`9♣`, `10♠`, `Joker`), kolory, talia 54 kart |
| `src/actions.ts` | Tabele akcji śmiałków (2.1) i smoka (2.2) jako dane |
| `src/random.ts` | Losowanie z ziarnem i tasowanie; to samo ziarno zawsze daje tę samą grę |
| `src/deck.ts` | Talia i stos kart odrzuconych, przetasowanie, wymuszenie konkretnej następnej karty (do odtwarzania przykładowej rozgrywki) |

Dalej: oś czasu tur i interfejs decyzji, potem akcje smoka i śmiałków.

## Założenia

- **Bez zależności, bez DOM-u.** Zwykłe moduły TypeScript, działające w Node i w przeglądarce.
- **Paczką jest źródło TypeScript.** Node uruchamia je wprost z flagą `--experimental-strip-types`, więc nie ma kroku budowania. Dlatego kod używa tylko składni, którą da się wymazać (bez `enum`, `namespace` i parameter properties), a importy mają rozszerzenie `.ts`.
- **Stan to zwykłe dane.** Talie i stan generatora losowego to zwykłe obiekty, które można skopiować przez `structuredClone`.
- **Determinizm.** Cała losowość pochodzi z generatora z ziarnem. Każdą kartę można też wymusić jako następną, czego potrzebuje walidator przykładowej rozgrywki.

## Użycie

```ts
import { createRng, createDeck, fullDeck, draw, dragonAction, modify } from 'ddf-engine';

const rng = createRng(42);
const dragonDeck = createDeck(fullDeck(), rng);
const card = draw(dragonDeck, rng)!;
dragonAction(card); // np. { name: 'Bite', part: 'jaws', type: 'direct', warmup: 3, cooldown: 2, damage: 10, ... }
modify(8, 2);       // 13: podstawa 8 z +2Ϟ
```

Nazwy akcji i części ciała w kodzie są po angielsku, tak jak w regułach EN.

## Rozwój

Wymaga Node.js 22.12 lub nowszego.

```sh
npm test
```

## Licencja

Kod w tym katalogu jest na [licencji MIT](LICENSE). Reguły gry i reszta repozytorium są na [CC BY 4.0](../LICENSE).
