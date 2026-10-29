# Freunde-Kampf

Ein Comic-Kampfspiel im Browser gegen die CPU. Die Kämpfer sind echte Freunde, mit Insider-Sprüchen und eigenen Spezialangriffen.

## Spielen
Nach dem Aktivieren von GitHub Pages (Settings → Pages → Branch auswählen, Ordner `/ (root)`) läuft das Spiel unter
`https://<github-name>.github.io/<repo-name>/`.

Lokal testen: `python3 -m http.server` im Projektordner starten und `http://localhost:8000` öffnen.

## Steuerung (Tekken-Stil)
| Aktion | Tastatur | Handy |
|---|---|---|
| Laufen | A / D oder Pfeile | ◀ ▶ |
| Springen | W / Pfeil hoch | ⤒ |
| Linker Schlag (schnell) | U oder Z | LP |
| Rechter Schlag (stark) | I oder X | RP |
| Linker Tritt (tief) | J oder C | LK |
| Rechter Tritt (Launcher) | K oder V | RK |
| Spezialangriff (wenn die blaue Leiste voll ist) | Leertaste oder E | ⭐ |
| Blocken | L oder S | 🛡 |

**Kombos:** Nach einem Treffer sofort die nächste Angriffstaste drücken (z. B. U, I, K). Der rechte Tritt (K) wirft den Gegner in die Luft. Dann kannst du ihn mit weiteren Schlägen "jonglieren". Bei wenig Leben (unter 25 %) startet der **Rage-Modus** mit mehr Schaden.

Das Handy am besten quer halten. Best-of-3, 60 Sekunden pro Runde.

## Freunde hinzufügen oder ändern
Alles steht in `characters.js`. Neuen Block kopieren, Name, Farbe, Sprüche und Spezialangriff anpassen und ein quadratisches Gesichtsfoto nach `img/` legen.
Spezialtypen: `projectile`, `butt`, `kick`, `combo`.
