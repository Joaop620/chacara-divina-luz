# Casa de Jesus e Lar de Frei Manuel · Chácara Divina Luz

Site: https://chacara-divina-luz.vercel.app

Site institucional do Centro de Regeneração Espiritual Casa de Jesus e Lar de Frei Manuel, que funciona na Chácara Divina Luz, em Ji-Paraná (RO).

O site faz parte do Projeto de Extensão **Culturas, Memórias e Diversidades**, do curso de Análise e Desenvolvimento de Sistemas da Universidade Anhembi Morumbi (2026). Foi feito por João Paulo Crestani Ferreira em parceria com a comunidade.

## Estrutura

```
chacara-divina-luz/
├── index.html            Página única com todas as seções
├── css/style.css         Estilos
├── js/main.js            Interações do site
├── sw.js                 Service worker (site abre sem internet depois da 1ª visita)
├── manifest.webmanifest  Permite instalar o site no celular como aplicativo
├── assets/
│   ├── video/            fernando.mp4 e capa.jpg
│   ├── fotos/            foto-1.jpg até foto-6.jpg
│   └── img/              favicon, ícones, samambaia e imagem de compartilhamento
└── vercel.json           Cabeçalhos de cache e segurança para a Vercel
```

É um site estático, sem dependências e sem etapa de build. Para testar no computador, rode `python3 -m http.server` dentro da pasta e abra http://localhost:8000.

## Funcionalidades

- Barra de progresso da leitura e destaque do capítulo atual no menu
- Números da comunidade que contam ao aparecer na tela
- Mapa animado feito em SVG, sem serviço externo: começa no Brasil, aproxima em Rondônia (BR-364, Rio Machado e as cidades de onde vêm as famílias) e termina em Ji-Paraná com o cartão do endereço. Tem etapas clicáveis e botão para ver de novo. O contorno dos estados vem do pacote @highcharts/map-collection e as cidades foram posicionadas pelas coordenadas reais
- Botões para traçar rota e copiar o endereço
- Galeria com ampliação, navegação pelo teclado e deslizar com o dedo no celular
- Funciona sem internet depois da primeira visita e pode ser instalado na tela inicial do celular (PWA)
- Dados estruturados (schema.org) para o Google entender que é um centro religioso, com endereço e data de fundação
- Imagem própria para quando o link é enviado no WhatsApp e nas redes
- Respeita quem prefere menos movimento na tela (prefers-reduced-motion)

## Como colocar o vídeo e as fotos

**Vídeo do Fernando**

1. Exporte o vídeo em MP4 (H.264), 1080p, de preferência com menos de 50 MB.
2. Salve como `assets/video/fernando.mp4`.
3. Opcional: salve um quadro do vídeo como `assets/video/capa.jpg` para servir de capa.

O quadro do vídeo é vertical (4:5), pensado para gravação com o celular em pé, mas aceita qualquer formato. Enquanto o arquivo não existir, o site mostra o aviso "Em gravação".

**Fotos da Chácara**

1. Salve as fotos como `assets/fotos/foto-1.jpg` até `foto-6.jpg`. O ideal é ter até 1600 px de largura e menos de 400 KB cada.
2. Formatos: foto 1 horizontal (4:3), foto 2 vertical (3:4), foto 3 quadrada, foto 4 horizontal (5:4), foto 5 horizontal (3:2) e foto 6 panorâmica (16:9).
3. No `index.html`, ajuste o texto de `data-legenda`, `alt` e `figcaption` de cada foto.

Enquanto a foto não existir, o espaço aparece hachurado com o aviso "Foto a caminho".

**Imagem de compartilhamento**

Já existe uma em `assets/img/compartilhamento.jpg` (1200 x 630 px). Se quiser trocar por uma foto da Chácara, salve com o mesmo nome e tamanho.

## Quando mudar arquivos

Ao alterar CSS ou JavaScript, aumente o número `?v=` nos links do `index.html` (`css/style.css?v=8`, `js/main.js?v=8`) e a versão em `sw.js`. O service worker busca sempre a rede primeiro e só usa a cópia guardada quando não há internet, então quem já visitou o site recebe a versão nova sem misturar arquivos.

## Chave de acesso

O site fica fechado por padrão. Quem abre o link vê uma página pedindo a senha da Irmandade, e só depois de digitá-la entra no site (o acesso fica lembrado no aparelho por 30 dias).

A chave fica em duas variáveis de ambiente na Vercel (Settings > Environment Variables):

| Variável | Valor | Efeito |
| --- | --- | --- |
| `SITE_ABERTO` | `nao` | Site fechado, pede senha |
| `SITE_ABERTO` | `sim` | Site aberto a todos (por exemplo, para divulgar um evento) |
| `SENHA_IRMANDADE` | a senha | Senha usada na página de acesso |

Depois de mudar qualquer uma delas, é preciso fazer um Redeploy em Deployments. A lógica fica em `middleware.js`. A senha nunca vai para o GitHub.

## Antes de publicar

- O Fernando precisa revisar e aprovar todo o conteúdo.
- Só use fotos e vídeos de pessoas que assinaram o termo de autorização de uso de imagem e voz.
- Nenhum hino pode aparecer, nem como áudio de fundo do vídeo.
- O site está com `noindex` para não aparecer no Google. Depois da aprovação, apague a linha `<meta name="robots" content="noindex, nofollow">` do `index.html` e o bloco `X-Robots-Tag` do `vercel.json`.

## Como subir para o GitHub

O repositório já vem com os commits feitos. Crie um repositório vazio chamado `chacara-divina-luz` no GitHub, sem README, e rode:

```bash
cd chacara-divina-luz
git remote add origin https://github.com/Joaop620/chacara-divina-luz.git
git branch -M main
git push -u origin main
```

## Como publicar na Vercel

1. Entre em vercel.com, clique em **Add New > Project** e importe o repositório `chacara-divina-luz`.
2. Em **Framework Preset**, deixe **Other**. Não precisa de comando de build.
3. Clique em **Deploy**.

A cada `git push` na branch `main`, a Vercel publica a nova versão sozinha.

## Licença

O conteúdo (textos, fotos e vídeo) pertence ao Centro de Regeneração Espiritual Casa de Jesus e Lar de Frei Manuel e não pode ser reutilizado sem autorização.
