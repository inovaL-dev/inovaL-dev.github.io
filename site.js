"use strict";
(() => {
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  if (calmo) { palavras.forEach((p) => p.classList.remove("ativa")); return; }

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
})();
