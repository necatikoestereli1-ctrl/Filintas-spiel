// Hier werden die Freunde eingetragen. Neuen Freund hinzufügen = neuen Block kopieren.
//
// photo:   Bild in img/ (quadratisch, Gesicht mittig)
// color:   Farbe des Oberkörpers
// hp / speed / power: Lebenspunkte, Lauftempo und Schadensfaktor (1 = normal)
// special.type:
//   "projectile" = Wurfgeschoss (icon fliegt nach vorne)
//   "butt"       = Dash mit dem Hintern
//   "kick"       = Flugkick
//   "combo"      = schnelle Schlagserie
// quips:   Sprüche für die Sprechblasen
const FRIENDS = [
  {
    name: "Talha",
    photo: "img/talha.png",
    color: "#2e7d32",
    hp: 100, speed: 1, power: 1,
    special: { type: "projectile", name: "Geldwurf", icon: "💵", shout: "GELDREGEN!" },
    quips: ["Ich bezahl dich weg!", "Das ist doch Kleingeld!", "Geld regelt!", "Ich bin reich, Digga!"],
  },
  {
    name: "Aziz",
    photo: "img/aziz.png",
    color: "#b71c1c",
    hp: 115, speed: 0.9, power: 1,
    special: { type: "butt", name: "Arsch-Attacke", icon: "🍑", shout: "ARSCH-ATTACKE!" },
    quips: ["Ich hab recht!", "Nein, DU liegst falsch!", "Hab ich doch gesagt!", "Streite nicht mit mir!"],
  },
  {
    name: "Yahya",
    photo: "img/yahya.png",
    color: "#212121",
    hp: 100, speed: 1.05, power: 1,
    special: { type: "kick", name: "Ranger-Kick", icon: "🦶", shout: "RANGER-KICK!" },
    quips: ["Ich hab die Rangers erfunden!", "Rangers forever!", "Das war MEINE Idee!"],
  },
  {
    name: "Kerem",
    photo: "img/kerem.png",
    color: "#1565c0",
    hp: 95, speed: 1.1, power: 1.05,
    special: { type: "combo", name: "Box-Combo", icon: "🥊", shout: "BOX-COMBO!" },
    quips: ["Größe ist nicht alles!", "Ich kompensiere mit Fäusten!", "Klein, aber oho!"],
  },
];
