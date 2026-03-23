# Gra planszowa „Daredragon Fellowship" — Rozszerzenia zasad

Zbiór nowych pomysłów, zasad w opracowaniu oraz mechanik zbyt złożonych lub zbyt szczegółowych, aby włączyć je do podstawowej wersji gry. Kiedy i w jakiej formie zostaną opublikowane — do ustalenia.

---

## Gracz automatyczny (Manekin)

Umożliwia grę w dokładnie 3 osoby bez zmiany podstawowych zasad zaprojektowanych dla 4 graczy. Zainspirowane konceptem bridżowego mannekina.

Jedna pozycja gracza zajmowana jest przez gracza automatycznego — Manekina. Manekin podlega wszystkim standardowym zasadom dotyczącym śmiałków. Poniższe uzupełnienia definiują, jak jego działania są wybierane automatycznie, na podstawie jednoznacznego algorytmu. Żadne decyzje nie są podejmowane przez człowieka w jego imieniu.

### Ustawienie

Karty ręki Manekina leżą zakryte w jednym stosie, umieszczonym przy odpowiedniej krawędzi planszy. Na początku gry Manekin otrzymuje normalnie 2 karty.

### Algorytm

W turze Manekina:

1. **Odkryj** wierzchnią kartę stosu ręki Manekina.
2. **Sprawdzenie poprawności.** Jeśli zagranie karty byłoby nieważne lub bezcelowe w bieżącej sytuacji (patrz niżej), przesuń ją na spód stosu ręki i wykonaj akcję Dobierz karty. Koniec tury.
3. **Policz karty.** Zsumuj wszystkie karty aktualnie trzymane przez pozostałych (ludzkich) graczy.
4. **Sprawdzenie prawdopodobieństwa.** Na podstawie liczby kart ustal warunek, porównując kolory odkrytej karty i wierzchniej karty wspólnego stosu kart odrzuconych:

| Karty w rękach pozostałych | Warunek zagrania | Prawdopodobieństwo |
|---|---|---|
| 0–6 | Odkryta karta i wierzchnia odrzuconego mają **ten sam kolor karty** | 25% |
| 7–12 | Odkryta karta i wierzchnia odrzuconego mają **ten sam kolor** | 50% |
| ≥13 | Odkryta karta i wierzchnia odrzuconego mają **inny kolor karty** | 75% |

5. **Jeśli warunek jest spełniony:** zagraj odkrytą kartę normalnie.
6. **Jeśli warunek nie jest spełniony:** przesuń odkrytą kartę na spód stosu ręki i wykonaj akcję Dobierz karty.

### Sprawdzenie poprawności

Karta jest uznawana za nieważną lub bezcelową, gdy:

- **Unik interwencyjny / Tarcza**: smok aktualnie nie wykonuje ataku.
- **Pomocna dłoń** (4, 3, 2): żaden inny śmiałek nie leży na ziemi.
- **Pierwsza pomoc** (Joker): żaden inny śmiałek nie ma mniej niż 8 PŻ ani nie jest unieszkodliwiony.
- Wszystkie pozostałe karty są uznawane za poprawne.

### Wybór celu

Gdy Manekin zagrywa kartę ataku, celuje w część ciała smoka z **najniższym aktualnym PŻ** (najbardziej uszkodzoną, dążąc do jej unieszkodliwienia). Kolejność przy remisie: Paszcza → Łapy → Nogi → Ogon.

Gdy Manekin zagrywa kartę wsparcia skierowaną do innego śmiałka, celuje w śmiałka z **najniższym aktualnym PŻ**. Przy remisie: gracz siedzący po lewej stronie Manekina.

### Uwagi

- Limit kart ręki Manekina podlega tym samym zasadom opartym na PŻ co u zwykłych graczy.
- Jeśli ręka Manekina przekroczy limit (np. po otrzymaniu kart), odrzuć karty ze **spodu** stosu.
- Jeśli stos kart odrzuconych jest pusty, traktuj warunek zagrania jako niespełniony (dobierz karty).
- Joker (ręka Manekina) vs Joker (odrzucone): traktuj jako ten sam kolor karty — warunek spełniony we wszystkich przedziałach.

---

## Generowanie imienia i cech smoka

Imię smoka składa się z czterech sylab, po jednej dla każdej części ciała, w ustalonej kolejności: **Paszcza · Łapy · Nogi · Ogon**. Sylaby pochodzą ze starożytnego języka smoków (takie same we wszystkich wersjach gry). Każda sylaba określa cechę danej części ciała, nadając smokowi unikalny profil mechaniczny oraz imię.

### Ustalanie cech w trakcie gry

Cecha żadnej części ciała nie jest ustalona przed grą — ujawnia się w trakcie rozgrywki. **Pierwsza karta akcji zagrana przez smoka** dla danej części ciała określa jej cechę na podstawie koloru karty:

| Kolor karty | Cecha | Efekt |
|---|---|---|
| ♠ | **Siła** | +1s do wszystkich obrażeń zadawanych przez ataki daną częścią ciała. |
| ♥ | **Wytrzymałość** | -1s do wszystkich obrażeń zadawanych przez ataki *celowane* w tę część ciała. |
| ♣ | **Zwinność** | -1 do czasu przygotowania wszystkich akcji daną częścią ciała (minimum 0). |
| ♦ | **Brak** | Brak modyfikacji. |

Po ustaleniu cechy odszukaj odpowiednią sylabę w poniższej tabeli i zanotuj ją. Imię smoka składa się stopniowo w trakcie gry — sylaba po sylabie.

### Tabela sylab

| Część ciała | Siła | Wytrzymałość | Zwinność | Brak |
|---|---|---|---|---|
| Paszcza | Vrak | Thorm | Skael | Dru |
| Łapy | Gorr | Brath | Zel | Mur |
| Nogi | Krath | Ston | Vel | Dar |
| Ogon | Zauth | Kroth | Skar | Ash |

### Odczytywanie imienia

Aby odczytać cechy z imienia smoka, należy podzielić je na cztery sylaby i odszukać każdą w tabeli. Część ciała wyznaczona jest przez pozycję sylaby, nie przez jej brzmienie.

**Przykład — Vrak·Zel·Dar·Kroth:**
- *Vrak* (Paszcza, Siła): ataki paszczą zadają +1s obrażeń.
- *Zel* (Łapy, Zwinność): akcje łapami mają czas przygotowania skrócony o 1.
- *Dar* (Nogi, Brak): nogi nie mają modyfikacji.
- *Kroth* (Ogon, Wytrzymałość): ataki celowane w ogon zadają -1s obrażeń.

**Przykład — Dru·Mur·Dar·Ash:** wszystkie cztery części ciała bez cech. Najsłabszy możliwy smok — i najbardziej upokarzające imię, jakie można nosić w smoczym towarzystwie.

**Przykład — Vrak·Gorr·Krath·Zauth:** Siła we wszystkich czterech częściach ciała. W starożytnych tekstach określany po prostu jako *problem*.
