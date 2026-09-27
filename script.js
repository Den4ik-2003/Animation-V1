(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 820;

  const dot = document.getElementById("curDot"),
    ring = document.getElementById("curRing");
  let mx = innerWidth / 2,
    my = innerHeight / 2,
    rx = mx,
    ry = my;
  if (!isMobile) {
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    (function ringLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(ringLoop);
    })();
    document.querySelectorAll("a,button,.card").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("big"));
      el.addEventListener("mouseleave", () => ring.classList.remove("big"));
    });
    window.addEventListener("mousedown", () => ring.classList.add("click"));
    window.addEventListener("mouseup", () => ring.classList.remove("click"));
  }

  document.querySelectorAll(".cta-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = btn.getBoundingClientRect();
      r.style.left = e.clientX - rect.left - 10 + "px";
      r.style.top = e.clientY - rect.top - 10 + "px";
      r.style.width = r.style.height = "20px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 650);
    });
  });

  const canvas = document.getElementById("bgCanvas"),
    ctx = canvas.getContext("2d");
  let W,
    H,
    DPR = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const COUNT = isMobile ? 260 : 650;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.6 + 0.4,
    a: Math.random() * 0.5 + 0.15,
  }));
  let pmx = innerWidth / 2,
    pmy = innerHeight / 2,
    active = false;
  window.addEventListener("mousemove", (e) => {
    pmx = e.clientX;
    pmy = e.clientY;
    active = true;
  });
  let clickWave = null;
  window.addEventListener("mousedown", (e) => {
    clickWave = { x: e.clientX, y: e.clientY, r: 0, a: 1 };
  });

  function drawParticles() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const grad = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 320);
    grad.addColorStop(0, "rgba(255,214,0,.05)");
    grad.addColorStop(1, "rgba(255,214,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - pmx,
        dy = p.y - pmy,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (active && dist < 140) {
        const f = ((140 - dist) / 140) * 0.6;
        p.vx += (dx / dist) * f * 0.5;
        p.vy += (dy / dist) * f * 0.5;
      }
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = innerWidth;
      if (p.x > innerWidth) p.x = 0;
      if (p.y < 0) p.y = innerHeight;
      if (p.y > innerHeight) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,234,120,${p.a})`;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < i + 6 && j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dx = a.x - b.x,
          dy = a.y - b.y,
          d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.strokeStyle = `rgba(255,214,0,${(1 - d / 90) * 0.08})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    if (clickWave) {
      ctx.beginPath();
      ctx.arc(clickWave.x, clickWave.y, clickWave.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,234,0,${clickWave.a})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      clickWave.r += 14;
      clickWave.a -= 0.02;
      if (clickWave.a <= 0) clickWave = null;
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  const lc = document.getElementById("liquid"),
    lctx = lc.getContext("2d");
  function lresize() {
    lc.width = innerWidth * DPR;
    lc.height = innerHeight * 0.38 * DPR;
    lc.style.width = innerWidth + "px";
    lc.style.height = innerHeight * 0.38 + "px";
    lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  lresize();
  window.addEventListener("resize", lresize);
  let t = 0;
  function drawLiquid() {
    const w = innerWidth,
      h = innerHeight * 0.38;
    lctx.clearRect(0, 0, w, h);
    t += 0.012;
    const tilt = (pmx / innerWidth - 0.5) * 20;
    for (let layer = 0; layer < 3; layer++) {
      lctx.beginPath();
      const base = h * (0.75 + layer * 0.12);
      lctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20) {
        const y =
          base +
          Math.sin(x * 0.006 + t * (1 + layer * 0.3) + layer) *
            14 *
            (1 + layer) +
          tilt * (layer + 1) * 0.3;
        lctx.lineTo(x, y);
      }
      lctx.lineTo(w, h);
      lctx.closePath();
      const g = lctx.createLinearGradient(0, base - 30, 0, h);
      g.addColorStop(0, `rgba(255,214,0,${0.1 - layer * 0.02})`);
      g.addColorStop(1, `rgba(255,234,0,${0.03})`);
      lctx.fillStyle = g;
      lctx.fill();
    }
    requestAnimationFrame(drawLiquid);
  }
  drawLiquid();

  const hero = document.getElementById("heroText");
  window.addEventListener("mousemove", (e) => {
    if (isMobile || reduced) return;
    const nx = e.clientX / innerWidth - 0.5,
      ny = e.clientY / innerHeight - 0.5;
    hero.style.transform = `rotateY(${nx * 10}deg) rotateX(${-ny * 10}deg)`;
  });

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (isMobile) return;
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5,
        ny = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${nx * 14}deg) rotateX(${-ny * 14}deg) translateY(-6px) scale(1.03)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "none";
    });
  });

  const stages = document.querySelectorAll(".stage-inner");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        en.target.style.transition =
          "opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1)";
        if (en.isIntersecting) {
          en.target.style.opacity = 1;
          en.target.style.transform = "translateY(0) scale(1)";
        } else {
          en.target.style.opacity = 0.15;
          en.target.style.transform = "translateY(24px) scale(.97)";
        }
      });
    },
    { threshold: 0.4 },
  );
  stages.forEach((s) => {
    s.style.opacity = 0.15;
    s.style.transform = "translateY(24px) scale(.97)";
    io.observe(s);
  });

  window.addEventListener("load", () => {
    const intro = document.getElementById("intro"),
      nav = document.getElementById("nav");
    const delay = reduced ? 200 : 1300;
    setTimeout(() => {
      intro.classList.add("hide");
      nav.classList.add("show");
      stages[0].style.opacity = 1;
      stages[0].style.transform = "none";
      setTimeout(() => intro.remove(), 900);
    }, delay);
  });
})();
