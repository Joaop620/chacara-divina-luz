// Service worker: deixa o site abrir sem internet depois da primeira visita.
// Estratégia "rede primeiro": sempre busca a versão mais nova e só usa a cópia
// guardada quando não há conexão. Assim uma atualização nunca mistura arquivos
// novos com antigos.
const VERSAO = "divina-luz-v4";
const ARQUIVOS = [
  "./",
  "index.html",
  "css/style.css?v=4",
  "js/main.js?v=4",
  "assets/img/favicon.svg",
  "assets/img/samambaia.svg",
  "assets/img/icone-192.png",
  "manifest.webmanifest"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  const url = new URL(pedido.url);
  if (pedido.method !== "GET" || url.origin !== location.origin) return;
  // Vídeo e fotos ficam de fora do cache (são grandes e o vídeo usa pedidos parciais)
  if (/\.(mp4|jpe?g|png|webp)$/i.test(url.pathname) && !url.pathname.includes("/assets/img/")) return;

  evento.respondWith(
    fetch(pedido)
      .then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
        }
        return resposta;
      })
      .catch(() =>
        caches.match(pedido).then((guardado) => guardado || (pedido.mode === "navigate" ? caches.match("index.html") : undefined))
      )
  );
});
