// ===== CONFIG — modifie ici les infos de la soirée =====
const CONFIG = {
  start: "2026-11-21T19:00:00+01:00", // heure de Paris
  end: "2026-11-22T03:00:00+01:00",
  time: "19h00",
  place: "Mas des Sauges",
  address: "", // ex : "123 chemin des Sauges, 30000 Nîmes" — laisse vide pour garder le message par défaut
};

const $ = (s) => document.querySelector(s);

// ===== Infos dynamiques =====
$("#info-time").textContent = CONFIG.time;
if (CONFIG.address) {
  $("#info-address").textContent = CONFIG.address;
  $("#mapsLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.address);
}

// ===== Ciel étoilé =====
(() => {
  const canvas = $("#stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    const count = Math.floor((innerWidth * innerHeight) / 5000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 1.2 + 0.3) * devicePixelRatio,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.phase += s.speed;
      ctx.globalAlpha = 0.35 + Math.sin(s.phase) * 0.35;
      ctx.fillStyle = "#fff8e1";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  addEventListener("resize", resize);
  resize();
  draw();
})();

// ===== Compte à rebours =====
(() => {
  const target = new Date(CONFIG.start).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  let timer;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      $("#countdown").hidden = true;
      $("#countdownDone").hidden = false;
      setTimeout(() => launchConfetti(), 800);
      return;
    }
    $("#cd-days").textContent = Math.floor(diff / 86400000);
    $("#cd-hours").textContent = pad(Math.floor((diff / 3600000) % 24));
    $("#cd-mins").textContent = pad(Math.floor((diff / 60000) % 60));
    $("#cd-secs").textContent = pad(Math.floor((diff / 1000) % 60));
  }

  timer = setInterval(tick, 1000);
  tick();
})();

// ===== Navigation =====
addEventListener("scroll", () => $("#nav").classList.toggle("scrolled", scrollY > 40));
$("#navToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
document.querySelectorAll("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => $("#navLinks").classList.remove("open"))
);

// ===== Apparition au scroll =====
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== Ajout au calendrier =====
(() => {
  const toUTC = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = "Didi's 30 · Midnight Jazz & Island Grooves";
  const details = "Les 30 ans de Marindi ! Dress code : Midnight Jazz & Island Grooves 🎷🌴";
  const location = CONFIG.address || CONFIG.place;

  $("#gcalLink").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(title) +
    "&dates=" + toUTC(CONFIG.start) + "/" + toUTC(CONFIG.end) +
    "&details=" + encodeURIComponent(details) +
    "&location=" + encodeURIComponent(location);

  $("#icsBtn").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Didi's 30//FR",
      "BEGIN:VEVENT",
      "UID:didis30-20261121@didi",
      "DTSTAMP:" + toUTC(new Date()),
      "DTSTART:" + toUTC(CONFIG.start),
      "DTEND:" + toUTC(CONFIG.end),
      "SUMMARY:" + title,
      "DESCRIPTION:" + details,
      "LOCATION:" + location,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "didis-30.ics" });
    a.click();
    URL.revokeObjectURL(url);
  });
})();

// ===== Quiz =====
(() => {
  const questions = [
    {
      q: "Ton verre idéal pour commencer la soirée ?",
      a: [["Un old fashioned, bien ambré", "jazz"], ["Un ti-punch ou une piña colada", "island"]],
    },
    {
      q: "Sur la piste, tu es plutôt…",
      a: [["Swing & claquements de doigts", "jazz"], ["Hanches libres, zouk jusqu'à l'aube", "island"]],
    },
    {
      q: "Ta tenue de rêve pour le 21 novembre ?",
      a: [["Velours, sequins et chapeau feutre", "jazz"], ["Chemise à fleurs et lunettes de soleil", "island"]],
    },
    {
      q: "À 2h du mat', on te retrouve…",
      a: [["Au bar, à refaire le monde", "jazz"], ["Encore au milieu de la piste", "island"]],
    },
  ];
  const results = {
    jazz: { emoji: "🎷", title: "Midnight Crooner", text: "Élégance, mystère et regard ténébreux : tu es l'âme du speakeasy. Sors le nœud pap' !" },
    island: { emoji: "🌺", title: "Island Groover", text: "Soleil intérieur et bassin incontrôlable : c'est toi qui vas mettre le feu à minuit !" },
    tie: { emoji: "🌙", title: "Moonlight Hybrid", text: "Le meilleur des deux mondes : smoking ET chemise hawaïenne. Tu as tout compris au thème." },
  };

  const box = $("#quiz-questions");
  const resultBox = $("#quiz-result");
  let step = 0;
  let score = { jazz: 0, island: 0 };

  function render() {
    const { q, a } = questions[step];
    box.innerHTML = `
      <p class="quiz-progress">Question ${step + 1} / ${questions.length}</p>
      <p class="quiz-q">${q}</p>
      <div class="quiz-options">
        ${a.map(([label, key]) => `<button data-key="${key}">${label}</button>`).join("")}
      </div>`;
    box.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        score[b.dataset.key]++;
        step++;
        step < questions.length ? render() : showResult();
      })
    );
  }

  function showResult() {
    const key = score.jazz === score.island ? "tie" : score.jazz > score.island ? "jazz" : "island";
    const r = results[key];
    box.hidden = true;
    resultBox.hidden = false;
    resultBox.innerHTML = `
      <div class="big">${r.emoji}</div>
      <p class="quiz-progress">Tu es…</p>
      <h3>${r.title}</h3>
      <p>${r.text}</p>
      <button class="btn btn-ghost small" id="quizRestart">Recommencer</button>`;
    $("#quizRestart").addEventListener("click", () => {
      step = 0;
      score = { jazz: 0, island: 0 };
      box.hidden = false;
      resultBox.hidden = true;
      render();
    });
    launchConfetti(80);
  }

  render();
})();

// ===== Confettis =====
const confettiCanvas = $("#confetti");
const cctx = confettiCanvas.getContext("2d");
let pieces = [];
let confettiRunning = false;

function launchConfetti(amount = 160) {
  confettiCanvas.width = innerWidth;
  confettiCanvas.height = innerHeight;
  const colors = ["#d4af37", "#f2d98a", "#1fb5a5", "#ff6f61", "#ffc857", "#ff9ecb"];
  const symbols = ["♪", "♫", "🌺", "✦"];
  for (let i = 0; i < amount; i++) {
    pieces.push({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: colors[(Math.random() * colors.length) | 0],
      symbol: Math.random() < 0.15 ? symbols[(Math.random() * symbols.length) | 0] : null,
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  pieces = pieces.filter((p) => p.y < confettiCanvas.height + 30);
  for (const p of pieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.fillStyle = p.color;
    if (p.symbol) {
      cctx.font = `${p.size * 2.2}px serif`;
      cctx.fillText(p.symbol, 0, 0);
    } else {
      cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    cctx.restore();
  }
  if (pieces.length) requestAnimationFrame(animateConfetti);
  else confettiRunning = false;
}

$("#partyBtn").addEventListener("click", () => launchConfetti(250));
$(".title-30").addEventListener("click", () => launchConfetti());
