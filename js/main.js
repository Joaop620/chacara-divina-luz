// Casa de Jesus e Lar de Frei Manuel · Chácara Divina Luz
// Interações do site, sem dependências externas.

(function () {
  "use strict";

  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Aviso rápido (toast) ----------
  var aviso = document.querySelector(".aviso");
  var tempoAviso;
  function avisar(texto) {
    aviso.textContent = texto;
    aviso.classList.add("mostrar");
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(function () { aviso.classList.remove("mostrar"); }, 2600);
  }

  // ---------- Topo: aparece ao rolar e mostra o progresso da leitura ----------
  var topo = document.getElementById("topo");
  var raiz = document.documentElement;
  var pedido = false;
  function aoRolar() {
    pedido = false;
    topo.classList.toggle("rolou", window.scrollY > window.innerHeight * 0.7);
    var total = raiz.scrollHeight - window.innerHeight;
    topo.style.setProperty("--p", total > 0 ? Math.min(window.scrollY / total, 1) : 0);
  }
  window.addEventListener("scroll", function () {
    if (!pedido) { pedido = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });
  aoRolar();

  // ---------- Menu no celular ----------
  var botaoMenu = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");
  function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
  }
  botaoMenu.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharMenu(); });

  if ("IntersectionObserver" in window) {
    // ---------- Capítulo atual em destaque no menu ----------
    var links = {};
    menu.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var espiao = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var link = links[entrada.target.id];
        if (!link) return;
        if (entrada.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("ativo"); });
          link.classList.add("ativo");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".capitulo").forEach(function (sec) { espiao.observe(sec); });

    // ---------- Entrada suave dos blocos ----------
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".revela").forEach(function (el) { observador.observe(el); });

    // ---------- Números que contam ao aparecer ----------
    var contador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        contador.unobserve(entrada.target);
        contar(entrada.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-contar]").forEach(function (el) { contador.observe(el); });
  } else {
    document.querySelectorAll(".revela").forEach(function (el) { el.classList.add("visivel"); });
  }

  function contar(el) {
    var alvo = parseInt(el.getAttribute("data-contar"), 10);
    var prefixo = el.getAttribute("data-prefixo") || "";
    if (reduzirMovimento || isNaN(alvo)) return;
    // Ano conta a partir de perto do valor; os outros, de zero
    var inicio = alvo > 1000 ? alvo - 40 : 0;
    var duracao = 1400;
    var t0 = null;
    function passo(t) {
      if (t0 === null) t0 = t;
      var x = Math.min((t - t0) / duracao, 1);
      var suave = 1 - Math.pow(1 - x, 3);
      el.textContent = prefixo + Math.round(inicio + (alvo - inicio) * suave);
      if (x < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  // ---------- Vídeo: aviso "em gravação" enquanto o arquivo não existir ----------
  var video = document.getElementById("video-fernando");
  var caixaVideo = video.closest(".video");
  var fonte = video.querySelector("source");
  function semVideo() { caixaVideo.classList.add("sem-video"); }
  fonte.addEventListener("error", semVideo);
  video.addEventListener("error", semVideo);
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) semVideo();

  // ---------- Galeria: espaço reservado enquanto a foto não existir ----------
  var itens = Array.prototype.slice.call(document.querySelectorAll(".foto"));
  itens.forEach(function (item) {
    var img = item.querySelector("img");
    function marcar() { item.classList.add("sem-foto"); item.removeAttribute("tabindex"); }
    img.addEventListener("error", marcar);
    var teste = new Image();
    teste.onerror = marcar;
    teste.src = img.getAttribute("src");
  });

  // ---------- Ampliar fotos (teclado, setas e deslizar no celular) ----------
  var caixa = document.querySelector(".ampliar");
  var imgGrande = caixa.querySelector("img");
  var legenda = caixa.querySelector("figcaption");
  var atual = 0;
  var ultimoFoco = null;

  function fotosDisponiveis() {
    return itens.filter(function (item) { return !item.classList.contains("sem-foto"); });
  }
  function mostrar(indice) {
    var lista = fotosDisponiveis();
    if (!lista.length) return;
    atual = (indice + lista.length) % lista.length;
    var item = lista[atual];
    var img = item.querySelector("img");
    imgGrande.src = img.currentSrc || img.src;
    imgGrande.alt = img.alt;
    legenda.textContent = (atual + 1) + " / " + lista.length + " · " + (item.dataset.legenda || "");
  }
  function abrir(item) {
    var indice = fotosDisponiveis().indexOf(item);
    if (indice < 0) return;
    ultimoFoco = document.activeElement;
    mostrar(indice);
    caixa.hidden = false;
    document.body.style.overflow = "hidden";
    caixa.querySelector(".ampliar__fechar").focus();
  }
  function fechar() {
    caixa.hidden = true;
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  itens.forEach(function (item) {
    item.setAttribute("tabindex", "0");
    item.addEventListener("click", function () { abrir(item); });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(item); }
    });
  });
  caixa.querySelector(".ampliar__fechar").addEventListener("click", fechar);
  caixa.querySelector(".ampliar__seta--ant").addEventListener("click", function () { mostrar(atual - 1); });
  caixa.querySelector(".ampliar__seta--prox").addEventListener("click", function () { mostrar(atual + 1); });
  caixa.addEventListener("click", function (e) { if (e.target === caixa) fechar(); });
  document.addEventListener("keydown", function (e) {
    if (caixa.hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft") mostrar(atual - 1);
    if (e.key === "ArrowRight") mostrar(atual + 1);
  });
  var toqueX = null;
  caixa.addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
  caixa.addEventListener("touchend", function (e) {
    if (toqueX === null) return;
    var dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
    toqueX = null;
  });

  // ---------- Mapa: só carrega quando a pessoa pede ----------
  var botaoMapa = document.querySelector("[data-mapa]");
  if (botaoMapa) {
    botaoMapa.addEventListener("click", function () {
      var quadro = document.createElement("iframe");
      quadro.src = botaoMapa.getAttribute("data-mapa");
      quadro.title = "Mapa da Chácara Divina Luz";
      quadro.loading = "lazy";
      quadro.referrerPolicy = "no-referrer-when-downgrade";
      quadro.allowFullscreen = true;
      botaoMapa.replaceWith(quadro);
    });
  }

  // ---------- Copiar endereço ----------
  function copiar(texto, mensagem) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(function () { avisar(mensagem); }, function () { avisar(texto); });
    } else {
      var campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "absolute";
      campo.style.left = "-9999px";
      document.body.appendChild(campo);
      campo.select();
      try { document.execCommand("copy"); avisar(mensagem); } catch (erro) { avisar(texto); }
      campo.remove();
    }
  }
  document.querySelectorAll("[data-copiar]").forEach(function (botao) {
    botao.addEventListener("click", function () { copiar(botao.getAttribute("data-copiar"), "Endereço copiado"); });
  });

  // ---------- Compartilhar o site ----------
  document.querySelectorAll("[data-compartilhar]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      var dados = {
        title: "Casa de Jesus e Lar de Frei Manuel",
        text: "Conheça a história do Centro de Regeneração Espiritual Casa de Jesus e Lar de Frei Manuel, na Chácara Divina Luz, em Ji-Paraná.",
        url: location.href.split("#")[0]
      };
      if (navigator.share) {
        navigator.share(dados).catch(function () {});
      } else {
        copiar(dados.url, "Link copiado");
      }
    });
  });

  // ---------- Funciona offline depois da primeira visita ----------
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
