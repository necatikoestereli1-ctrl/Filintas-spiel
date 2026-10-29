# Freunde-Kampf

Ein Comic-Kampfspiel im Browser gegen die CPU. Die Kämpfer sind echte Freunde, mit Insider-Sprüchen und eigenen Spezialangriffen.

## Spielen
Nach dem Aktivieren von GitHub Pages (Settings → Pages → Branch auswählen, Ordner `/ (root)`) läuft das Spiel unter
`https://<github-name>.github.io/<repo-name>/`.

Lokal testen: `python3 -m http.server` im Projektordner starten und `http://localhost:8000` öffnen.

## Steuerung
| Aktion | Tastatur | Handy |
|---|---|---|
| Laufen | A / D oder Pfeile | ◀ ▶ |
| Springen | W / Pfeil hoch / Leertaste | ⤒ |
| Schlag | J | 👊 |
| Spezialangriff (wenn die blaue Leiste voll ist) | K | ⭐ |
| Blocken | L oder S | 🛡 |

Das Handy am besten quer halten. Best-of-3, 60 Sekunden pro Runde.

## Freunde hinzufügen oder ändern
Alles steht in `characters.js`. Neuen Block kopieren, Name, Farbe, Sprüche und Spezialangriff anpassen und ein quadratisches Gesichtsfoto nach `img/` legen.
Spezialtypen: `projectile`, `butt`, `kick`, `combo`.
