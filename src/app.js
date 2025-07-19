const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const celdaRoutes = require('./routes/celda.routes');
const accesoSalidaRoutes = require('./routes/accesoSalida.routes');
const historialParqueoRoutes = require('./routes/historialParqueo.routes');
const incidenciaRoutes = require('./routes/incidencia.routes');
const reporteIncidenciaRoutes = require('./routes/reporteIncidencia.routes');
const picoPlacaRoutes = require('./routes/picoPlaca.routes');
const perfilUsuarioRoutes = require('./routes/perfilUsuario.routes');
const reporteRoutes = require('./routes/reporte.routes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins and specific localhost ports
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development and production
    // Specifically include the requested localhost ports
    const allowedOrigins = [
      'http://localhost:5175',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow all origins or specific localhost ports
    if (origin.startsWith('http://localhost:') || 
        origin.startsWith('https://localhost:') ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow all origins (you can modify this for security)
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'parking-management-api'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Parking Management System API',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      vehiculos: '/api/vehiculos',
      celdas: '/api/celdas',
      accesos: '/api/accesos-salidas',
      historial: '/api/historial-parqueo',
      incidencias: '/api/incidencias',
      reportesIncidencia: '/api/reportes-incidencia',
      reportes: '/api/reportes',
      picoPlaca: '/api/pico-placa',
      perfiles: '/api/perfiles-usuario'
    }
  });
});

// API routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/celdas', celdaRoutes);
app.use('/api/accesos-salidas', accesoSalidaRoutes);
app.use('/api/historial-parqueo', historialParqueoRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/reportes-incidencia', reporteIncidenciaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/pico-placa', picoPlacaRoutes);
app.use('/api/perfiles-usuario', perfilUsuarioRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app; 