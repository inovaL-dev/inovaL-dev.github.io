"use strict";
(() => {
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* A versão e o histórico vêm do mesmo arquivo que avisa os programas instalados. */
  fetch(`versao.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => {
    if (!d?.versao) return;
    document.querySelectorAll("[data-versao]").forEach((n) => { n.textContent = d.versao; });
    const lista = document.querySelector("#linha-versoes"), mes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
    if (!d.historico?.length) return;
    lista.replaceChildren(...d.historico.slice(0, 6).map((v, n) => {
      const li = document.createElement("li"), h = document.createElement("h3"), s = document.createElement("small"), p = document.createElement("p"), data = mes.format(new Date(`${v.data}T12:00:00Z`));
      s.textContent = n ? data : `Atual, ${data}`; h.append(`${v.versao} `, s); p.textContent = v.notas.join(" "); if (calmo) li.className = "ligada"; li.append(h, p); return li;
    }));
    dispatchEvent(new Event("resize"));
  }).catch(() => {});
  const palavras = [...document.querySelectorAll("#legenda span")], sinal = document.querySelector("#sinal"), agulha = document.querySelector("#agulha"), saida = document.querySelector("#saida");
  const CORES = ["linear-gradient(#e9546e,#ffbe5c)", "linear-gradient(#1e96aa,#96f0d2)", "linear-gradient(#b43caa,#ff9678)", "linear-gradient(#5a5ae6,#faa0dc)", "linear-gradient(#32be78,#dcfa96)"];
  let barras = [], picos = [];

  function montar() {
    const total = Math.ceil(innerWidth / 12) + 2;
    sinal.replaceChildren(); barras = []; picos = [];
    for (let n = 0; n < total; n++) {
      const i = document.createElement("i"), pico = n % 23 === 11;
      i.style.setProperty("--a", pico ? 92 : Math.round(14 + 34 * Math.abs(Math.sin(n * 1.7) * Math.cos(n * .37))));
      if (pico) { i.className = "pico"; picos.push(n); }
      sinal.append(i); barras.push(i);
    }
  }
  montar();
  let espera = 0; addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(montar, 200); });
  if (calmo) { palavras.forEach((p) => p.classList.remove("ativa")); document.querySelectorAll(".versoes li").forEach((l) => l.classList.add("ligada")); return; }

  let palavra = 0;
  const legenda = () => { palavras.forEach((p, n) => p.classList.toggle("ativa", n === palavra)); palavra = (palavra + 1) % palavras.length; };
  legenda(); setInterval(legenda, 620);

  const DURACAO = 11000; let inicio = performance.now(), ultima = -1, cor = 0;
  function quadro(agora) {
    if (document.hidden) { inicio = agora - ((agora - inicio) % DURACAO); requestAnimationFrame(quadro); return; }
    const f = ((agora - inicio) % DURACAO) / DURACAO, x = f * sinal.clientWidth, n = barras.findIndex((b) => b.offsetLeft > x);
    agulha.style.transform = `translateX(${x}px)`;
    if (n !== ultima && n >= 0) {
      if (n < ultima) barras.forEach((b) => b.classList.remove("lido"));
      for (let k = Math.max(0, ultima); k < n; k++) { barras[k].classList.add("lido");
        if (picos.includes(k)) { const c = document.createElement("b"); c.style.left = `${barras[k].offsetLeft - 28}px`; c.style.background = CORES[cor++ % CORES.length]; c.addEventListener("animationend", () => c.remove()); saida.append(c); } }
      ultima = n;
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* ---------- Efeitos ligados à rolagem ---------- */
  const $ = (q) => document.querySelector(q), $$ = (q) => [...document.querySelectorAll(q)];
  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), suave = (t) => t * t * (3 - 2 * t);
  const topo = $(".topo"), trilha = $("#trilha"), texto = $("#abre-txt"), vitrine = $("#vitrine img"), passos = $$(".passos li"), capitulos = $$(".capitulos article"), telas = $$("#monitor img"), corte = $("#corte"), monitor = $("#monitor");
  const linha = $("#linha-versoes"), baixar = $("#baixar"); let versoes = $$("#linha-versoes li");
  const pos = (n) => { let y = 0; for (; n; n = n.offsetParent) y += n.offsetTop; return y; };
  let m = {};
  function medir() {
    versoes = $$("#linha-versoes li");
    m = { alt: innerHeight, max: Math.max(1, document.documentElement.scrollHeight - innerHeight), vitrine: pos(vitrine), passos: pos($("#passos ol")), cap: capitulos.map(pos), capAlt: capitulos[0].offsetHeight, linha: pos(linha), linhaAlt: linha.offsetHeight, versoes: versoes.map(pos), baixar: pos(baixar) };
    trilha.querySelectorAll("u").forEach((u) => u.remove());
    for (const id of ["recursos", "versoes", "baixar"]) { const u = document.createElement("u"); u.style.left = `${lim(pos(document.getElementById(id)) / m.max, 0, .995) * 100}%`; trilha.append(u); }
    pintar();
  }
  function pintar() {
    const y = scrollY, h = m.alt, desktop = innerWidth > 960;
    topo.classList.toggle("rolou", y > 24); trilha.style.setProperty("--p", lim(y / m.max).toFixed(4));
    const s = lim(y / (h * .7)); texto.style.transform = `translateY(${(y * .16).toFixed(1)}px) scale(${(1 - s * .06).toFixed(3)})`; texto.style.opacity = (1 - s * .8).toFixed(3);
    const v = suave(lim((y + h - m.vitrine) / (h * .8))); vitrine.style.transform = `rotateX(${((1 - v) * 24).toFixed(2)}deg) scale(${(.86 + v * .14).toFixed(3)})`;
    passos.forEach((l, n) => l.style.setProperty("--l", suave(lim((y + h * .78 - m.passos - n * h * .12) / (h * .16))).toFixed(3)));
    if (desktop) {
      const passo = m.capAlt, g = lim((y + h / 2 - m.cap[0] - passo / 2) / passo, 0, telas.length - 1); let agulha = -1;
      telas.forEach((t, k) => { if (!k) return; const w = suave(lim((g - (k - 1) - .3) / .4)); t.style.clipPath = `inset(0 0 0 ${((1 - w) * 100).toFixed(2)}%)`; if (w > 0 && w < 1) agulha = 1 - w; });
      corte.style.opacity = agulha < 0 ? 0 : 1; if (agulha >= 0) corte.style.transform = `translateX(${(agulha * monitor.clientWidth).toFixed(1)}px)`;
      const atual = Math.round(g); capitulos.forEach((c, k) => c.classList.toggle("ativo", k === atual));
    } else telas.forEach((t) => { t.style.clipPath = ""; });
    const f = lim((y + h * .72 - m.linha) / m.linhaAlt); linha.style.setProperty("--v", f.toFixed(3)); versoes.forEach((l, n) => l.classList.toggle("ligada", y + h * .72 >= m.versoes[n] + 8));
    baixar.style.setProperty("--b", suave(lim((y + h - m.baixar) / (h * .55))).toFixed(3));
  }
  let pedido = 0; addEventListener("scroll", () => { if (!pedido) pedido = requestAnimationFrame(() => { pedido = 0; pintar(); }); }, { passive: true });
  addEventListener("resize", medir); addEventListener("load", medir); document.fonts?.ready.then(medir); medir();

  const contar = (n) => { const fim = +n.dataset.n, t0 = performance.now(); const passo = (t) => { const p = lim((t - t0) / 1100); n.textContent = Math.round(fim * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(passo); }; requestAnimationFrame(passo); };
  const vistos = new IntersectionObserver((lista) => lista.forEach((e) => { if (!e.isIntersecting) return; vistos.unobserve(e.target); e.target.classList.add("visivel"); if (e.target.dataset.n) contar(e.target); }), { threshold: .35 });
  $$(".sobe, .numeros b").forEach((n) => { if (n.dataset.n) n.textContent = "0"; vistos.observe(n); });
  baixar.addEventListener("pointermove", (ev) => { const r = baixar.getBoundingClientRect(); baixar.style.setProperty("--mx", `${ev.clientX - r.left}px`); baixar.style.setProperty("--my", `${ev.clientY - r.top}px`); }, { passive: true });
})();
