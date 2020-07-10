# uintdev web

This is the source code of the Node.js application behind the website '[uint.dev](https://uint.dev/)'.

## Setup
**Note:**
<br>
By default, the server binds to `127.0.0.1` so that it cannot be accessed directly via the internet or any device on the same network (can only be accessed on the same device). The port is also set to `8080` rather than `80`. These can be changed.
<br>
The reason it is as so is because this was not intended to be used front-facing. Rather, something like Nginx would be in front and acting as a reverse proxy. This is to increase robustness, allow TLS (better than the old 'SSL') and HTTPS without any issues, and take advantage of server-side caching.

### CLI

```bash
npm install # install modules
npm run-script build # (re)build distribution files from 'src/'
npm run-script start # start server
```

## Licencing
The '[MIT license](LICENSE)' is used for this project.
<br>
The Google font '[Roboto](https://fonts.google.com/specimen/Roboto)' used was designed by Christian Robertson and is licenced under the '[Apache License, Version 2.0](src/sass/fonts/LICENSE.txt)'.
