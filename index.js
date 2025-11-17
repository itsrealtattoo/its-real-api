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
  1: { min: 400000, max: 400000 },      // Mini: precio fijo 400k
  2: { min: 500000, max: 700000 },      // Pequeño
  3: { min: 800000, max: 1000000 },     // Mediano
  4: { min: 1200000, max: 1500000 },    // Grande
  5: { min: 0, max: 0 }                 // Más grande: cotización personalizada
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

    // CASO ESPECIAL: Más grande (18cm+)
    if (puntos === 5) {
      return res.json({
        requiere_cotizacion_personalizada: true,
        mensaje: "Para tatuajes de 18cm o más, necesitamos coordinar una cotización personalizada por WhatsApp.",
        puntos_totales: 5,
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

    // Calcular promedio (disponible pero no usado en mensaje)
    const precio_promedio = Math.round((precio_min + precio_max) / 2);
    const precio_promedio_formateado = precio_promedio.toLocaleString('es-CO') + ' COP';

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
      diseno_horas: diseno_horas,
      sesion_horas: sesion_horas,
      puntos_totales: puntos,
      zona_sensible: zona_sensible,
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
    version: '2.0',
    fecha: new Date().toISOString()
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Its Real corriendo en puerto ${PORT}`);
});
