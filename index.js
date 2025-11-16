// API Its Real - Optimizado para Render.com
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Sistema de precios Its Real
const PRECIO_RANGOS = {
  '1-2': { min: 400000, max: 600000, disenoHrs: '1hr', sesionHrs: '1-2hrs' },
  '3-4': { min: 600000, max: 900000, disenoHrs: '1.5-2hrs', sesionHrs: '2-3hrs' },
  '5-6': { min: 900000, max: 1200000, disenoHrs: '2-3hrs', sesionHrs: '3-4hrs' },
  '7-8': { min: 1200000, max: 1500000, disenoHrs: '3-4hrs', sesionHrs: '4-5hrs' },
  '9+': { min: 1500000, max: 2000000, disenoHrs: '4-5hrs', sesionHrs: '5-6hrs+' }
};

function calcularPuntos(datos) {
  return parseInt(datos.puntos_tamano || 0) + 
         parseInt(datos.puntos_zona || 0) + 
         parseInt(datos.puntos_estilo || 0) + 
         parseInt(datos.puntos_claridad || 0);
}

function obtenerRangoPrecio(puntos) {
  if (puntos <= 2) return '1-2';
  if (puntos <= 4) return '3-4';
  if (puntos <= 6) return '5-6';
  if (puntos <= 8) return '7-8';
  return '9+';
}

function formatearPrecio(numero) {
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Endpoint principal
app.post('/cotizar', (req, res) => {
  try {
    const datos = req.body;
    const puntosTotal = calcularPuntos(datos);
    const rangoKey = obtenerRangoPrecio(puntosTotal);
    const rango = PRECIO_RANGOS[rangoKey];
    const zonaSensible = datos.zona_sensible === 'si';
    
    let precioMin = rango.min;
    let precioMax = rango.max;
    
    if (zonaSensible) {
      precioMin = Math.round(precioMin * 1.2);
      precioMax = Math.round(precioMax * 1.2);
    }
    
    const quiereAsesoria = datos.quiere_asesoria === 'si';
    
    res.json({
      puntos: puntosTotal,
      precio_min: precioMin,
      precio_max: precioMax,
      precio_min_formateado: formatearPrecio(precioMin) + ' COP',
      precio_max_formateado: formatearPrecio(precioMax) + ' COP',
      diseno_horas: rango.disenoHrs,
      sesion_horas: rango.sesionHrs,
      zona_sensible: zonaSensible,
      quiere_asesoria: quiereAsesoria,
      descripcion_idea: datos.descripcion_idea || ''
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar cotización' });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    mensaje: 'API Its Real funcionando ✅',
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

// Health check para Render
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Página de inicio
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Its Real API</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #F8F3EC;
        }
        h1 {
          color: #9D4533;
          text-align: center;
          font-weight: 300;
          letter-spacing: 4px;
        }
        .status {
          text-align: center;
          color: #4CAF50;
          font-size: 18px;
          margin: 20px 0;
        }
        .endpoint {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
          border-left: 4px solid #9D4533;
        }
        code {
          background: #f5f5f5;
          padding: 2px 8px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>IT'S REAL API</h1>
      <p class="status">✅ API Activa y Funcionando</p>
      
      <div class="endpoint">
        <h3>POST /cotizar</h3>
        <p>Calcula precio de tatuaje según parámetros.</p>
        <p><strong>Parámetros:</strong></p>
        <ul>
          <li><code>puntos_tamano</code>: 1, 2, 3, o 5</li>
          <li><code>puntos_zona</code>: 0 o 1</li>
          <li><code>puntos_estilo</code>: 0 o 2</li>
          <li><code>puntos_claridad</code>: 0</li>
          <li><code>zona_sensible</code>: "si" o "no"</li>
          <li><code>quiere_asesoria</code>: "si" o "no"</li>
          <li><code>descripcion_idea</code>: texto</li>
        </ul>
      </div>

      <div class="endpoint">
        <h3>GET /test</h3>
        <p>Verifica que la API está funcionando.</p>
        <p><a href="/test" target="_blank">Probar →</a></p>
      </div>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API Its Real corriendo en puerto ${PORT}`);
  console.log(`🌐 Endpoints disponibles:`);
  console.log(`   GET  /       - Documentación`);
  console.log(`   GET  /test   - Test de API`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /cotizar - Cotización`);
});
