// ===== CHASSE AU TRÉSOR — le contenu de la semaine =====
// Une porte s'ouvre à chaque date ; il faut finir les portes dans l'ordre.
// Une porte = une ou plusieurs énigmes (rooms). Une énigme peut faire gagner un ticket à gratter.
// Types d'énigmes : text, qcm, memory, torch, lock, vinyls.
// Les réponses texte ignorent majuscules, accents, espaces, ponctuation et tolèrent une faute de frappe.
//
// Pour tester : ?hunt-now=2026-11-06T22:30 simule une date, ?reset-hunt remet tout à zéro.
// Ex : https://kaplacat.github.io/didis-30/?reset-hunt&hunt-now=2026-11-02T09:01
const HUNT = {
  days: [
    // ---------- LUNDI : rebus emojis ----------
    {
      date: "2026-11-02T09:00:00+01:00",
      label: "Lundi 2 novembre",
      title: "Télécommande royale",
      intro: `<p>Coucou mon chat. Toute la semaine, chaque jour à 9h, une nouvelle porte s'ouvre.</p>
              <p>Aujourd'hui, j'ai codé <strong>trois films</strong> en emojis. Chaque film trouvé te fait gagner un ticket.</p>`,
      rooms: [
        {
          type: "text",
          prompt: `<p class="hunt-rebus">💂 ❤️ 🎄 ✈️ 📝</p>`,
          placeholder: "Le titre du film…",
          hint: "La toute première comédie romantique que tu m'as fait voir 😏",
          answers: ["Love Actually"],
          ticket: { icon: "📺", title: "Télécommande royale", text: "Bon pour 1 film ou 1 série de ton choix. Tu me  fais découvrir ce que tu veux." },
        },
        {
          type: "text",
          prompt: `<p class="hunt-rebus">⛵ 🌊 🐴 👁️ 🏝️</p>`,
          placeholder: "Le titre du film…",
          hint: "Nolan, une salle obscure, et nos 1 an 🥂",
          answers: ["L'Odyssée", "Odyssée", "The Odyssey", "Odyssey"],
          ticket: { icon: "📺", title: "Télécommande royale", text: "Bon pour 1 film ou 1 série de ton choix. Tu me  fais découvrir ce que tu veux." },
        },
        {
          type: "text",
          prompt: `<p class="hunt-rebus">🧒 🛹 📹 💻 🧋</p>`,
          placeholder: "Le titre du film…",
          hint: "Notre tout premier film ensemble, à l'Utopia… et un prénom qui te va si bien 😉",
          answers: ["Didi"],
          ticket: { icon: "📺", title: "Télécommande royale", text: "Bon pour 1 film ou 1 série de ton choix. Tu me  fais découvrir ce que tu veux." },
        },
      ],
      outro: `<p>Trois soirées où tu as le pouvoir absolu sur la télécommande 👑</p>
              <p>Tes tickets t'attendent dans l'onglet <strong>🎟️ Tickets</strong> : montre-m'en un quand tu veux l'utiliser.</p>`,
    },

    // ---------- MARDI : memory de nos photos ----------
    {
      date: "2026-11-03T09:00:00+01:00",
      label: "Mardi 3 novembre",
      title: "Massage VIP",
      intro: `<p>Respire… détends les épaules… Aujourd'hui, je prends soin de toi.</p>
              <p>Retrouve les <strong>paires de souvenirs</strong> pour débloquer ton ticket.</p>`,
      rooms: [
        {
          type: "memory",
          photos: ["img/memory/1.jpg", "img/memory/2.jpg", "img/memory/3.jpg", "img/memory/4.jpg", "img/memory/5.jpg", "img/memory/6.jpg"],
          ticket: { icon: "💆", title: "Massage VIP", text: "Un massage par ton masseur attitré. Huiles, bougies, aucune limite de temps hihi." },
        },
      ],
      outro: `<p>Ton masseur attitré attend ton feu vert. Le ticket est dans ton portefeuille 💆</p>`,
    },

    // ---------- MERCREDI : quiz cuisine ----------
    {
      date: "2026-11-04T09:00:00+01:00",
      label: "Mercredi 4 novembre",
      title: "Master Chief",
      intro: `<p>Quelques quetions pour valider tout ce que tu aimes...</p>
              <p><strong>Trois questions</strong>, trois tickets.</p>`,
      rooms: [
        {
          type: "qcm",
          prompt: `<p>Le dernier plat que tu m'as cuisiné… et que j'ai adoré ?</p>`,
          options: ["Burger poulet maison", "Lasagnes saumon épinards", "Gratin dauphinois", "Fajitas"],
          answer: 1,
          ticket: { icon: "👨‍🍳", title: "Master Chief", text: "Tu demandes, je cuisine. N'importe quel plat et je te le fais" },
        },
        {
          type: "qcm",
          prompt: `<p>Ton gâteau préféré ?</p>`,
          options: ["Gateau au chocolat", "Le fraisier", "L'Impérial", "Le millefeuille"],
          answer: 2,
          ticket: { icon: "👨‍🍳", title: "Master Chief", text: "Tu demandes, je cuisine. N'importe quel plat et je te le fais" },
        },
        {
          type: "qcm",
          prompt: `<p>Le poisson préféré d'Arya 🐱 ?</p>`,
          options: ["Le saumon", "La sardine", "La daurade", "Le thon"],
          answer: 3,
          ticket: { icon: "👨‍🍳", title: "Master Chief", text: "Tu demandes, je cuisine. N'importe quel plat et je te le fais" },
        },
      ],
      outro: `<p>Je suis prêt à faire ta commande 👨‍🍳 (Arya aussi, mais elle n'a pas de ticket.)</p>`,
    },

    // ---------- JEUDI : mini escape game (lampe torche + cadenas) ----------
    {
      date: "2026-11-05T09:00:00+01:00",
      label: "Jeudi 5 novembre",
      title: "Aventure mystère",
      intro: `<p>Aujourd'hui, une <strong>aventure mystère</strong> : deux salles, deux énigmes.</p>`,
      rooms: [
        {
          type: "torch",
          prompt: `<p>Voici une vieille lampe torche : « Cinq lettres de ce site ne brillent que dans le noir. Fouille chaque recoin de la page, et <strong>remets-les dans l'ordre</strong>. »</p>`,
          placeholder: "Le mot caché…",
          hint: "Il y a 5 lettres, du thème jusqu'à la FAQ. Sur téléphone, garde le doigt posé en faisant défiler. Une fois les 5 trouvées, mélange-les pour former un mot doux 😘",
          answers: ["BISOU"],
          // at = section où cacher la lettre, x / y = position dans la section
          // Volontairement dans le désordre sur la page (de haut en bas : O U B S I)
          letters: [
            { ch: "O", at: "#theme", x: "6%", y: "12%" },
            { ch: "U", at: "#dresscode", x: "90%", y: "45%" },
            { ch: "B", at: "#programme", x: "85%", y: "35%" },
            { ch: "S", at: "#cocktails", x: "6%", y: "85%" },
            { ch: "I", at: "#faq", x: "88%", y: "70%" },
          ],
          reveal: `<p>Un bisou… mais lequel, j'ai pas tout compté il y en a tellement eu hihi... Une porte blindée t'attend dans la salle suivante.</p>`,
        },
        {
          type: "lock",
          prompt: `<p>Un cadenas à 4 molettes. Gravé dessus :</p>
                   <p><em>« Ce soir-là, le ciel s'est embrasé… et nous aussi hihi. »</em></p>`,
          hint: "Boum, boum, des feux d'artifice…🎆",
          answers: ["1407"],
          ticket: { icon: "🔐", title: "Aventure mystère", text: "Bon pour un escape game, toi et moi. On choisit la date et le thème ensemble." },
        },
      ],
      outro: `<p>Évadée avec brio 🔐 La vraie aventure, on la vivra ensemble.</p>`,
    },

    // ---------- VENDREDI 9H : le premier date ----------
    {
      date: "2026-11-06T09:00:00+01:00",
      label: "Vendredi 6 novembre",
      title: "Ticket d'or",
      intro: `<p>Avant les feux d'artifice, avant les films… il y a eu <strong>un premier verre</strong>.</p>`,
      rooms: [
        {
          type: "text",
          prompt: `<p>Tu ne passeras à la suite que si tu lui donnes <strong>le nom de ce bar</strong>.</p>`,
          placeholder: "Le nom du bar…",
          hint: "Il porte le nom d'un tube… ou d'un ingénieur du XVIIIe siècle 😉",
          answers: ["Café Pitot", "Pitot", "Le Pitot"],
          ticket: { icon: "🎟️", title: "La Réserve Rimbaud", text: "Ce soir, 21h. Table pour deux. Sors ta plus belle tenue.", gold: true },
        },
      ],
      outro: `<p>Ce soir, on dîne à <strong>La Réserve Rimbaud</strong> ✨</p>
              <p>Et garde l'œil ouvert pendant le dîner… 👀</p>`,
    },

    // ---------- VENDREDI 22H : jukebox (carte donnée au resto) ----------
    // Vinyles : 1 Take Five · 2 Is This Love · 3 Fly Me to the Moon · 4 Girl from Ipanema
    // Carte à lui donner au resto : « Le jukebox ne joue que notre séquence : 🌙 → 🖐️ → 🇧🇷 → ❤️ → 🌙 »
    {
      date: "2026-11-06T22:00:00+01:00",
      label: "Vendredi 6 novembre",
      title: "La platine vinyle",
      intro: `<p>Ta future platine vinyle s'est réveillé. Elle attend <strong>la séquence</strong> écrite sur la carte que je t'ai donnée ce soir.</p>`,
      rooms: [
        {
          type: "vinyls",
          prompt: `<p>Descends jusqu'aux <strong>vinyles de la playlist</strong> et joue-les dans le bon ordre.</p>`,
          hint: "Chaque emoji de la carte correspond au titre d'un vinyle. 🌙 = Fly Me to the Moon…",
          answers: ["31423"],
          ticket: { icon: "🥐", title: "Brunch", text: "Demain matin : grasse mat', puis brunch maison. Service en pyjama autorisé." },
        },
      ],
      outro: `<p>Demain matin, brunch 🥐 Et après… une toute dernière porte.</p>`,
    },

    // ---------- SAMEDI : les cadeaux cachés dans l'appart ----------
    // Écrire sur une étiquette attachée à chaque cadeau :
    //  - coffret cheveux (salle de bain) : « Notre balade au marché de Noël de Montpellier : jour et mois. »  → 0412
    //  - housse de casque (salon)        : « Ce qu'on a bu ce soir-là pour se réchauffer 🍷 »                  → vin chaud
    //  - graines (chambre)               : « Elle adore un peu trop cette pièce à mon goût... »                      → Arya
    {
      date: "2026-11-07T09:00:00+01:00",
      label: "Samedi 7 novembre",
      title: "Les cadeaux",
      intro: `<p>Dernier jour. Cette fois, les trésors sont <strong>cachés dans l'appart</strong>. Chaque cadeau porte le code du suivant.</p>`,
      rooms: [
        {
          type: "lock",
          prompt: `<p>Premier cadeau : Tes boucles se font chouchouter par ici.</p>
                   <p>L'étiquette te donnera le code du cadenas.</p>`,
          hint: "La salle de bain ! Le code, c'est un jour et un mois de décembre 🎄",
          answers: ["0412"],
        },
        {
          type: "text",
          prompt: `<p>Deuxième cadeau : là où j'écoute la musique, quelque chose y attend ton casque.</p>
                   <p>Son étiquette te souffle le mot de passe.</p>`,
          placeholder: "Le mot de passe…",
          hint: "Chaud, rouge, épicé, en plein marché de Noël 🍷",
          answers: ["Vin chaud"],
        },
        {
          type: "text",
          prompt: `<p>On pourrait se faire des calins pendant des heures dans cet endroit...</p>`,
          placeholder: "Le mot de passe…",
          hint: "Miaou 🐱",
          answers: ["Arya"],
        },
      ],
      // À PERSONNALISER : ton petit mot
      outro: `<p>Bon anniversaire mon coeur 💛 Merci d'avoir joué le jeu toute la semaine.</p>
              <p>Mais ce n'est pas tout… <strong>un dernier cadeau</strong> est en route. Il arrivera le 21 novembre, entourée de tes amis 🎷.</p>
              <p class="hunt-big-countdown"><span class="hunt-countdown" data-to="2026-11-21T19:00:00+01:00"></span></p>`,
    },
  ],
};
