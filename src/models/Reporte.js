const DatabaseConnection = require('../config/DatabaseConnection');

class Reporte {
  constructor() {
    this._db = new DatabaseConnection();
  }

  // REPORTE 1: Listado de todos los usuarios
  static async getReporteUsuarios() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 1] Generando listado de usuarios...');
      
      const sql = `SELECT * FROM USUARIO`;
      const result = await db.executeQuery(sql, []);
      
      console.log(`[REPORTE 1] ${result.results.length} usuarios encontrados`);
      
      return {
        success: true,
        count: result.results.length,
        data: result.results
      };
    } catch (error) {
      console.error('[REPORTE 1] Error:', error.message);
      throw new Error(`Error generando reporte de usuarios: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // REPORTE 2: Vehículos con información de sus propietarios
  static async getReporteVehiculosPropietarios() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 2] Generando reporte de vehículos con propietarios...');
      
      const sql = `
        SELECT
          vehiculo.placa, 
          vehiculo.marca,
          VEHICULO.tipo,
          vehiculo.color,
          USUARIO.numero_documento,
          USUARIO.primer_nombre,
          USUARIO.primer_apellido
        FROM
          USUARIO, VEHICULO
        WHERE
          USUARIO.id_usuario = VEHICULO.USUARIO_id_usuario
        ORDER BY vehiculo.placa
      `;
      
      const result = await db.executeQuery(sql, []);
      
      console.log(`[REPORTE 2] ${result.results.length} vehículos con propietarios encontrados`);
      
      return {
        success: true,
        count: result.results.length,
        data: result.results
      };
    } catch (error) {
      console.error('[REPORTE 2] Error:', error.message);
      throw new Error(`Error generando reporte de vehículos con propietarios: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // REPORTE 3: Accesos de entrada
  static async getReporteAccesosEntrada() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 3] Generando reporte de accesos de entrada...');
      
      const sql = `
        SELECT 
          ACCESO_SALIDAS.movimiento,
          ACCESO_SALIDAS.fecha_hora,
          ACCESO_SALIDAS.puerta,
          VEHICULO.placa
        FROM
          ACCESO_SALIDAS, VEHICULO
        WHERE 
          ACCESO_SALIDAS.VEHICULO_id = VEHICULO.id
          AND ACCESO_SALIDAS.movimiento = 'Entrada'
        ORDER BY ACCESO_SALIDAS.fecha_hora DESC
      `;
      
      const result = await db.executeQuery(sql, []);
      
      console.log(`[REPORTE 3] ${result.results.length} accesos de entrada encontrados`);
      
      return {
        success: true,
        count: result.results.length,
        data: result.results
      };
    } catch (error) {
      console.error('[REPORTE 3] Error:', error.message);
      throw new Error(`Error generando reporte de accesos de entrada: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // REPORTE 4: Accesos de salida con tiempo de estadía
  static async getReporteAccesosSalida() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 4] Generando reporte de accesos de salida...');
      
      const sql = `
        SELECT 
          ACCESO_SALIDAS.movimiento,
          ACCESO_SALIDAS.fecha_hora,
          ACCESO_SALIDAS.puerta,
          ACCESO_SALIDAS.tiempo_estadia,
          VEHICULO.placa
        FROM
          ACCESO_SALIDAS, VEHICULO
        WHERE 
          ACCESO_SALIDAS.VEHICULO_id = VEHICULO.id
          AND ACCESO_SALIDAS.movimiento = 'Salida'
        ORDER BY ACCESO_SALIDAS.fecha_hora DESC
      `;
      
      const result = await db.executeQuery(sql, []);
      
      // Procesar tiempo de estadía para formato legible
      const processedData = result.results.map(row => ({
        ...row,
        tiempo_estadia_segundos: row.tiempo_estadia,
        tiempo_estadia_minutos: row.tiempo_estadia ? Math.floor(row.tiempo_estadia / 60) : null,
        tiempo_estadia_horas: row.tiempo_estadia ? Math.floor(row.tiempo_estadia / 3600) : null,
        tiempo_estadia_formato: row.tiempo_estadia ? 
          `${Math.floor(row.tiempo_estadia / 3600)}h ${Math.floor((row.tiempo_estadia % 3600) / 60)}m ${row.tiempo_estadia % 60}s` : 
          'No disponible'
      }));
      
      console.log(`[REPORTE 4] ${result.results.length} accesos de salida encontrados`);
      
      return {
        success: true,
        count: result.results.length,
        data: processedData
      };
    } catch (error) {
      console.error('[REPORTE 4] Error:', error.message);
      throw new Error(`Error generando reporte de accesos de salida: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // REPORTE 5: Incidencias reportadas
  static async getReporteIncidencias() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 5] Generando reporte de incidencias...');
      
      const sql = `
        SELECT 
          INCIDENCIA.nombre,
          REPORTE_INCIDENCIA.fecha_hora,
          VEHICULO.placa
        FROM
          INCIDENCIA, REPORTE_INCIDENCIA, VEHICULO
        WHERE
          REPORTE_INCIDENCIA.INCIDENCIA_id = INCIDENCIA.id
          AND VEHICULO.id = REPORTE_INCIDENCIA.VEHICULO_id
        ORDER BY REPORTE_INCIDENCIA.fecha_hora DESC
      `;
      
      const result = await db.executeQuery(sql, []);
      
      console.log(`[REPORTE 5] ${result.results.length} incidencias reportadas encontradas`);
      
      return {
        success: true,
        count: result.results.length,
        data: result.results
      };
    } catch (error) {
      console.error('[REPORTE 5] Error:', error.message);
      throw new Error(`Error generando reporte de incidencias: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // REPORTE 6: Incidencias con información completa del propietario
  static async getReporteIncidenciasCompleto() {
    const db = new DatabaseConnection();
    try {
      console.log('[REPORTE 6] Generando reporte completo de incidencias con propietarios...');
      
      const sql = `
        SELECT 
          INCIDENCIA.nombre,
          REPORTE_INCIDENCIA.fecha_hora,
          VEHICULO.placa,
          USUARIO.primer_nombre,
          USUARIO.primer_apellido,
          USUARIO.numero_celular,
          USUARIO.direccion_correo
        FROM
          INCIDENCIA, REPORTE_INCIDENCIA, VEHICULO, USUARIO
        WHERE
          REPORTE_INCIDENCIA.INCIDENCIA_id = INCIDENCIA.id
          AND VEHICULO.id = REPORTE_INCIDENCIA.VEHICULO_id
          AND VEHICULO.USUARIO_id_usuario = USUARIO.id_usuario
        ORDER BY REPORTE_INCIDENCIA.fecha_hora DESC
      `;
      
      const result = await db.executeQuery(sql, []);
      
      console.log(`[REPORTE 6] ${result.results.length} incidencias con propietarios encontradas`);
      
      return {
        success: true,
        count: result.results.length,
        data: result.results
      };
    } catch (error) {
      console.error('[REPORTE 6] Error:', error.message);
      throw new Error(`Error generando reporte completo de incidencias: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // MÉTODO HELPER: Obtener configuración de reportes disponibles
  static async getConfiguracionReportes() {
    try {
      console.log('[CONFIG] Obteniendo configuración de reportes...');
      
      return {
        success: true,
        data: {
          reportes: {
            "1": {
              id: 1,
              nombre: "Listado de Usuarios",
              descripcion: "Reporte completo de todos los usuarios registrados en el sistema",
              endpoint: "/api/reportes/usuarios",
              metodo: "GET"
            },
            "2": {
              id: 2,
              nombre: "Vehículos con Propietarios",
              descripcion: "Listado de vehículos con información de sus propietarios",
              endpoint: "/api/reportes/vehiculos-propietarios",
              metodo: "GET"
            },
            "3": {
              id: 3,
              nombre: "Accesos de Entrada",
              descripcion: "Registro de todos los accesos de entrada al parqueadero",
              endpoint: "/api/reportes/accesos-entrada",
              metodo: "GET"
            },
            "4": {
              id: 4,
              nombre: "Accesos de Salida",
              descripcion: "Registro de accesos de salida con tiempo de estadía",
              endpoint: "/api/reportes/accesos-salida",
              metodo: "GET"
            },
            "5": {
              id: 5,
              nombre: "Incidencias Reportadas",
              descripcion: "Listado de incidencias reportadas en el parqueadero",
              endpoint: "/api/reportes/incidencias",
              metodo: "GET"
            },
            "6": {
              id: 6,
              nombre: "Incidencias Completas",
              descripcion: "Incidencias con información completa del propietario del vehículo",
              endpoint: "/api/reportes/incidencias-completo",
              metodo: "GET"
            }
          },
          total_reportes: 6,
          version: "1.0.0",
          caracteristicas: [
            "Reportes en tiempo real",
            "Datos ordenados cronológicamente", 
            "Información completa y detallada",
            "Formato JSON estándar",
            "Logging para auditoría"
          ]
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo configuración de reportes: ${error.message}`);
    }
  }
}

module.exports = Reporte; 