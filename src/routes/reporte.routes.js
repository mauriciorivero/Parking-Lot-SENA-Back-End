const express = require('express');
const {
  getConfigReportes,
  getReporteUsuarios,
  getReporteVehiculosPropietarios,
  getReporteAccesosEntrada,
  getReporteAccesosSalida,
  getReporteIncidencias,
  getReporteIncidenciasCompleto,
  getTodosLosReportes
} = require('../controllers/reporte.controller');

const router = express.Router();

// NOTA: El orden de las rutas es importante para evitar conflictos
// Las rutas más específicas deben ir antes que las más generales

// GET /api/reportes/config - Obtener configuración de reportes disponibles
router.get('/config', getConfigReportes);

// GET /api/reportes/todos - Generar todos los reportes (endpoint especial)
router.get('/todos', getTodosLosReportes);

// GET /api/reportes/usuarios - Reporte 1: Listado de usuarios
router.get('/usuarios', getReporteUsuarios);

// GET /api/reportes/vehiculos-propietarios - Reporte 2: Vehículos con propietarios
router.get('/vehiculos-propietarios', getReporteVehiculosPropietarios);

// GET /api/reportes/accesos-entrada - Reporte 3: Accesos de entrada
router.get('/accesos-entrada', getReporteAccesosEntrada);

// GET /api/reportes/accesos-salida - Reporte 4: Accesos de salida
router.get('/accesos-salida', getReporteAccesosSalida);

// GET /api/reportes/incidencias-completo - Reporte 6: Incidencias completas (debe ir antes que /incidencias)
router.get('/incidencias-completo', getReporteIncidenciasCompleto);

// GET /api/reportes/incidencias - Reporte 5: Incidencias reportadas
router.get('/incidencias', getReporteIncidencias);

module.exports = router; 