// ===== Chasse au trésor : le Speakeasy de Minuit =====
// Contenu dans hunt-data.js. Entrée : frapper 3 fois sur la lune.
(() => {
  const STORE = "didis30-hunt-v2";
  const params = new URLSearchParams(location.search);
  if (params.has("reset-hunt")) localStorage.removeItem(STORE);
  const offset = params.get("hunt-now") ? new Date(params.get("hunt-now")).getTime() - Date.now() : 0;
  const now = () => Date.now() + offset;

  // ----- Données -----
  const rooms = HUNT.days.flatMap((day, d) => day.rooms.map((room, r) => ({ ...room, day, r, id: `${d}-${r}` })));
  const state = { solved: 0, scratched: [], used: {}, ...JSON.parse(localStorage.getItem(STORE) || "{}") };
  const save = () => localStorage.setItem(STORE, JSON.stringify(state));
  const current = () => rooms[state.solved];
  const isOpen = (day) => now() >= new Date(day.date).getTime();
  const won = () => rooms.slice(0, state.solved).filter((r) => r.ticket);
  const hour = (day) =>
    new Date(day.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).replace(":", "h").replace(/^0/, "");

  // ----- Réponses -----
  const normalize = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  function distance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0]++;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }
  // Une faute de frappe tolérée sur les réponses texte d'au moins 5 lettres
  const matches = (room, value) =>
    room.answers.some((a) => {
      const [v, n] = [normalize(value), normalize(a)];
      return v === n || (["text", "torch"].includes(room.type) && n.length >= 5 && distance(v, n) <= 1);
    });

  // ----- Petits outils -----
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  function toast(text) {
    const t = Object.assign(document.createElement("div"), { className: "hunt-toast", textContent: text });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  }

  function fmt(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const [d, h, m, sec] = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    const pad = (n) => String(n).padStart(2, "0");
    return (d ? `${d} j ` : "") + `${pad(h)} h ${pad(m)} min ${pad(sec)} s`;
  }

  console.log("%c🎷 Coucou chat. Tu as trouvé un petit indice. Voici un indice pour chercher ce qui est caché : Je n'ai pas de propre lumière. Je change de visage tout au long du mois, sans jamais vieillir. Qui suis-je ?", "font: 15px Georgia; color: #d4af37");

  // ----- Éléments -----
  const door = Object.assign(document.createElement("div"), { className: "hunt-door", hidden: true });
  door.innerHTML = `
    <div class="hunt-panel" role="dialog" aria-modal="true" aria-label="Le Speakeasy de Minuit">
      <button class="hunt-close" aria-label="Fermer">×</button>
      <div class="hunt-body"></div>
      <div class="hunt-leaves closed" aria-hidden="true"><span></span><span></span></div>
    </div>`;
  const keyBtn = Object.assign(document.createElement("button"), { className: "hunt-key", textContent: "🗝️", hidden: !state.solved });
  keyBtn.setAttribute("aria-label", "Retourner au speakeasy");
  const torch = Object.assign(document.createElement("div"), { className: "hunt-torch", hidden: true });
  const torchOff = Object.assign(document.createElement("button"), {
    className: "btn btn-gold small hunt-torch-off", textContent: "🔦 Éteindre la lampe", hidden: true,
  });
  document.body.append(door, keyBtn, torch, torchOff);

  const panel = door.querySelector(".hunt-panel");
  const body = door.querySelector(".hunt-body");
  const leaves = door.querySelector(".hunt-leaves");

  // ----- La porte -----
  // Ouvre la porte (ou referme puis rouvre les battants) sur un nouvel écran
  async function show(render) {
    const wasOpen = !door.hidden;
    leaves.classList.add("closed");
    if (wasOpen) await wait(700);
    door.hidden = false;
    document.body.classList.add("hunt-open");
    render();
    body.scrollTop = 0;
    await wait(wasOpen ? 150 : 350);
    leaves.classList.remove("closed");
    if (matchMedia("(hover: hover)").matches) body.querySelector("input")?.focus();
  }

  function closeDoor() {
    door.hidden = true;
    document.body.classList.remove("hunt-open");
    clearTimeout(hintTimer);
  }

  door.querySelector(".hunt-close").addEventListener("click", closeDoor);
  door.addEventListener("click", (e) => e.target === door && closeDoor());
  addEventListener("keydown", (e) => e.key === "Escape" && !door.hidden && closeDoor());
  keyBtn.addEventListener("click", () => show(home));

  // Contenu + onglets en haut de la porte
  function paint(html) {
    const n = won().length;
    body.innerHTML = `
      <nav class="hunt-tabs">
        <button data-go="home">🚪 Porte</button>
        <button data-go="wallet">🎟️ Tickets${n ? ` (${n})` : ""}</button>
        <button data-go="week">📅 Semaine</button>
      </nav>
      ${html}`;
    const screens = { home, wallet, week };
    body.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(screens[b.dataset.go])));
    tickCountdowns();
  }

  // Comptes à rebours vivants tant que la porte est ouverte
  function tickCountdowns() {
    body.querySelectorAll(".hunt-countdown").forEach((el) => {
      const left = new Date(el.dataset.to).getTime() - now();
      el.textContent = fmt(left);
      if (left <= 0 && el.dataset.reload) {
        delete el.dataset.reload;
        show(home);
      }
    });
  }
  setInterval(() => !door.hidden && tickCountdowns(), 1000);

  // ----- Écrans -----
  function home() {
    const room = current();
    if (!room) return outro(HUNT.days[HUNT.days.length - 1]);
    if (!isOpen(room.day)) return waiting(room.day);
    renderRoom(room);
  }

  function waiting(day) {
    const first = !state.solved;
    paint(`
      <p class="hunt-kicker">${first ? "Le Speakeasy de Minuit" : "Patience…"}</p>
      <h3>${first ? "Fermé pour l'instant" : "Porte close"}</h3>
      <div class="hunt-text">
        <p>${first ? "Ton anniversaire ouvre ses portes à partir du" : "La prochaine porte s'ouvre"} <strong>${day.label.toLowerCase()} à ${hour(day)}</strong>.</p>
      </div>
      <p class="hunt-big-countdown"><span class="hunt-countdown" data-to="${day.date}" data-reload="1"></span></p>`);
  }

  let fails = 0;
  let hintTimer;

  function renderRoom(room) {
    const { day } = room;
    fails = 0;
    paint(`
      <p class="hunt-kicker">${day.label} · Porte ${HUNT.days.indexOf(day) + 1} / ${HUNT.days.length}</p>
      <h3>${day.title}</h3>
      ${room.r === 0 && day.intro ? `<div class="hunt-text">${day.intro}</div>` : ""}
      ${day.rooms.length > 1 ? `<p class="hunt-step">Énigme ${room.r + 1} / ${day.rooms.length}</p>` : ""}
      <div class="hunt-text">${room.prompt || ""}</div>
      <div class="hunt-game"></div>
      <p class="hunt-feedback" aria-live="polite"></p>
      ${room.hint ? `<button class="hunt-hint-btn" hidden>Un coup de pouce ?</button><p class="hunt-hint" hidden>${room.hint}</p>` : ""}`);

    games[room.type](room, body.querySelector(".hunt-game"));

    const hintBtn = body.querySelector(".hunt-hint-btn");
    hintBtn?.addEventListener("click", () => {
      hintBtn.hidden = true;
      body.querySelector(".hunt-hint").hidden = false;
    });
    clearTimeout(hintTimer);
    hintTimer = setTimeout(showHintButton, 60000);
  }

  function renderScratch(room) {
    paint(`
      <p class="hunt-kicker">${room.day.title}</p>
      <h3>Ticket gagné !</h3>
      <div class="hunt-text"><p>Gratte-le avec ton doigt ✦</p></div>
      ${ticketHTML(room)}
      <button class="btn btn-gold hunt-next">Continuer →</button>`);
    mountScratch(body.querySelector(".hunt-ticket"));
    body.querySelector(".hunt-next").addEventListener("click", () => show(() => next(room)));
  }

  function renderReveal(room) {
    paint(`
      <p class="hunt-kicker">${room.day.title}</p>
      <h3>Gagné !</h3>
      <div class="hunt-text">${room.reveal}</div>
      <button class="btn btn-gold hunt-next">Continuer →</button>`);
    body.querySelector(".hunt-next").addEventListener("click", () => show(() => next(room)));
  }

  function next(room) {
    const nxt = current();
    nxt?.day === room.day ? renderRoom(nxt) : outro(room.day);
  }

  function outro(day) {
    const nxt = current();
    paint(`
      <p class="hunt-kicker">${day.label}</p>
      <h3>${day.title} ✓</h3>
      <div class="hunt-text">${day.outro || ""}</div>
      ${nxt ? `
        <div class="hunt-next-door">
          <p>Prochaine porte : <strong>${nxt.day.label.toLowerCase()} à ${hour(nxt.day)}</strong></p>
          <p class="hunt-big-countdown"><span class="hunt-countdown" data-to="${nxt.day.date}" data-reload="1"></span></p>
        </div>` : ""}`);
    // Si la porte suivante est déjà ouverte, on y va directement
    if (nxt && isOpen(nxt.day)) {
      body.querySelector(".hunt-next-door").innerHTML = `<button class="btn btn-gold">Porte suivante →</button>`;
      body.querySelector(".hunt-next-door button").addEventListener("click", () => show(home));
    }
  }

  function wallet() {
    const list = won();
    paint(`
      <p class="hunt-kicker">Ton portefeuille</p>
      <h3>Mes tickets</h3>
      ${list.length
        ? `<div class="hunt-text"><p>Montre-moi un ticket quand tu veux l'utiliser.</p></div>
           <div class="hunt-wallet">
             ${list.map((r) => `<div class="hunt-wallet-item">${ticketHTML(r)}${state.used[r.id] ? "" : `<button class="btn btn-ghost small" data-use="${r.id}">Utiliser ce ticket</button>`}</div>`).join("")}
           </div>`
        : `<div class="hunt-text"><p>Pas encore de ticket… patience 🎷</p></div>`}`);
    body.querySelectorAll(".hunt-ticket").forEach(mountScratch);
    body.querySelectorAll("[data-use]").forEach((b) =>
      b.addEventListener("click", () => {
        if (!confirm("Utiliser ce ticket maintenant ?")) return;
        state.used[b.dataset.use] = new Date(now()).toISOString();
        save();
        launchConfetti(80);
        wallet();
      })
    );
  }

  function week() {
    paint(`
      <p class="hunt-kicker">Le programme</p>
      <h3>La semaine</h3>
      <ol class="hunt-week">
        ${HUNT.days.map((day) => {
          const done = rooms.filter((r) => r.day === day).every((r) => rooms.indexOf(r) < state.solved);
          const open = !done && current()?.day === day && isOpen(day);
          const cls = done ? "done" : open ? "open" : "locked";
          return `<li class="${cls}">
            <span>${day.label} · ${hour(day)}</span>
            <strong>${done || open ? day.title : "???"}</strong>
            <em>${done ? "✓" : open ? "Ouverte" : "🔒"}</em>
          </li>`;
        }).join("")}
      </ol>`);
  }

  function showHintButton() {
    const btn = body.querySelector(".hunt-hint-btn");
    if (btn && body.querySelector(".hunt-hint").hidden) btn.hidden = false;
  }

  // ----- Réussite / échec -----
  const nopes = [
    "La porte reste close…",
    "Le portier hausse un sourcil 🤨",
    "Hmm… ce n'est pas ça.",
    "Presque ? Ou pas du tout… 🎷",
  ];

  function fail() {
    fails++;
    body.querySelector(".hunt-feedback").textContent = nopes[(fails - 1) % nopes.length];
    panel.classList.remove("hunt-shake");
    void panel.offsetWidth;
    panel.classList.add("hunt-shake");
    if (fails >= 2) showHintButton();
  }

  function solve(room) {
    if (current() !== room) return;
    state.solved++;
    save();
    keyBtn.hidden = false;
    clearTimeout(hintTimer);
    stopTorch();
    show(() => (room.ticket ? renderScratch(room) : room.reveal ? renderReveal(room) : next(room)));
    launchConfetti(room.ticket?.gold ? 300 : 120);
  }

  // ----- Tickets à gratter -----
  const ticketHTML = (room) => `
    <div class="hunt-ticket${room.ticket.gold ? " gold" : ""}" data-id="${room.id}">
      <span class="hunt-ticket-icon">${room.ticket.icon}</span>
      <strong>${room.ticket.title}</strong>
      <span>${room.ticket.text}</span>
      ${state.used[room.id] ? `<em class="hunt-stamp">Utilisé</em>` : ""}
    </div>`;

  function mountScratch(ticket) {
    const id = ticket.dataset.id;
    if (state.scratched.includes(id)) return;
    const canvas = Object.assign(document.createElement("canvas"), { className: "hunt-scratch" });
    ticket.appendChild(canvas);

    requestAnimationFrame(() => {
      const w = Math.round(ticket.offsetWidth);
      const h = Math.round(ticket.offsetHeight);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8d919e");
      g.addColorStop(0.5, "#dfe2e8");
      g.addColorStop(1, "#8d919e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4a4e5a";
      ctx.font = "600 16px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✦ Gratte-moi ✦", w / 2, h / 2 + 5);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = 38;

      let last = null;
      let strokes = 0;
      const pos = (e) => {
        const r = canvas.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
      };
      const line = (a, b) => {
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.stroke();
      };
      function cleared() {
        const data = ctx.getImageData(0, 0, w, h).data;
        let clear = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += 64) {
          total++;
          if (data[i] === 0) clear++;
        }
        return clear / total;
      }
      function finish() {
        if (state.scratched.includes(id)) return;
        state.scratched.push(id);
        save();
        canvas.classList.add("done");
        setTimeout(() => canvas.remove(), 600);
        launchConfetti(100);
      }

      canvas.addEventListener("pointerdown", (e) => {
        last = pos(e);
        canvas.setPointerCapture(e.pointerId);
        line(last, last);
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!last) return;
        const p = pos(e);
        line(last, p);
        last = p;
        if (++strokes % 12 === 0 && cleared() > 0.5) finish();
      });
      const up = () => {
        last = null;
        if (cleared() > 0.5) finish();
      };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    });
  }

  // ----- Les jeux -----
  const games = {
    text(room, box) {
      box.innerHTML = `
        <form class="hunt-form">
          <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                 placeholder="${room.placeholder || "Le mot de passe…"}" aria-label="Réponse" />
          <button class="btn btn-gold" type="submit">Entrer</button>
        </form>`;
      box.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.target.querySelector("input");
        if (matches(room, input.value)) return solve(room);
        fail();
        input.select();
      });
    },

    torch(room, box) {
      games.text(room, box);
      const btn = Object.assign(document.createElement("button"), { className: "btn btn-ghost small", textContent: "🔦 Allumer la lampe" });
      btn.addEventListener("click", () => startTorch(room));
      box.appendChild(btn);
    },

    qcm(room, box) {
      box.innerHTML = `<div class="hunt-options">${room.options.map((o, i) => `<button data-i="${i}">${o}</button>`).join("")}</div>`;
      box.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          if (Number(b.dataset.i) === room.answer) {
            b.classList.add("right");
            setTimeout(() => solve(room), 600);
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            fail();
          }
        })
      );
    },

    memory(room, box) {
      const cards = shuffle([...room.photos, ...room.photos]);
      box.innerHTML = `
        <div class="hunt-memory">
          ${cards.map((src) => `
            <button class="hunt-card" data-src="${src}" aria-label="Carte">
              <span class="hunt-card-back">♪</span>
              <img class="hunt-card-front" src="${src}" alt="" />
            </button>`).join("")}
        </div>`;
      let open = [];
      let pairs = 0;
      let locked = false;
      box.querySelectorAll(".hunt-card").forEach((card) =>
        card.addEventListener("click", () => {
          if (locked || card.classList.contains("flipped")) return;
          card.classList.add("flipped");
          open.push(card);
          if (open.length < 2) return;
          const [a, b] = open;
          open = [];
          if (a.dataset.src === b.dataset.src) {
            a.classList.add("matched");
            b.classList.add("matched");
            if (++pairs === room.photos.length) setTimeout(() => solve(room), 900);
          } else {
            locked = true;
            setTimeout(() => {
              a.classList.remove("flipped");
              b.classList.remove("flipped");
              locked = false;
            }, 900);
          }
        })
      );
    },

    lock(room, box) {
      const size = normalize(room.answers[0]).length;
      const digits = Array(size).fill(0);
      box.innerHTML = `
        <div class="hunt-lock">
          <div class="hunt-shackle"></div>
          <div class="hunt-lock-body">
            ${digits.map((_, i) => `
              <div class="hunt-wheel" data-i="${i}">
                <button data-d="1" aria-label="Chiffre suivant">▲</button>
                <span>0</span>
                <button data-d="-1" aria-label="Chiffre précédent">▼</button>
              </div>`).join("")}
          </div>
        </div>`;
      const lock = box.querySelector(".hunt-lock");
      let opened = false;

      function turn(wheel, delta) {
        if (opened) return;
        const i = Number(wheel.dataset.i);
        digits[i] = (digits[i] + delta + 10) % 10;
        const span = wheel.querySelector("span");
        span.textContent = digits[i];
        span.classList.remove("roll");
        void span.offsetWidth;
        span.classList.add("roll");
        if (matches(room, digits.join(""))) {
          opened = true;
          lock.classList.add("open");
          setTimeout(() => solve(room), 1000);
        }
      }

      box.querySelectorAll(".hunt-wheel").forEach((wheel) => {
        wheel.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => turn(wheel, Number(b.dataset.d))));
        // Glisser le doigt vers le haut / le bas sur le chiffre
        const span = wheel.querySelector("span");
        let y0 = null;
        span.addEventListener("pointerdown", (e) => {
          y0 = e.clientY;
          span.setPointerCapture(e.pointerId);
        });
        span.addEventListener("pointermove", (e) => {
          if (y0 === null || Math.abs(e.clientY - y0) < 22) return;
          turn(wheel, e.clientY < y0 ? 1 : -1);
          y0 = e.clientY;
        });
        span.addEventListener("pointerup", () => (y0 = null));
      });
    },

    vinyls(room, box) {
      box.innerHTML = `<button class="btn btn-gold">🎶 Aller au jukebox</button>`;
      box.querySelector("button").addEventListener("click", () => {
        closeDoor();
        $(".vinyls").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
  };

  // ----- Frapper à la lune -----
  // Sur mobile le titre passe par-dessus la lune : on teste la position du tap plutôt que la cible
  const moon = $(".moon");
  let knocks = 0;
  let knockTimer;
  addEventListener("click", (e) => {
    const r = moon.getBoundingClientRect();
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) > r.width / 2) return;
    moon.classList.remove("hunt-knock");
    void moon.offsetWidth;
    moon.classList.add("hunt-knock");
    clearTimeout(knockTimer);
    knockTimer = setTimeout(() => (knocks = 0), 1200);
    if (++knocks >= 3) {
      knocks = 0;
      keyBtn.hidden = false;
      show(home);
    }
  });

  // ----- Lampe torche -----
  function placeLetters(room) {
    document.querySelectorAll(".hunt-letter").forEach((el) => el.remove());
    for (const l of room.letters) {
      const host = $(l.at);
      if (!host) continue;
      host.classList.add("hunt-host");
      const el = Object.assign(document.createElement("span"), { className: "hunt-letter", textContent: l.ch });
      el.setAttribute("aria-hidden", "true");
      Object.assign(el.style, { left: l.x, top: l.y });
      host.appendChild(el);
    }
  }

  function moveLight(x, y) {
    torch.style.setProperty("--x", x + "px");
    torch.style.setProperty("--y", y + "px");
  }

  function startTorch(room) {
    placeLetters(room);
    closeDoor();
    moveLight(innerWidth / 2, innerHeight / 2);
    torch.hidden = torchOff.hidden = false;
    document.body.classList.add("hunt-dark");
    toast("Balaye la page avec ta lumière… 🔦");
  }

  function stopTorch() {
    torch.hidden = torchOff.hidden = true;
    document.body.classList.remove("hunt-dark");
  }

  torchOff.addEventListener("click", () => {
    stopTorch();
    show(home);
  });
  addEventListener("pointermove", (e) => !torch.hidden && moveLight(e.clientX, e.clientY));
  const onTouch = (e) => !torch.hidden && moveLight(e.touches[0].clientX, e.touches[0].clientY);
  addEventListener("touchstart", onTouch, { passive: true });
  addEventListener("touchmove", onTouch, { passive: true });

  // ----- Jukebox -----
  const notes = [261.63, 329.63, 392.0, 493.88]; // Do mi sol si : un petit accord jazzy
  let audio;
  let taps = "";

  function play(i) {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "triangle";
    osc.frequency.value = notes[i];
    gain.gain.setValueAtTime(0.25, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.9);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.9);
  }

  function floatNote(vinyl) {
    const r = vinyl.getBoundingClientRect();
    const n = Object.assign(document.createElement("span"), { className: "hunt-note", textContent: "♪" });
    Object.assign(n.style, { left: r.left + r.width / 2 + "px", top: r.top + "px" });
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1200);
  }

  document.querySelectorAll(".vinyl").forEach((vinyl, i) =>
    vinyl.addEventListener("click", () => {
      vinyl.classList.remove("hunt-spin");
      void vinyl.offsetWidth;
      vinyl.classList.add("hunt-spin");
      const room = current();
      if (room?.type !== "vinyls" || !isOpen(room.day)) return;
      play(i);
      floatNote(vinyl);
      const size = normalize(room.answers[0]).length;
      taps = (taps + (i + 1)).slice(-size);
      if (taps.length === size && matches(room, taps)) {
        taps = "";
        setTimeout(() => solve(room), 500);
      }
    })
  );
})();
