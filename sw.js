// Service worker: guarda o site no aparelho para abrir rápido e funcionar sem internet.
// Troque a versão sempre que mudar arquivos importantes.
const VERSAO = "divina-luz-v2";
const ARQUIVOS = [
  "./",
  "index.html",
  "css/style.css",
  "js/main.js",
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
  if (pedido.method !== "GET" || new URL(pedido.url).origin !== location.origin) return;
  // Vídeo fica de fora do cache (é grande e usa pedidos parciais)
  if (pedido.url.endsWith(".mp4")) return;

  // Página: tenta a rede primeiro para sempre mostrar a versão mais nova
  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
          return resposta;
        })
        .catch(() => caches.match(pedido).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  // Demais arquivos: usa o que está guardado e atualiza em segundo plano
  evento.respondWith(
    caches.match(pedido).then((guardado) => {
      const daRede = fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
          }
          return resposta;
        })
        .catch(() => guardado);
      return guardado || daRede;
    })
  );
});
