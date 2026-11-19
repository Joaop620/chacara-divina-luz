# Casa de Jesus e Lar de Frei Manuel · Chácara Divina Luz

Site: https://chacara-divina-luz.vercel.app

Site institucional do Centro de Regeneração Espiritual Casa de Jesus e Lar de Frei Manuel, que funciona na Chácara Divina Luz, em Ji-Paraná (RO).

O site faz parte do Projeto de Extensão **Culturas, Memórias e Diversidades**, do curso de Análise e Desenvolvimento de Sistemas da Universidade Anhembi Morumbi (2026). Foi feito por João Paulo Crestani Ferreira em parceria com a comunidade.

## Estrutura

```
chacara-divina-luz/
├── index.html            Página única com todas as seções
├── css/style.css         Estilos
├── js/main.js            Menu, animações, vídeo e galeria de fotos
├── assets/
│   ├── video/            fernando.mp4 e capa.jpg
│   ├── fotos/            foto-1.jpg até foto-6.jpg
│   └── img/              favicon e imagem de compartilhamento
└── vercel.json           Configuração de cache para a Vercel
```

É um site estático, sem dependências e sem etapa de build. Basta abrir o `index.html` no navegador.

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

Salve uma foto de 1200 x 630 px como `assets/img/compartilhamento.jpg`. Ela aparece quando o link é enviado no WhatsApp ou nas redes.

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
