# Daredragon Fellowship — silnik reguł

[English](README.md) / Polski

Referencyjna implementacja reguł gry [Daredragon Fellowship](../README_pl.md), kooperacyjnej gry karciano-planszowej dla 4–6 osób. Służy trzem celom:

1. **Weryfikacji reguł.** Zapisanie ich jako kod wyłapuje niejednoznaczności.
2. **Sprawdzeniu [przykładowej rozgrywki](../rules/sample_gameplay_pl.md)** ruch po ruchu.
3. **Punktom odniesienia do balansu.** Jak radzi sobie ze smokiem gra losowa, a jak automatyczny gracz (Dummy)?

Postęp prac: [zgłoszenie #33](https://github.com/bsulkowski/daredragon-fellowship/issues/33).

## Stan

Silnik jest kompletny: podstawowe klocki, pętla tur, akcje smoka razem z reagującymi na nie akcjami czuwania oraz akcje śmiałków. Dalej: walidator przykładowej rozgrywki i punkty odniesienia do balansu.

Tam, gdzie reguły dają się odczytać na więcej niż jeden sposób, przyjęte przez silnik odczytanie jest zapisane w [rejestrze niejednoznaczności](AMBIGUITIES.md) (po angielsku).

| Moduł | Zawartość |
|---|---|
| `src/dracometer.ts` | Skala obrażeń (reguły 1.10) i modyfikatory jako kroki na niej |
| `src/cards.ts` | Karty jako napisy w notacji reguł (`9♣`, `10♠`, `Joker`), kolory, talia 54 kart |
| `src/actions.ts` | Tabele akcji śmiałków (2.1) i smoka (2.2) jako dane |
| `src/random.ts` | Losowanie z ziarnem i tasowanie; to samo ziarno zawsze daje tę samą grę |
| `src/deck.ts` | Talia i stos kart odrzuconych, przetasowanie, wymuszenie konkretnej następnej karty (do odtwarzania przykładowej rozgrywki) |
| `src/state.ts` | Stan gry jako zwykłe dane; nowa gra albo gra od zadanej pozycji |
| `src/decisions.ts` | Interfejs decyzji między silnikiem a agentami |
| `src/events.ts` | Zdarzenia zgłaszane w trakcie gry |
| `src/engine.ts`, `src/core.ts` | Pętla tur: przeplatane tury, rozgrzewki i cool-downy, dobieranie kart, limity ręki, koniec gry |
| `src/heroes.ts` | Akcje śmiałków (2.1): ataki z ripostą, skoordynowany atak, premia za oplątanie, Oplątanie, Odwrócenie uwagi, Pomocna dłoń, Pierwsza pomoc; ograniczenia dla powalonego na ziemię |
| `src/dragon.ts` | Akcje smoka (2.2): ataki zwykłe i obszarowe, Powalenie, Przeraźliwy ryk, Łypnięcie okiem, Regeneracja; Osłona i Unik ratunkowy (2.1); śmiałek na 0 HP |

### Decyzje

Gdy reguły zostawiają graczowi wybór, silnik zgłasza decyzję z listą wszystkich legalnych opcji, a agent odpowiada numerem wybranej:

- `turn`: zagrać jedną z kart z ręki albo rozdać karty pozostałym,
- `target`: cel akcji, wybierany w chwili jej rozstrzygnięcia,
- `discard`: karta do odrzucenia (ponad limit ręki albo po Ryku smoka).

Decyzja z jedną legalną opcją nie jest zgłaszana. Ten sam interfejs obsługuje grę losową, Dummy, walidator przykładowej rozgrywki, a później ludzi.

## Założenia

- **Bez zależności, bez DOM-u.** Zwykłe moduły TypeScript, działające w Node i w przeglądarce.
- **Paczką jest źródło TypeScript.** Node uruchamia je wprost z flagą `--experimental-strip-types`, więc nie ma kroku budowania. Dlatego kod używa tylko składni, którą da się wymazać (bez `enum`, `namespace` i parameter properties), a importy mają rozszerzenie `.ts`.
- **Stan to zwykłe dane.** Talie i stan generatora losowego to zwykłe obiekty, które można skopiować przez `structuredClone`.
- **Determinizm.** Cała losowość pochodzi z generatora z ziarnem. Każdą kartę można też wymusić jako następną, czego potrzebuje walidator przykładowej rozgrywki.

## Użycie

Cała gra z agentem:

```ts
import { createGame, runGame, type Agent } from 'ddf-engine';

const firstOption: Agent = { decide: () => 0 };
const outcome = runGame(createGame({ players: 4, seed: 42 }), firstOption, { maxTurns: 500 });
// { result: 'victory' | 'defeat' | 'timeout', turn, phase, partsHp, heroesHp }
```

Albo krok po kroku, np. z interfejsu użytkownika:

```ts
import { createGame, play } from 'ddf-engine';

const game = play(createGame({ seed: 42 }), { onEvent: (event) => console.log(event) });
let step = game.next();
while (!step.done) step = game.next(0); // step.value to decyzja; odpowiedzią jest numer opcji
```

Klocki działają też samodzielnie:

```ts
import { createRng, createDeck, fullDeck, draw, dragonAction, modify } from 'ddf-engine';

const rng = createRng(42);
const card = draw(createDeck(fullDeck(), rng), rng)!;
dragonAction(card); // np. { name: 'Bite', part: 'jaws', type: 'direct', warmup: 3, cooldown: 2, damage: 10, ... }
modify(8, 2);       // 13: podstawa 8 z +2Ϟ
```

Nazwy akcji i części ciała w kodzie są po angielsku, tak jak w regułach EN.

## Rozwój

Wymaga Node.js 22.12 lub nowszego.

```sh
npm test
```

Node wycina typy, ale ich nie sprawdza. Do sprawdzenia źródeł służy jednorazowo uruchamiany kompilator TypeScript (nie jest zależnością):

```sh
npx -p typescript@5.8 tsc --noEmit --strict --target es2022 --module nodenext \
  --allowImportingTsExtensions --verbatimModuleSyntax --erasableSyntaxOnly src/*.ts
```

## Licencja

Kod w tym katalogu jest na [licencji MIT](LICENSE). Reguły gry i reszta repozytorium są na [CC BY 4.0](../LICENSE).
