const { Reporte } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get configuración de reportes disponibles
// @route   GET /api/reportes/config
// @access  Public
const getConfigReportes = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Solicitando configuración de reportes...');
    
    const configResult = await Reporte.getConfiguracionReportes();
    
    res.status(200).json({
      success: true,
      message: 'Configuración de reportes obtenida exitosamente',
      data: configResult.data
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en configuración:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración de reportes'
    });
  }
});

// @desc    Generar reporte 1: Listado de usuarios
// @route   GET /api/reportes/usuarios
// @access  Public
const getReporteUsuarios = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte de usuarios...');
    
    const reporteResult = await Reporte.getReporteUsuarios();
    
    res.status(200).json({
      success: true,
      message: `Reporte de usuarios generado exitosamente`,
      data: {
        reporte: {
          id: 1,
          nombre: "Listado de Usuarios",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte usuarios:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte de usuarios'
    });
  }
});

// @desc    Generar reporte 2: Vehículos con propietarios
// @route   GET /api/reportes/vehiculos-propietarios
// @access  Public
const getReporteVehiculosPropietarios = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte de vehículos con propietarios...');
    
    const reporteResult = await Reporte.getReporteVehiculosPropietarios();
    
    res.status(200).json({
      success: true,
      message: `Reporte de vehículos con propietarios generado exitosamente`,
      data: {
        reporte: {
          id: 2,
          nombre: "Vehículos con Propietarios",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte vehículos-propietarios:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte de vehículos con propietarios'
    });
  }
});

// @desc    Generar reporte 3: Accesos de entrada
// @route   GET /api/reportes/accesos-entrada
// @access  Public
const getReporteAccesosEntrada = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte de accesos de entrada...');
    
    const reporteResult = await Reporte.getReporteAccesosEntrada();
    
    res.status(200).json({
      success: true,
      message: `Reporte de accesos de entrada generado exitosamente`,
      data: {
        reporte: {
          id: 3,
          nombre: "Accesos de Entrada",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte accesos-entrada:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte de accesos de entrada'
    });
  }
});

// @desc    Generar reporte 4: Accesos de salida
// @route   GET /api/reportes/accesos-salida
// @access  Public
const getReporteAccesosSalida = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte de accesos de salida...');
    
    const reporteResult = await Reporte.getReporteAccesosSalida();
    
    res.status(200).json({
      success: true,
      message: `Reporte de accesos de salida generado exitosamente`,
      data: {
        reporte: {
          id: 4,
          nombre: "Accesos de Salida",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count,
          incluye_tiempo_estadia: true
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte accesos-salida:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte de accesos de salida'
    });
  }
});

// @desc    Generar reporte 5: Incidencias reportadas
// @route   GET /api/reportes/incidencias
// @access  Public
const getReporteIncidencias = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte de incidencias...');
    
    const reporteResult = await Reporte.getReporteIncidencias();
    
    res.status(200).json({
      success: true,
      message: `Reporte de incidencias generado exitosamente`,
      data: {
        reporte: {
          id: 5,
          nombre: "Incidencias Reportadas",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte incidencias:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte de incidencias'
    });
  }
});

// @desc    Generar reporte 6: Incidencias completas con propietarios
// @route   GET /api/reportes/incidencias-completo
// @access  Public
const getReporteIncidenciasCompleto = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando reporte completo de incidencias...');
    
    const reporteResult = await Reporte.getReporteIncidenciasCompleto();
    
    res.status(200).json({
      success: true,
      message: `Reporte completo de incidencias generado exitosamente`,
      data: {
        reporte: {
          id: 6,
          nombre: "Incidencias Completas con Propietarios",
          fecha_generacion: new Date().toISOString(),
          total_registros: reporteResult.count,
          incluye_propietarios: true
        },
        registros: reporteResult.data
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error en reporte incidencias-completo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando reporte completo de incidencias'
    });
  }
});

// @desc    Generar todos los reportes (endpoint especial)
// @route   GET /api/reportes/todos
// @access  Public
const getTodosLosReportes = asyncHandler(async (req, res) => {
  try {
    console.log('[CONTROLLER] Generando todos los reportes...');
    
    const reportes = {};
    const errores = [];
    
    try {
      reportes.usuarios = await Reporte.getReporteUsuarios();
    } catch (error) {
      errores.push({ reporte: 'usuarios', error: error.message });
    }
    
    try {
      reportes.vehiculos_propietarios = await Reporte.getReporteVehiculosPropietarios();
    } catch (error) {
      errores.push({ reporte: 'vehiculos_propietarios', error: error.message });
    }
    
    try {
      reportes.accesos_entrada = await Reporte.getReporteAccesosEntrada();
    } catch (error) {
      errores.push({ reporte: 'accesos_entrada', error: error.message });
    }
    
    try {
      reportes.accesos_salida = await Reporte.getReporteAccesosSalida();
    } catch (error) {
      errores.push({ reporte: 'accesos_salida', error: error.message });
    }
    
    try {
      reportes.incidencias = await Reporte.getReporteIncidencias();
    } catch (error) {
      errores.push({ reporte: 'incidencias', error: error.message });
    }
    
    try {
      reportes.incidencias_completo = await Reporte.getReporteIncidenciasCompleto();
    } catch (error) {
      errores.push({ reporte: 'incidencias_completo', error: error.message });
    }
    
    const totalRegistros = Object.values(reportes).reduce((total, reporte) => {
      return total + (reporte?.count || 0);
    }, 0);
    
    res.status(200).json({
      success: true,
      message: `Todos los reportes generados`,
      data: {
        resumen: {
          fecha_generacion: new Date().toISOString(),
          total_reportes_generados: Object.keys(reportes).length,
          total_reportes_disponibles: 6,
          total_registros: totalRegistros,
          errores: errores.length
        },
        reportes: reportes,
        errores: errores.length > 0 ? errores : undefined
      }
    });
  } catch (error) {
    console.error('[CONTROLLER] Error generando todos los reportes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error generando todos los reportes'
    });
  }
});

module.exports = {
  getConfigReportes,
  getReporteUsuarios,
  getReporteVehiculosPropietarios,
  getReporteAccesosEntrada,
  getReporteAccesosSalida,
  getReporteIncidencias,
  getReporteIncidenciasCompleto,
  getTodosLosReportes
}; 