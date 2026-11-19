// Chácara Divina Luz: interações do site

(function () {
  "use strict";

  // Topo muda de fundo ao rolar
  var topo = document.getElementById("topo");
  function aoRolar() {
    topo.classList.toggle("rolou", window.scrollY > window.innerHeight * 0.7);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  // Paisagem: no celular, enquadra a casa e o sol
  var paisagem = document.querySelector(".paisagem");
  var celular = window.matchMedia("(max-width: 760px)");
  function enquadrar() {
    paisagem.setAttribute("viewBox", celular.matches ? "610 90 580 330" : "0 0 1440 420");
  }
  if (paisagem) {
    enquadrar();
    if (celular.addEventListener) celular.addEventListener("change", enquadrar);
  }

  // Menu no celular
  var botaoMenu = document.querySelector(".menu-botao");
  var menu = document.getElementById("menu");
  function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  }
  botaoMenu.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
  });

  // Entrada suave das seções
  var revelar = document.querySelectorAll(".revela");
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revelar.forEach(function (el) { observador.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add("visivel"); });
  }

  // Vídeo: mostra o aviso "em produção" enquanto o arquivo não existir
  var video = document.getElementById("video-fernando");
  var caixaVideo = video.closest(".video");
  var fonte = video.querySelector("source");
  function semVideo() { caixaVideo.classList.add("sem-video"); }
  fonte.addEventListener("error", semVideo);
  video.addEventListener("error", semVideo);
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) semVideo();

  // Galeria: espaço reservado enquanto a foto não existir
  var itens = Array.prototype.slice.call(document.querySelectorAll(".foto"));
  itens.forEach(function (item) {
    var img = item.querySelector("img");
    function marcar() { item.classList.add("sem-foto"); }
    img.addEventListener("error", marcar);
    // Testa o arquivo mesmo antes do carregamento preguiçoso da imagem
    var teste = new Image();
    teste.onerror = marcar;
    teste.src = img.getAttribute("src");
  });

  // Ampliar fotos
  var caixa = document.querySelector(".ampliar");
  var imgGrande = caixa.querySelector("img");
  var legenda = caixa.querySelector("figcaption");
  var atual = 0;

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
    legenda.textContent = item.dataset.legenda || "";
  }
  function abrir(item) {
    var lista = fotosDisponiveis();
    var indice = lista.indexOf(item);
    if (indice < 0) return;
    mostrar(indice);
    caixa.hidden = false;
    document.body.style.overflow = "hidden";
    caixa.querySelector(".ampliar__fechar").focus();
  }
  function fechar() {
    caixa.hidden = true;
    document.body.style.overflow = "";
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
})();
