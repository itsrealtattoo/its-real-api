// API Its Real - Optimizado para Render.com
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURACIÓN DE PRECIOS - ITS REAL
// ==========================================

const PRECIO_RANGOS = {
  1: { min: 400000, max: 450000 },
  2: { min: 500000, max: 700000 },
  3: { min: 800000, max: 1000000 },
  4: { min: 1200000, max: 1500000 },
  5: { min: 0, max: 0 }
};

const TAMANO_TEXTO = {
  1: "Mini (3-5cm)",
  2: "Pequeño (6-9cm)",
  3: "Mediano (10-13cm)",
  4: "Grande (14-17cm)",
  5: "Muy grande (18cm+)"
};

const HORAS_SESION = {
  1: "1-2 horas",
  2: "2-3 horas",
  3: "3-4 horas",
  4: "7-8 horas",
  5: "Múltiples sesiones"
};

const HORAS_DISENO = {
  1: "1 hora",
  2: "1-2 horas",
  3: "2-3 horas",
  4: "4-5 horas",
  5: "5+ horas"
};

// ==========================================
// ENDPOINT PRINCIPAL DE COTIZACIÓN
// ==========================================

app.post('/cotizar', (req, res) => {
  try {
    const {
      puntos_tamano,
      zona_sensible,
      quiere_asesoria,
      descripcion_idea
    } = req.body;

    if (!puntos_tamano) {
      return res.status(400).json({
        error: 'Faltan datos requeridos'
      });
    }

    const puntos = parseInt(puntos_tamano);

    if (!PRECIO_RANGOS[puntos]) {
      return res.status(400).json({
        error: 'Tamaño no válido'
      });
    }

    // Obtener texto descriptivo del tamaño
    const tamano_texto = TAMANO_TEXTO[puntos];
    
    // Convertir zona sensible a texto descriptivo
    const zona_texto = zona_sensible === 'si' ? 'Zona sensible (costillas, pies, manos, cuello, etc.)' : 'Zona regular';

    // CASO ESPECIAL: Más grande (18cm+)
    if (puntos === 5) {
      return res.json({
        requiere_cotizacion_personalizada: true,
        mensaje: "Para tatuajes de 18cm o más, necesitamos coordinar una cotización personalizada por WhatsApp.",
        puntos_totales: 5,
        tamano_texto: tamano_texto,
        zona_texto: zona_texto,
        descripcion_idea: descripcion_idea || ''
      });
    }

    // Calcular precio base
    let precio_min = PRECIO_RANGOS[puntos].min;
    let precio_max = PRECIO_RANGOS[puntos].max;

    // Ajuste por zona sensible (+5%)
    if (zona_sensible === 'si') {
      precio_min = Math.round(precio_min * 1.05);
      precio_max = Math.round(precio_max * 1.05);
    }

    // Ajuste por asesoría (opcional)
    if (quiere_asesoria === 'si') {
      precio_min += 100000;
      precio_max += 100000;
    }

    // Formatear precios
    const precio_min_formateado = precio_min.toLocaleString('es-CO') + ' COP';
    const precio_max_formateado = precio_max.toLocaleString('es-CO') + ' COP';

    // Calcular promedio
    const precio_promedio = Math.round((precio_min + precio_max) / 2);
    const precio_promedio_formateado = precio_promedio.toLocaleString('es-CO') + ' COP';

    // Rango formateado para mostrar
    const rango_precio = `${precio_min_formateado} - ${precio_max_formateado}`;

    // Obtener horas estimadas
    const diseno_horas = HORAS_DISENO[puntos];
    const sesion_horas = HORAS_SESION[puntos];

    // Responder
    res.json({
      precio_min: precio_min,
      precio_max: precio_max,
      precio_min_formateado: precio_min_formateado,
      precio_max_formateado: precio_max_formateado,
      precio_promedio: precio_promedio,
      precio_promedio_formateado: precio_promedio_formateado,
      rango_precio: rango_precio,
      diseno_horas: diseno_horas,
      sesion_horas: sesion_horas,
      puntos_totales: puntos,
      tamano_texto: tamano_texto,
      zona_sensible: zona_sensible,
      zona_texto: zona_texto,
      quiere_asesoria: quiere_asesoria || 'no',
      descripcion_idea: descripcion_idea || '',
      requiere_cotizacion_personalizada: false
    });

  } catch (error) {
    console.error('Error en cotización:', error);
    res.status(500).json({
      error: 'Error al procesar la cotización'
    });
  }
});

// ==========================================
// ENDPOINT DE PRUEBA
// ==========================================

app.get('/test', (req, res) => {
  res.json({
    mensaje: 'API Its Real funcionando ✅',
    version: '2.1',
    fecha: new Date().toISOString()
  });
});

// ==========================================
// ENDPOINTS DE HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'API Its Real activa ✅'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Its Real corriendo en puerto ${PORT}`);
});
