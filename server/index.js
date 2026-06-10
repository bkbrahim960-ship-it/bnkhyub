// Load environment configuration
const { loadEnvConfig, config } = require('./config/env');
const nodeEnv = loadEnvConfig();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

// Catch unhandled errors
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    console.error(err.stack);
    // Don't exit in dev
    // if (config.isProd) process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    console.error(err.stack);
    // Don't exit in dev
    // if (config.isProd) process.exit(1);
});

const app = express();
const PORT = config.PORT;

// Trust proxy - MUST be set when behind nginx/reverse proxy
// Fixes: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// Swagger setup (only in development or if explicitly enabled)
let swaggerUi, specs;
console.log(`🔍 ENABLE_SWAGGER value: ${config.ENABLE_SWAGGER}`);
if (config.ENABLE_SWAGGER) {
    try {
        const swagger = require('./swagger');
        swaggerUi = swagger.swaggerUi;
        specs = swagger.specs;
        console.log(`✅ Swagger loaded: swaggerUi=${!!swaggerUi}, specs=${!!specs}`);
    } catch(err) {
        console.error('❌ Swagger failed to load:', err.message);
    }
} else {
    console.log('⚠️ Swagger is disabled');
}

// CORS - must be before other middleware
const corsOrigins = config.getCorsOrigins();
app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Compression for faster responses
app.use(compression());

// Rate limiting - configurable per environment
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW,
    max: config.RATE_LIMIT_MAX,
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '1 second'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
app.use(limiter);

// Logging - always enabled
app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));

// Request logger - log every request with details
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`📥 ${req.method} ${req.url} from ${req.ip}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
        console.log(`${statusIcon} ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

console.log(`🌍 Environment: ${config.NODE_ENV}`);
console.log(`📊 Rate Limit: ${config.RATE_LIMIT_MAX} req/${config.RATE_LIMIT_WINDOW}ms`);
console.log(`🔗 CORS Origin: ${typeof corsOrigins === 'string' ? corsOrigins : corsOrigins.join(', ')}`);

app.use(bodyParser.urlencoded({ extended: false }));
const path = require('path');

app.use(bodyParser.json({ limit: '10kb' })); // Limit body size

// Dynamic sitemap - must be before static files middleware
require('./controllers/seoController')(app);

// Serve static files (UI)
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
if (swaggerUi && specs) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'FIFA World Cup 2026 API Documentation'
    }));
    console.log('📚 Swagger UI available at /api-docs');
} else {
    console.log('⚠️ Swagger NOT mounted! swaggerUi:', !!swaggerUi, 'specs:', !!specs);
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns API welcome message
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to FIFA World Cup 2026 API
 */
// Serve UI for root path - with server-side language detection for SEO
const fs = require('fs');
app.get('/', (req, res) => {
    const lang = req.query.lang;
    if (lang === 'en') {
        try {
            let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
            html = html
                .replace('<html lang="fa" dir="rtl">', '<html lang="en" dir="ltr">')
                .replace(
                    /<title[^>]*>.*?<\/title>/,
                    '<title id="page-title">FIFA World Cup 2026 | Live Scores, Schedule, Free API &amp; Group Standings</title>'
                )
                .replace(
                    /<meta name="description"[^>]*>/,
                    '<meta name="description" id="meta-description" content="FIFA World Cup 2026 live scores, match schedule &amp; free REST API. Track 48 teams, 104 matches in real-time. Free World Cup data API \u2014 groups, standings, fixtures, teams. USA, Canada &amp; Mexico.">'
                )
                .replace(
                    /<meta name="keywords"[^>]*>/,
                    '<meta name="keywords" id="meta-keywords" content="FIFA World Cup 2026, World Cup 2026 schedule, World Cup 2026 live score, World Cup 2026 live results, World Cup 2026 groups, World Cup 2026 standings, World Cup 2026 fixtures, World Cup 2026 teams, free football API, free soccer API, World Cup API free, FIFA 2026 API, live score API, free sports API, football data API, sports API 2026, World Cup 2026 bracket, WC2026, soccer 2026, football 2026, 2026 World Cup">'
                )
                .replace(
                    /<meta property="og:title"[^>]*>/,
                    '<meta property="og:title" id="og-title" content="FIFA World Cup 2026 | Live Scores, Schedule, Free API &amp; Group Standings">'
                )
                .replace(
                    /<meta property="og:description"[^>]*>/,
                    '<meta property="og:description" id="og-description" content="FIFA World Cup 2026 live scores, match schedule &amp; free REST API. Track 48 teams, 104 matches in real-time. USA, Canada &amp; Mexico.">'
                )
                .replace(
                    /<meta property="og:locale" content="fa_IR">/,
                    '<meta property="og:locale" content="en_US">'
                )
                .replace(
                    /<meta name="twitter:title"[^>]*>/,
                    '<meta name="twitter:title" id="twitter-title" content="FIFA World Cup 2026 | Live Scores, Schedule, Free API &amp; Group Standings">'
                )
                .replace(
                    /<meta name="twitter:description"[^>]*>/,
                    '<meta name="twitter:description" id="twitter-description" content="FIFA World Cup 2026 live scores, match schedule &amp; free REST API. Track 48 teams, 104 matches in real-time.">'
                )
                .replace(
                    /<link rel="canonical"[^>]*>/,
                    '<link rel="canonical" href="https://worldcup26.ir/?lang=en">'
                );
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=300');
            return res.send(html);
        } catch (err) {
            console.error('Error serving English HTML:', err.message);
        }
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// KoraLive proxy route — for live match streaming in production
const axios = require('axios');
app.get('/api/koralive', async (req, res) => {
  try {
    const { detail } = req.query;
    const KORALIVE_URL = 'https://www.koralive-hd.com';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      Accept: 'text/html',
    };

    if (detail) {
      const detailUrl = detail.startsWith('http') ? detail : `${KORALIVE_URL}${detail}`;
      const resp = await axios.get(detailUrl, { headers, timeout: 12000 });
      const html = resp.data;
      const iframes = [];
      const serverUrls = [];
      let m;
      const srcRe = /<iframe[^>]*src=["']([^"']+)["']/gi;
      while ((m = srcRe.exec(html)) !== null) {
        const src = m[1];
        if (src && !src.includes('koralive-hd') && !src.includes('/matches/')) iframes.push(src);
      }
      const dataRe = /data-(?:link|url|embed|stream)=["']([^"']+)["']/gi;
      while ((m = dataRe.exec(html)) !== null) {
        const val = m[1];
        if (val && (val.startsWith('http') || val.startsWith('//')) && !val.includes('koralive-hd')) iframes.push(val.startsWith('//') ? `https:${val}` : val);
      }
      const btnRe = /server-btn["'\s][^>]*data-(?:link|url|embed|stream)=["']([^"']+)["']/gi;
      while ((m = btnRe.exec(html)) !== null) {
        const val = m[1];
        if (val && (val.startsWith('http') || val.startsWith('//'))) serverUrls.push(val.startsWith('//') ? `https:${val}` : val);
      }
      return res.json({ iframes: [...new Set(iframes)], servers: [...new Set(serverUrls)] });
    }

    const resp = await axios.get(`${KORALIVE_URL}/matches-today/`, { headers, timeout: 12000 });
    const bodyMatch = resp.data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    res.json({ html: bodyContent });
  } catch (err) {
    console.error('koralive proxy error:', err.message);
    res.status(502).json({ error: err.message, html: '' });
  }
});

require('./controllers/index')(app);

app.use((req, res, next) => {
    console.log(`⚠️ 404 Not Found: ${req.method} ${req.url} from ${req.ip}`);
    const erro = new Error('Route not found');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    console.error(`❌ Error ${error.status || 500}: ${error.message} | ${req.method} ${req.url}`);
    if (error.stack) console.error(error.stack);
    res.status(error.status || 500);
    return res.send({
        error: {
            message: error.message
        }
    })
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
