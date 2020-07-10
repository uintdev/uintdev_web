import path from 'path'
import express from 'express'

const app = express(),
    DIST_DIR = __dirname,
    HTML_FILE = path.join(DIST_DIR, 'index.html'),
    JS_FILE = path.join(DIST_DIR, 'main.js');

app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

app.use(express.static(DIST_DIR));

app.get('/*', (req, res) => {
    res.sendFile(HTML_FILE, function (err) {
        if (err) {
            // If the dist directory is missing or missing the main HTML file, give fallback response
            res.status(503).send('Site is currently updating.');
        }
    })
})

// The IP address is specifically binded to 127.0.0.1 (preventing network access)
// and uses 8080 because this was intended to be used with a reverse proxy (i.e. Nginx)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`App listening to ${PORT}....`);
    console.log('Press Ctrl+C to quit.');
})
