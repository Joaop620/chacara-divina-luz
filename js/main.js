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

  // ---------- Vídeo: só age se houver um <video> na página ----------
  var video = document.getElementById("video-fernando");
  if (video) {
    var caixaVideo = video.closest(".video");
    var fonte = video.querySelector("source");
    var semVideo = function () { caixaVideo.classList.add("sem-video"); };
    if (fonte) fonte.addEventListener("error", semVideo);
    video.addEventListener("error", semVideo);
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) semVideo();
  }

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

  // ---------- Mapa animado: Brasil > Rondônia > Ji-Paraná ----------
  var mm = document.querySelector(".mm");
  if (mm) {
    var svgMapa = mm.querySelector(".mm__svg");
    var cenas = JSON.parse(mm.getAttribute("data-cenas"));
    var alvoBase = mm.querySelector(".mm__alvo").getAttribute("transform").match(/translate\(([\d.]+) ([\d.]+)/);
    if (window.matchMedia("(max-width: 760px)").matches) {
      // No celular a tela é vertical: enquadra só o eixo da BR-364 e deixa Ji-Paraná no terço de cima
      var jx = parseFloat(alvoBase[1]), jy = parseFloat(alvoBase[2]);
      cenas["2"] = [1600, 3790, 1420, 1420];
      cenas["3"] = [jx - 46, jy - 48, 124, 150];
    }
    var alvo = mm.querySelector(".mm__alvo");
    var nome = mm.querySelector(".mm__nome");
    var viajantes = mm.querySelectorAll(".mm__viajante animateMotion");
    var botoesPasso = mm.querySelectorAll("[data-ir]");
    var cartaoLink = mm.querySelector(".mm__cartao-link");
    var alvoX = parseFloat(alvo.getAttribute("transform").match(/translate\(([\d.]+)/)[1]);
    var alvoY = parseFloat(alvo.getAttribute("transform").match(/translate\([\d.]+ ([\d.]+)/)[1]);
    var caixaAtual = cenas["1"].slice();
    var animacao = null;
    var roteiro = [];
    var cenaAtual = 0;

    function desenhar(caixa) {
      svgMapa.setAttribute("viewBox", caixa.map(function (v) { return v.toFixed(2); }).join(" "));
      // O marcador mantém o mesmo tamanho na tela em qualquer zoom
      var k = Math.max(caixa[2] / 300, 1);
      alvo.setAttribute("transform", "translate(" + alvoX + " " + alvoY + ") scale(" + k.toFixed(3) + ")");
    }
    function voarPara(destino, duracao) {
      cancelAnimationFrame(animacao);
      var inicio = caixaAtual.slice();
      if (reduzirMovimento || !duracao) { caixaAtual = destino.slice(); desenhar(caixaAtual); return; }
      var t0 = null;
      // Interpola o zoom em escala logarítmica, que dá a sensação de câmera
      var w0 = Math.log(inicio[2]), w1 = Math.log(destino[2]);
      var c0 = [inicio[0] + inicio[2] / 2, inicio[1] + inicio[3] / 2];
      var c1 = [destino[0] + destino[2] / 2, destino[1] + destino[3] / 2];
      var razao = destino[3] / destino[2], razao0 = inicio[3] / inicio[2];
      function passo(t) {
        if (t0 === null) t0 = t;
        var x = Math.min((t - t0) / duracao, 1);
        var e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        var w = Math.exp(w0 + (w1 - w0) * e);
        var r = razao0 + (razao - razao0) * e;
        var h = w * r;
        var cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
        caixaAtual = [cx - w / 2, cy - h / 2, w, h];
        desenhar(caixaAtual);
        if (x < 1) animacao = requestAnimationFrame(passo);
      }
      animacao = requestAnimationFrame(passo);
    }
    function irPara(cena, duracao) {
      cenaAtual = cena;
      mm.setAttribute("data-cena", String(cena));
      voarPara(cenas[String(cena)], duracao === undefined ? 1900 : duracao);
      botoesPasso.forEach(function (b) { b.classList.toggle("ativo", b.getAttribute("data-ir") === String(cena)); });
      cartaoLink.tabIndex = cena === 3 ? 0 : -1;
      if (cena === 2) viajantes.forEach(function (v) { try { v.beginElement(); } catch (e) {} });
    }
    function limparRoteiro() { roteiro.forEach(clearTimeout); roteiro = []; }
    function tocar() {
      limparRoteiro();
      caixaAtual = cenas["1"].slice();
      desenhar(caixaAtual);
      irPara(1, 0);
      roteiro.push(setTimeout(function () { irPara(2); }, 2200));
      roteiro.push(setTimeout(function () { irPara(3, 2300); }, 7600));
    }
    botoesPasso.forEach(function (b) {
      b.addEventListener("click", function () { limparRoteiro(); irPara(parseInt(b.getAttribute("data-ir"), 10)); });
    });
    mm.querySelector("[data-repetir]").addEventListener("click", tocar);

    desenhar(caixaAtual);
    if ("IntersectionObserver" in window) {
      var vigia = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) { vigia.disconnect(); tocar(); }
      }, { threshold: 0.45 });
      vigia.observe(mm);
    } else {
      irPara(3, 0);
    }
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
