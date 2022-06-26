# uintdev web

This is the source code of the Node.js application behind building the website '[uint.dev](https://uint.dev/)'.

## Setup

### CLI

```bash
# Install modules (initial setup)
pnpm install
# (Re)build distribution files from 'src/'
pnpm run build
```

### Web server

For the web server of your choice, point the document root for the virtualhost to the `dist/` directory that was created during the build process.

## Licencing

The '[MIT license](LICENSE)' is used for this project.
<br>
The font 'Quicksand' used is licenced under the '[OFL](src/assets/sass/fonts/OFL.txt)'.
