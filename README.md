# uintdev web

This is the source code of the Node.js application behind bundling assets for the website '[uint.dev](https://uint.dev/)'.

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

## Licencing

The '[MIT license](LICENSE)' is used for this project.
<br>
The font 'Quicksand' used is licenced under '[OFL](src/assets/sass/fonts/OFL.txt)'.
