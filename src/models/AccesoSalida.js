const DatabaseConnection = require('../config/DatabaseConnection');

class AccesoSalida {
  constructor(
    id = null,
    movimiento = null,
    fecha_hora = null,
    puerta = null,
    tiempo_estadia = null,
    vehiculo_id = null
  ) {
    this._id = id;
    this._movimiento = movimiento;
    this._fecha_hora = fecha_hora;
    this._puerta = puerta;
    this._tiempo_estadia = tiempo_estadia;
    this._vehiculo_id = vehiculo_id;
    this._db = new DatabaseConnection();
  }

  // Getters
  get id() { return this._id; }
  get movimiento() { return this._movimiento; }
  get fecha_hora() { return this._fecha_hora; }
  get puerta() { return this._puerta; }
  get tiempo_estadia() { return this._tiempo_estadia; }
  get vehiculo_id() { return this._vehiculo_id; }

  // Setters
  set id(value) { this._id = value; }
  set movimiento(value) { this._movimiento = value; }
  set fecha_hora(value) { this._fecha_hora = value; }
  set puerta(value) { this._puerta = value; }
  set tiempo_estadia(value) { this._tiempo_estadia = value; }
  set vehiculo_id(value) { this._vehiculo_id = value; }

  // CREATE - Insert new access/exit record
  async create() {
    try {
      console.log(`[CREATE ACCESO-SALIDA] Creando registro con datos:`, {
        movimiento: this._movimiento,
        fecha_hora: this._fecha_hora,
        puerta: this._puerta,
        tiempo_estadia: this._tiempo_estadia,
        vehiculo_id: this._vehiculo_id
      });

      // Validaciones usando las funciones helper
      this._movimiento = AccesoSalida.validateMovimiento(this._movimiento);
      this._vehiculo_id = AccesoSalida.validateVehiculoId(this._vehiculo_id);
      this._tiempo_estadia = AccesoSalida.validateTiempoEstadia(this._tiempo_estadia);

      // Asegurar que fecha_hora sea válida
      if (!this._fecha_hora) {
        this._fecha_hora = new Date();
        console.log(`[CREATE ACCESO-SALIDA] Fecha/hora no proporcionada, usando actual: ${this._fecha_hora}`);
      }

      const sql = `INSERT INTO ACCESO_SALIDAS (movimiento, fecha_hora, puerta, tiempo_estadia, VEHICULO_id) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      const params = [
        this._movimiento, 
        this._fecha_hora, 
        this._puerta, 
        this._tiempo_estadia, 
        parseInt(this._vehiculo_id)
      ];
      
      console.log(`[CREATE ACCESO-SALIDA] Ejecutando SQL con parámetros:`, params);
      console.log(`[CREATE ACCESO-SALIDA] Detalle tiempo_estadia - Tipo: ${typeof this._tiempo_estadia}, Valor: ${this._tiempo_estadia}`);
      
      const result = await this._db.executeQuery(sql, params);
      this._id = result.results.insertId;
      
      console.log(`[CREATE ACCESO-SALIDA] Registro creado exitosamente con ID: ${this._id}`);
      return this;
    } catch (error) {
      console.error(`[CREATE ACCESO-SALIDA] Error:`, error);
      throw new Error(`Error creating AccesoSalida: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // READ - Get access/exit by ID
  async findById(id) {
    try {
      const sql = 'SELECT * FROM ACCESO_SALIDAS WHERE id = ?';
      const result = await this._db.executeQuery(sql, [id]);
      
      if (result.results.length > 0) {
        const row = result.results[0];
        this._mapRowToObject(row);
        return this;
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding AccesoSalida: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // READ - Get all access/exit records
  static async findAll() {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM ACCESO_SALIDAS';
      const result = await db.executeQuery(sql);
      
      return result.results.map(row => {
        const accesoSalida = new AccesoSalida();
        accesoSalida._mapRowToObject(row);
        return accesoSalida;
      });
    } catch (error) {
      throw new Error(`Error finding all AccesoSalida: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find by vehicle ID
  static async findByVehicleId(vehiculoId) {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM ACCESO_SALIDAS WHERE VEHICULO_id = ?';
      const result = await db.executeQuery(sql, [vehiculoId]);
      
      return result.results.map(row => {
        const accesoSalida = new AccesoSalida();
        accesoSalida._mapRowToObject(row);
        return accesoSalida;
      });
    } catch (error) {
      throw new Error(`Error finding AccesoSalida by vehicle ID: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find última entrada por vehículo (para calcular tiempo de estadía)
  static async findUltimaEntradaPorVehiculo(vehiculoId) {
    const db = new DatabaseConnection();
    try {
      console.log(`[FIND ULTIMA ENTRADA] Buscando última entrada para vehículo ID: ${vehiculoId}`);
      
      const sql = `SELECT * FROM ACCESO_SALIDAS 
                   WHERE VEHICULO_id = ? AND movimiento = 'Entrada' 
                   ORDER BY fecha_hora DESC, id DESC 
                   LIMIT 1`;
      
      const result = await db.executeQuery(sql, [vehiculoId]);
      
      console.log(`[FIND ULTIMA ENTRADA] SQL ejecutado:`, sql);
      console.log(`[FIND ULTIMA ENTRADA] Parámetros:`, [vehiculoId]);
      console.log(`[FIND ULTIMA ENTRADA] Resultados encontrados:`, result.results.length);
      
      if (result.results.length > 0) {
        const row = result.results[0];
        const accesoSalida = new AccesoSalida();
        accesoSalida._mapRowToObject(row);
        
        console.log(`[FIND ULTIMA ENTRADA] Última entrada encontrada:`, {
          id: accesoSalida.id,
          movimiento: accesoSalida.movimiento,
          fecha_hora: accesoSalida.fecha_hora,
          vehiculo_id: accesoSalida.vehiculo_id
        });
        
        return accesoSalida;
      }
      
      console.log(`[FIND ULTIMA ENTRADA] No se encontró entrada previa para vehículo ${vehiculoId}`);
      return null;
    } catch (error) {
      console.error(`[FIND ULTIMA ENTRADA] Error:`, error);
      throw new Error(`Error finding última entrada by vehicle ID: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Verificar si vehículo tiene entrada sin salida
  static async tieneEntradaSinSalida(vehiculoId) {
    const db = new DatabaseConnection();
    try {
      console.log(`[VERIFICAR ENTRADA SIN SALIDA] Verificando vehículo ID: ${vehiculoId}`);
      
      // Obtener el último registro del vehículo
      const sql = `SELECT * FROM ACCESO_SALIDAS 
                   WHERE VEHICULO_id = ? 
                   ORDER BY fecha_hora DESC, id DESC 
                   LIMIT 1`;
      
      const result = await db.executeQuery(sql, [vehiculoId]);
      
      if (result.results.length === 0) {
        console.log(`[VERIFICAR ENTRADA SIN SALIDA] No hay registros para vehículo ${vehiculoId}`);
        return false;
      }
      
      const ultimoRegistro = result.results[0];
      const tieneEntradaSinSalida = ultimoRegistro.movimiento === 'Entrada';
      
      console.log(`[VERIFICAR ENTRADA SIN SALIDA] Último registro:`, {
        id: ultimoRegistro.id,
        movimiento: ultimoRegistro.movimiento,
        fecha_hora: ultimoRegistro.fecha_hora,
        tiene_entrada_sin_salida: tieneEntradaSinSalida
      });
      
      return tieneEntradaSinSalida;
    } catch (error) {
      console.error(`[VERIFICAR ENTRADA SIN SALIDA] Error:`, error);
      throw new Error(`Error verificando entrada sin salida: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find by movement type (Entrada/Salida)
  static async findByMovimiento(movimiento) {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM ACCESO_SALIDAS WHERE movimiento = ?';
      const result = await db.executeQuery(sql, [movimiento]);
      
      return result.results.map(row => {
        const accesoSalida = new AccesoSalida();
        accesoSalida._mapRowToObject(row);
        return accesoSalida;
      });
    } catch (error) {
      throw new Error(`Error finding AccesoSalida by movement: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find by date range
  static async findByDateRange(fechaInicio, fechaFin) {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM ACCESO_SALIDAS WHERE fecha_hora BETWEEN ? AND ?';
      const result = await db.executeQuery(sql, [fechaInicio, fechaFin]);
      
      return result.results.map(row => {
        const accesoSalida = new AccesoSalida();
        accesoSalida._mapRowToObject(row);
        return accesoSalida;
      });
    } catch (error) {
      throw new Error(`Error finding AccesoSalida by date range: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // UPDATE - Update access/exit record
  async update() {
    try {
      console.log(`[UPDATE ACCESO-SALIDA] Actualizando registro ID ${this._id} con datos:`, {
        movimiento: this._movimiento,
        fecha_hora: this._fecha_hora,
        puerta: this._puerta,
        tiempo_estadia: this._tiempo_estadia,
        vehiculo_id: this._vehiculo_id
      });

      // Validar campos si están definidos
      if (this._movimiento !== undefined) {
        this._movimiento = AccesoSalida.validateMovimiento(this._movimiento);
      }
      
      if (this._vehiculo_id !== undefined) {
        this._vehiculo_id = AccesoSalida.validateVehiculoId(this._vehiculo_id);
      }
      
      if (this._tiempo_estadia !== undefined) {
        this._tiempo_estadia = AccesoSalida.validateTiempoEstadia(this._tiempo_estadia);
        console.log(`[UPDATE ACCESO-SALIDA] Tiempo_estadia validado - Tipo: ${typeof this._tiempo_estadia}, Valor: ${this._tiempo_estadia}`);
      }

      const sql = `UPDATE ACCESO_SALIDAS SET movimiento = ?, fecha_hora = ?, puerta = ?, 
                   tiempo_estadia = ?, VEHICULO_id = ? WHERE id = ?`;
      
      const params = [
        this._movimiento, this._fecha_hora, this._puerta, this._tiempo_estadia, 
        this._vehiculo_id, this._id
      ];
      
      console.log(`[UPDATE ACCESO-SALIDA] Ejecutando SQL con parámetros:`, params);
      
      await this._db.executeQuery(sql, params);
      
      console.log(`[UPDATE ACCESO-SALIDA] Registro actualizado exitosamente`);
      return this;
    } catch (error) {
      console.error(`[UPDATE ACCESO-SALIDA] Error:`, error);
      throw new Error(`Error updating AccesoSalida: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // DELETE - Delete access/exit record
  async delete() {
    try {
      const sql = 'DELETE FROM ACCESO_SALIDAS WHERE id = ?';
      await this._db.executeQuery(sql, [this._id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting AccesoSalida: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // Helper method to validate movement type
  static validateMovimiento(movimiento) {
    const movimientosValidos = ['Entrada', 'Salida'];
    if (!movimiento) {
      throw new Error('El movimiento es requerido');
    }
    if (!movimientosValidos.includes(movimiento)) {
      throw new Error(`Movimiento inválido. Debe ser: ${movimientosValidos.join(', ')}`);
    }
    return movimiento;
  }

  // Helper method to validate vehicle ID
  static validateVehiculoId(vehiculo_id) {
    if (!vehiculo_id) {
      throw new Error('El ID del vehículo es requerido');
    }
    if (!Number.isInteger(Number(vehiculo_id))) {
      throw new Error('El ID del vehículo debe ser un número válido');
    }
    return parseInt(vehiculo_id);
  }

  // Helper method to validate tiempo_estadia
  static validateTiempoEstadia(tiempo_estadia) {
    // Si es undefined o null, está bien - es opcional
    if (tiempo_estadia === undefined || tiempo_estadia === null) {
      return null;
    }
    
    // Si es un número (incluido 0), convertir a entero
    if (typeof tiempo_estadia === 'number' || !isNaN(Number(tiempo_estadia))) {
      const tiempoNumerico = parseInt(tiempo_estadia);
      
      // Validar que sea un número entero no negativo
      if (tiempoNumerico < 0) {
        throw new Error('El tiempo de estadía debe ser un número positivo o cero');
      }
      
      return tiempoNumerico;
    }
    
    throw new Error('El tiempo de estadía debe ser un número válido');
  }

  // Helper method to map database row to object properties
  _mapRowToObject(row) {
    this._id = row.id;
    this._movimiento = row.movimiento;
    this._fecha_hora = row.fecha_hora;
    this._puerta = row.puerta;
    this._tiempo_estadia = row.tiempo_estadia;
    this._vehiculo_id = row.VEHICULO_id;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this._id,
      movimiento: this._movimiento,
      fecha_hora: this._fecha_hora,
      puerta: this._puerta,
      tiempo_estadia: this._tiempo_estadia,
      vehiculo_id: this._vehiculo_id
    };
  }
}

module.exports = AccesoSalida; 