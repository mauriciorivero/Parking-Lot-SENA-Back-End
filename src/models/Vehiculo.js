const DatabaseConnection = require('../config/DatabaseConnection');

class Vehiculo {
  constructor(
    id = null,
    placa = null,
    color = null,
    modelo = null,
    marca = null,
    tipo = null,
    usuario_id_usuario = null
  ) {
    this._id = id;
    this._placa = placa;
    this._color = color;
    this._modelo = modelo;
    this._marca = marca;
    this._tipo = tipo;
    this._usuario_id_usuario = usuario_id_usuario;
    this._db = new DatabaseConnection();
  }

  // Getters
  get id() { return this._id; }
  get placa() { return this._placa; }
  get color() { return this._color; }
  get modelo() { return this._modelo; }
  get marca() { return this._marca; }
  get tipo() { return this._tipo; }
  get usuario_id_usuario() { return this._usuario_id_usuario; }

  // Setters
  set id(value) { this._id = value; }
  set placa(value) { this._placa = value; }
  set color(value) { this._color = value; }
  set modelo(value) { this._modelo = value; }
  set marca(value) { this._marca = value; }
  set tipo(value) { this._tipo = value; }
  set usuario_id_usuario(value) { this._usuario_id_usuario = value; }

  // CREATE - Insert new vehicle
  async create() {
    try {
      console.log(`[CREATE VEHICULO] Creando vehículo con datos:`, {
        placa: this._placa,
        color: this._color,
        modelo: this._modelo,
        marca: this._marca,
        tipo: this._tipo,
        usuario_id: this._usuario_id_usuario
      });

      // Validar y normalizar la placa usando la función helper
      const placaNormalizada = Vehiculo.validateAndNormalizePlaca(this._placa);
      console.log(`[CREATE VEHICULO] Placa normalizada: "${this._placa}" -> "${placaNormalizada}"`);

      // Verificar que no exista otro vehículo con la misma placa
      const existingVehicle = await Vehiculo.findByPlacaStatic(placaNormalizada);
      if (existingVehicle) {
        throw new Error(`Ya existe un vehículo registrado con la placa: ${placaNormalizada}`);
      }

      // Actualizar la placa normalizada en el objeto
      this._placa = placaNormalizada;

      const sql = `INSERT INTO VEHICULO (placa, color, modelo, marca, tipo, USUARIO_id_usuario) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      const params = [
        this._placa, this._color, this._modelo, this._marca, this._tipo, this._usuario_id_usuario
      ];
      
      console.log(`[CREATE VEHICULO] Ejecutando consulta SQL con parámetros:`, params);
      
      const result = await this._db.executeQuery(sql, params);
      this._id = result.results.insertId;
      
      console.log(`[CREATE VEHICULO] Vehículo creado exitosamente con ID: ${this._id}`);
      return this;
    } catch (error) {
      console.error(`[CREATE VEHICULO] Error al crear vehículo:`, error);
      throw new Error(`Error creating Vehiculo: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // READ - Get vehicle by ID
  async findById(id) {
    try {
      const sql = 'SELECT * FROM VEHICULO WHERE id = ?';
      const result = await this._db.executeQuery(sql, [id]);
      
      if (result.results.length > 0) {
        const row = result.results[0];
        this._mapRowToObject(row);
        return this;
      }
      return null;
    } catch (error) {
      throw new Error(`Error finding Vehiculo: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // READ - Get all vehicles
  static async findAll() {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM VEHICULO';
      const result = await db.executeQuery(sql);
      
      return result.results.map(row => {
        const vehiculo = new Vehiculo();
        vehiculo._mapRowToObject(row);
        return vehiculo;
      });
    } catch (error) {
      throw new Error(`Error finding all Vehiculo: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find by plate
  async findByPlaca(placa) {
    try {
      console.log(`[FIND BY PLACA] Buscando vehículo con placa: "${placa}"`);
      
      // Validar y normalizar la placa usando la función helper
      const placaNormalizada = Vehiculo.validateAndNormalizePlaca(placa);
      console.log(`[FIND BY PLACA] Placa normalizada: "${placaNormalizada}"`);

      // Realizar búsqueda case-insensitive
      const sql = 'SELECT * FROM VEHICULO WHERE UPPER(TRIM(placa)) = ?';
      const result = await this._db.executeQuery(sql, [placaNormalizada]);
      
      console.log(`[FIND BY PLACA] Resultados encontrados: ${result.results.length}`);
      
      if (result.results.length > 0) {
        const row = result.results[0];
        this._mapRowToObject(row);
        console.log(`[FIND BY PLACA] Vehículo encontrado:`, this.toJSON());
        return this;
      }
      
      console.log(`[FIND BY PLACA] No se encontró vehículo con placa: "${placaNormalizada}"`);
      return null;
    } catch (error) {
      console.error(`[FIND BY PLACA] Error en búsqueda:`, error);
      throw new Error(`Error finding Vehiculo by placa: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // READ - Find vehicles by user ID
  static async findByUserId(userId) {
    const db = new DatabaseConnection();
    try {
      const sql = 'SELECT * FROM VEHICULO WHERE USUARIO_id_usuario = ?';
      const result = await db.executeQuery(sql, [userId]);
      
      return result.results.map(row => {
        const vehiculo = new Vehiculo();
        vehiculo._mapRowToObject(row);
        return vehiculo;
      });
    } catch (error) {
      throw new Error(`Error finding Vehiculo by user ID: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // READ - Find by plate (static method)
  static async findByPlacaStatic(placa) {
    const db = new DatabaseConnection();
    try {
      console.log(`[STATIC FIND BY PLACA] Buscando vehículo con placa: "${placa}"`);
      
      // Validar y normalizar la placa usando la función helper
      const placaNormalizada = Vehiculo.validateAndNormalizePlaca(placa);
      console.log(`[STATIC FIND BY PLACA] Placa normalizada: "${placaNormalizada}"`);

      // Realizar búsqueda case-insensitive
      const sql = 'SELECT * FROM VEHICULO WHERE UPPER(TRIM(placa)) = ?';
      const result = await db.executeQuery(sql, [placaNormalizada]);
      
      console.log(`[STATIC FIND BY PLACA] Resultados encontrados: ${result.results.length}`);
      
      if (result.results.length > 0) {
        const row = result.results[0];
        const vehiculo = new Vehiculo();
        vehiculo._mapRowToObject(row);
        console.log(`[STATIC FIND BY PLACA] Vehículo encontrado:`, vehiculo.toJSON());
        return vehiculo;
      }
      
      console.log(`[STATIC FIND BY PLACA] No se encontró vehículo con placa: "${placaNormalizada}"`);
      return null;
    } catch (error) {
      console.error(`[STATIC FIND BY PLACA] Error en búsqueda:`, error);
      throw new Error(`Error finding Vehiculo by placa: ${error.message}`);
    } finally {
      await db.close();
    }
  }

  // UPDATE - Update vehicle
  async update() {
    try {
      console.log(`[UPDATE VEHICULO] Actualizando vehículo ID ${this._id} con datos:`, {
        placa: this._placa,
        color: this._color,
        modelo: this._modelo,
        marca: this._marca,
        tipo: this._tipo,
        usuario_id: this._usuario_id_usuario
      });

      // Si se está actualizando la placa, validar y normalizar
      if (this._placa) {
        // Validar y normalizar la placa usando la función helper
        const placaNormalizada = Vehiculo.validateAndNormalizePlaca(this._placa);
        console.log(`[UPDATE VEHICULO] Placa normalizada: "${this._placa}" -> "${placaNormalizada}"`);

        // Verificar que no exista otro vehículo con la misma placa (excluyendo el actual)
        const existingVehicle = await Vehiculo.findByPlacaStatic(placaNormalizada);
        if (existingVehicle && existingVehicle.id !== this._id) {
          throw new Error(`Ya existe otro vehículo registrado con la placa: ${placaNormalizada}`);
        }

        // Actualizar la placa normalizada en el objeto
        this._placa = placaNormalizada;
      }

      const sql = `UPDATE VEHICULO SET placa = ?, color = ?, modelo = ?, marca = ?, tipo = ?, 
                   USUARIO_id_usuario = ? WHERE id = ?`;
      
      const params = [
        this._placa, this._color, this._modelo, this._marca, this._tipo, 
        this._usuario_id_usuario, this._id
      ];
      
      console.log(`[UPDATE VEHICULO] Ejecutando consulta SQL con parámetros:`, params);
      
      await this._db.executeQuery(sql, params);
      
      console.log(`[UPDATE VEHICULO] Vehículo actualizado exitosamente`);
      return this;
    } catch (error) {
      console.error(`[UPDATE VEHICULO] Error al actualizar vehículo:`, error);
      throw new Error(`Error updating Vehiculo: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // DELETE - Delete vehicle
  async delete() {
    try {
      const sql = 'DELETE FROM VEHICULO WHERE id = ?';
      await this._db.executeQuery(sql, [this._id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting Vehiculo: ${error.message}`);
    } finally {
      await this._db.close();
    }
  }

  // Helper method to validate and normalize plate
  static validateAndNormalizePlaca(placa) {
    if (!placa) {
      throw new Error('La placa es requerida');
    }

    if (typeof placa !== 'string') {
      throw new Error('La placa debe ser un string válido');
    }

    const placaNormalizada = placa.toString().trim().toUpperCase();

    if (placaNormalizada.length < 3) {
      throw new Error('La placa debe tener al menos 3 caracteres');
    }

    // Validar formato básico (solo letras y números, posible guión)
    const formatoPlaca = /^[A-Z0-9\-]+$/;
    if (!formatoPlaca.test(placaNormalizada)) {
      throw new Error('La placa solo puede contener letras, números y guiones');
    }

    return placaNormalizada;
  }

  // Helper method to map database row to object properties
  _mapRowToObject(row) {
    this._id = row.id;
    this._placa = row.placa;
    this._color = row.color;
    this._modelo = row.modelo;
    this._marca = row.marca;
    this._tipo = row.tipo;
    this._usuario_id_usuario = row.USUARIO_id_usuario;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this._id,
      placa: this._placa,
      color: this._color,
      modelo: this._modelo,
      marca: this._marca,
      tipo: this._tipo,
      usuario_id_usuario: this._usuario_id_usuario
    };
  }
}

module.exports = Vehiculo; 