# uintdev web

This is the source code of the Node.js application behind bundling assets for the website [uint.dev](https://uint.dev/).

This website is hosted using Cloudflare Workers.

## Setup

### CLI

Ideally, PNPM would be used. The usual NPM should work, if that is of preference.

```bash
# Install modules (initial setup)
pnpm install
# (Re)build distribution files from 'src/'
pnpm run build
```

### Web server

For the web server of your choice, point the document root for the virtual host to the `dist/` directory (or its results) that was created from the build process.

## Licensing

The [MIT license](LICENSE) is used for this project. The font is under [Apache 2.0](src/assets/sass/fonts/LICENSE.txt) -- more details can be found [here](https://fonts.google.com/specimen/Roboto+Mono).
