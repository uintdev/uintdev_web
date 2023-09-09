# uintdev web

This is the source code of the Node.js application behind bundling assets for the website '[uint.dev](https://uint.dev/)'.

## Setup

### CLI

Bun is used for building. Although, if desired, it can be built under Node.js with package managers such as PNPM or NPM.

```bash
# Install modules (initial setup)
bun install
# (Re)build distribution files from 'src/'
bun run build
```

### Web server

For the web server of your choice, point the document root for the virtual host to the `dist/` directory (or its results) that was created from the build process.

## Licencing

The '[MIT license](LICENSE)' is used for this project.
