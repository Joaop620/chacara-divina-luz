// Chave de acesso do site.
// O site fica fechado por padrão. Só entra quem digitar a senha da Irmandade.
// Variáveis na Vercel (Settings > Environment Variables):
//   SITE_ABERTO     = "nao" (fechado, pede senha) ou "sim" (aberto a todos)
//   SENHA_IRMANDADE = a senha de acesso
// Depois de mudar uma variável, é preciso fazer um novo deploy (Redeploy).

export const config = {
  matcher: "/(.*)",
};

const COOKIE = "acesso_divina_luz";

async function hash(texto) {
  const dados = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(resumo)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function lerCookie(request, nome) {
  const cabecalho = request.headers.get("cookie") || "";
  const par = cabecalho.split(/;\s*/).find((c) => c.startsWith(nome + "="));
  return par ? decodeURIComponent(par.slice(nome.length + 1)) : "";
}

function paginaFechada(erro) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Acesso restrito</title>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<style>
  *{box-sizing:border-box;margin:0}
  body{min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#22342a;color:#ebe7d9;font-family:Georgia,serif}
  main{width:100%;max-width:24rem;text-align:center}
  .sol{width:4rem;height:4rem;border-radius:50%;background:#d6a23e;margin:0 auto 2rem}
  h1{font-family:system-ui,sans-serif;font-weight:600;font-size:1.6rem;line-height:1.2;margin-bottom:.75rem}
  p{color:rgba(235,231,217,.75);line-height:1.5;margin-bottom:2rem}
  input,button{width:100%;padding:.9rem 1rem;font:inherit;font-size:1rem;border:1px solid rgba(235,231,217,.4)}
  input{background:transparent;color:#ebe7d9;margin-bottom:.75rem;text-align:center}
  button{background:#d6a23e;color:#22342a;border-color:#d6a23e;font-family:system-ui,sans-serif;font-weight:600;cursor:pointer}
  .erro{color:#f0b36a;font-size:.9rem;margin:-.25rem 0 1rem}
</style></head><body><main>
  <div class="sol"></div>
  <h1>Casa de Jesus e Lar de Frei Manuel</h1>
  <p>Este espaço é reservado à Irmandade. Digite a senha para entrar.</p>
  <form method="POST" action="/__entrar">
    <input type="password" name="senha" placeholder="Senha" autocomplete="current-password" required autofocus>
    ${erro ? '<p class="erro">Senha incorreta.</p>' : ""}
    <button type="submit">Entrar</button>
  </form>
</main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

export default async function middleware(request) {
  if ((process.env.SITE_ABERTO || "nao").toLowerCase() === "sim") return;

  const senha = process.env.SENHA_IRMANDADE || "";
  const url = new URL(request.url);
  // Sem senha configurada, o site fica trancado para todos
  const esperado = senha ? await hash("divina-luz:" + senha) : "";

  if (url.pathname === "/__entrar" && request.method === "POST") {
    const form = await request.formData();
    const digitada = String(form.get("senha") || "");
    if (senha && digitada === senha) {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/",
          "set-cookie": `${COOKIE}=${esperado}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }
    return paginaFechada(true);
  }

  if (esperado && lerCookie(request, COOKIE) === esperado) return;

  // Deixa só o ícone passar, para a página de senha ficar bonita
  if (url.pathname === "/assets/img/favicon.svg") return;

  return paginaFechada(false);
}
