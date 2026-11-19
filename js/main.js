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
  // Só usa a capa se o arquivo existir (evita erro no navegador enquanto ela não chega)
  var capa = video.getAttribute("data-poster");
  if (capa) {
    var testeCapa = new Image();
    testeCapa.onload = function () { video.setAttribute("poster", capa); };
    testeCapa.src = capa;
  }
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

  // ---------- Mapa animado: Brasil > Rondônia > Ji-Paraná ----------
  var mm = document.querySelector(".mm");
  if (mm) {
    var dadosMapa = JSON.parse(mm.getAttribute("data-mapa"));
    var cenas = dadosMapa.cenas;
    var afim = dadosMapa.afim;       // converte coordenada do desenho em longitude/latitude
    var unidadesPorKm = dadosMapa.upk;
    var svgMapa = mm.querySelector(".mm__svg");
    var palco = mm.querySelector(".mm__palco");
    var alvo = mm.querySelector(".mm__alvo");
    var veiculo = mm.querySelector("#mm-veiculo");
    var viajantes = mm.querySelectorAll(".mm__viajante animateMotion");
    var botoesPasso = Array.prototype.slice.call(mm.querySelectorAll("[data-ir]"));
    var cartaoLink = mm.querySelector(".mm__cartao-link");
    var hudNum = mm.querySelector(".mm__hud-num");
    var hudNome = mm.querySelector(".mm__hud-nome");
    var hudCoord = mm.querySelector(".mm__hud-coord");
    var barraEscala = mm.querySelector(".mm__escala-barra");
    var textoEscala = mm.querySelector(".mm__escala-txt");
    var alvoX = dadosMapa.alvo[0], alvoY = dadosMapa.alvo[1];
    var nomesCena = { 1: "Brasil", 2: "Rondônia", 3: "Ji-Paraná" };
    var duracaoCena = { 1: 3400, 2: 6600, 3: 0 };

    if (window.matchMedia("(max-width: 760px)").matches) {
      // No celular a tela é vertical: enquadra o eixo da BR-364 e deixa Ji-Paraná no terço de cima
      cenas["2"] = [1600, 3700, 1420, 1500];
      cenas["3"] = [alvoX - 46, alvoY - 48, 124, 150];
    }

    var caixaAtual = cenas["1"].slice();
    var animacao = null;
    var roteiro = [];

    function grausParaTexto(valor, pos, neg) {
      var abs = Math.abs(valor);
      var g = Math.floor(abs);
      var m = Math.round((abs - g) * 60);
      if (m === 60) { g += 1; m = 0; }
      return g + "°" + (m < 10 ? "0" : "") + m + "′" + (valor < 0 ? neg : pos);
    }
    function atualizarHud(caixa) {
      var cx = caixa[0] + caixa[2] / 2, cy = caixa[1] + caixa[3] / 2;
      var lon = afim[0] * cx + afim[1] * cy + afim[2];
      var lat = afim[3] * cx + afim[4] * cy + afim[5];
      hudCoord.textContent = grausParaTexto(lat, "N", "S") + "  " + grausParaTexto(lon, "L", "O");
      // Escala: escolhe um valor redondo que dê uma barra entre 60 e 140 px
      var largura = palco.clientWidth, altura = palco.clientHeight;
      var pxPorUnidade = Math.min(largura / caixa[2], altura / caixa[3]);
      var pxPorKm = pxPorUnidade * unidadesPorKm;
      var opcoes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      var km = opcoes[opcoes.length - 1];
      for (var i = 0; i < opcoes.length; i++) { if (opcoes[i] * pxPorKm >= 60) { km = opcoes[i]; break; } }
      barraEscala.style.width = Math.round(km * pxPorKm) + "px";
      textoEscala.textContent = km.toLocaleString("pt-BR") + " km";
    }
    function desenhar(caixa) {
      svgMapa.setAttribute("viewBox", caixa.map(function (v) { return v.toFixed(2); }).join(" "));
      // O marcador mantém o mesmo tamanho na tela em qualquer zoom
      var k = Math.max(caixa[2] / 300, 1);
      alvo.setAttribute("transform", "translate(" + alvoX + " " + alvoY + ") scale(" + k.toFixed(3) + ")");
      atualizarHud(caixa);
    }
    function voarPara(destino, duracao, aoTerminar) {
      cancelAnimationFrame(animacao);
      var inicio = caixaAtual.slice();
      if (reduzirMovimento || !duracao) {
        caixaAtual = destino.slice(); desenhar(caixaAtual);
        if (aoTerminar) aoTerminar();
        return;
      }
      var t0 = null;
      // Zoom em escala logarítmica e centro acompanhando o zoom: sensação de câmera de verdade
      var w0 = Math.log(inicio[2]), w1 = Math.log(destino[2]);
      var c0 = [inicio[0] + inicio[2] / 2, inicio[1] + inicio[3] / 2];
      var c1 = [destino[0] + destino[2] / 2, destino[1] + destino[3] / 2];
      var r0 = inicio[3] / inicio[2], r1 = destino[3] / destino[2];
      mm.classList.add("voando");
      function passo(t) {
        if (t0 === null) t0 = t;
        var x = Math.min((t - t0) / duracao, 1);
        var e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        var ez = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        var w = Math.exp(w0 + (w1 - w0) * ez);
        var h = w * (r0 + (r1 - r0) * e);
        var cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
        caixaAtual = [cx - w / 2, cy - h / 2, w, h];
        desenhar(caixaAtual);
        if (x > 0.72) mm.classList.remove("voando");
        if (x < 1) { animacao = requestAnimationFrame(passo); }
        else if (aoTerminar) { aoTerminar(); }
      }
      animacao = requestAnimationFrame(passo);
    }
    function trocarTitulo(cena) {
      hudNum.textContent = "0" + cena;
      hudNome.textContent = nomesCena[cena];
      hudNome.classList.remove("troca");
      void hudNome.offsetWidth;
      hudNome.classList.add("troca");
    }
    var progressoAtual = 0;
    function marcarPassos(cena, comProgresso) {
      var vez = ++progressoAtual;
      botoesPasso.forEach(function (b) {
        var n = parseInt(b.getAttribute("data-ir"), 10);
        b.classList.toggle("ativo", n === cena);
        b.style.setProperty("--progresso", n < cena || (n === cena && !comProgresso) ? 1 : 0);
        if (n === cena && comProgresso && duracaoCena[cena]) {
          // A linha do passo enche durante o tempo da etapa
          var t0 = null, dur = duracaoCena[cena];
          var passo = function (t) {
            if (vez !== progressoAtual) return;
            if (t0 === null) t0 = t;
            var x = Math.min((t - t0) / dur, 1);
            b.style.setProperty("--progresso", x.toFixed(3));
            if (x < 1) requestAnimationFrame(passo);
          };
          requestAnimationFrame(passo);
        }
      });
    }
    function irPara(cena, duracao, comProgresso) {
      mm.setAttribute("data-cena", String(cena));
      if (cena === 1) {
        mm.classList.add("iniciado");
        setTimeout(function () { mm.classList.add("elevado"); }, duracao ? 300 : 1500);
      } else {
        mm.classList.add("iniciado", "elevado");
      }
      trocarTitulo(cena);
      marcarPassos(cena, comProgresso);
      cartaoLink.tabIndex = cena === 3 ? 0 : -1;
      voarPara(cenas[String(cena)], duracao === undefined ? 2200 : duracao, function () {
        if (cena === 2) {
          try { veiculo.beginElement(); } catch (e) {}
          viajantes.forEach(function (v) { try { v.beginElement(); } catch (e) {} });
        }
      });
    }
    function limparRoteiro() { roteiro.forEach(clearTimeout); roteiro = []; }
    function tocar() {
      limparRoteiro();
      mm.classList.remove("iniciado", "elevado", "voando");
      mm.setAttribute("data-cena", "0");
      caixaAtual = cenas["1"].slice();
      desenhar(caixaAtual);
      void mm.offsetWidth;
      irPara(1, 0, true);
      roteiro.push(setTimeout(function () { irPara(2, 2400, true); }, duracaoCena[1]));
      roteiro.push(setTimeout(function () { irPara(3, 2800, false); }, duracaoCena[1] + duracaoCena[2]));
    }
    botoesPasso.forEach(function (b) {
      b.addEventListener("click", function () { limparRoteiro(); irPara(parseInt(b.getAttribute("data-ir"), 10), 2200, false); });
    });
    mm.querySelector("[data-repetir]").addEventListener("click", tocar);
    window.addEventListener("resize", function () { atualizarHud(caixaAtual); });

    desenhar(caixaAtual);
    if ("IntersectionObserver" in window && !reduzirMovimento) {
      var vigia = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) { vigia.disconnect(); tocar(); }
      }, { threshold: 0.45 });
      vigia.observe(mm);
    } else {
      irPara(3, 0, false);
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
