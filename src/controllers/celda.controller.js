const { Celda } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all cells
// @route   GET /api/celdas
// @access  Public
const getCells = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tipo, estado } = req.query;
  
  let cells = await Celda.findAll();
  
  // Filter by type if provided
  if (tipo) {
    cells = cells.filter(cell => cell.tipo === tipo);
  }
  
  // Filter by status if provided
  if (estado) {
    cells = cells.filter(cell => cell.estado === estado);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedCells = cells.slice(startIndex, endIndex);
  
  res.status(200).json({
    success: true,
    count: paginatedCells.length,
    total: cells.length,
    pagination: {
      current: page,
      pages: Math.ceil(cells.length / limit)
    },
    data: paginatedCells.map(cell => cell.toJSON())
  });
});

// @desc    Get single cell
// @route   GET /api/celdas/:id
// @access  Public
const getCell = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  console.log(`[GET CELL] Buscando celda con ID: ${id}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    console.log(`[GET CELL] ID inválido: ${id}`);
    return res.status(400).json({
      success: false,
      error: 'ID de celda inválido'
    });
  }

  const celda = new Celda();
  const result = await celda.findById(id);
  
  console.log(`[GET CELL] Resultado de búsqueda:`, result ? 'Encontrada' : 'No encontrada');
  console.log(`[GET CELL] ID de celda encontrada:`, celda.id);
  
  if (!result || !celda.id) {
    console.log(`[GET CELL] Celda no encontrada en la base de datos`);
    return res.status(404).json({
      success: false,
      error: `Celda con ID ${id} no encontrada`
    });
  }
  
  console.log(`[GET CELL] Celda encontrada:`, celda.toJSON());
  
  res.status(200).json({
    success: true,
    data: celda.toJSON()
  });
});

// @desc    Get cells by type
// @route   GET /api/celdas/tipo/:tipo
// @access  Public
const getCellsByType = asyncHandler(async (req, res) => {
  const cells = await Celda.findByTipo(req.params.tipo);
  
  res.status(200).json({
    success: true,
    count: cells.length,
    data: cells.map(cell => cell.toJSON())
  });
});

// @desc    Get cells by status
// @route   GET /api/celdas/estado/:estado
// @access  Public
const getCellsByStatus = asyncHandler(async (req, res) => {
  const cells = await Celda.findByEstado(req.params.estado);
  
  res.status(200).json({
    success: true,
    count: cells.length,
    data: cells.map(cell => cell.toJSON())
  });
});

// @desc    Get available cells by type
// @route   GET /api/celdas/disponibles/:tipo
// @access  Public
const getAvailableCellsByType = asyncHandler(async (req, res) => {
  const cells = await Celda.findAvailableByType(req.params.tipo);
  
  res.status(200).json({
    success: true,
    count: cells.length,
    data: cells.map(cell => cell.toJSON())
  });
});

// @desc    Get cell statistics
// @route   GET /api/celdas/estadisticas/:tipo
// @access  Public
const getCellStatistics = asyncHandler(async (req, res) => {
  const tipo = req.params.tipo;
  const total = await Celda.countByTypeAndStatus(tipo, null);
  const libre = await Celda.countByTypeAndStatus(tipo, 'Libre');
  const ocupada = await Celda.countByTypeAndStatus(tipo, 'Ocupada');
  const mantenimiento = await Celda.countByTypeAndStatus(tipo, 'Mantenimiento');
  
  res.status(200).json({
    success: true,
    data: {
      tipo,
      total,
      libre,
      ocupada,
      mantenimiento,
      porcentaje_ocupacion: total > 0 ? ((ocupada / total) * 100).toFixed(2) : 0
    }
  });
});

// @desc    Create new cell
// @route   POST /api/celdas
// @access  Public
const createCell = asyncHandler(async (req, res) => {
  const { tipo, estado } = req.body;

  console.log(`[CREATE CELL] Creando nueva celda:`, { tipo, estado });

  // Validate required fields
  if (!tipo) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione el tipo de celda'
    });
  }

  // Validar tipos permitidos
  const tiposPermitidos = ['Carro', 'Moto', 'otro'];
  if (!tiposPermitidos.includes(tipo)) {
    console.log(`[CREATE CELL] Tipo inválido: ${tipo}`);
    return res.status(400).json({
      success: false,
      error: `Tipo de celda inválido. Los tipos permitidos son: ${tiposPermitidos.join(', ')}`
    });
  }

  // Validar estados permitidos
  const estadoFinal = estado || 'Libre';
  const estadosPermitidos = ['Libre', 'Ocupada', 'Mantenimiento'];
  if (!estadosPermitidos.includes(estadoFinal)) {
    console.log(`[CREATE CELL] Estado inválido: ${estadoFinal}`);
    return res.status(400).json({
      success: false,
      error: `Estado de celda inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`
    });
  }

  const celda = new Celda(
    null,
    tipo,
    estadoFinal
  );

  await celda.create();

  console.log(`[CREATE CELL] Celda creada exitosamente:`, celda.toJSON());

  res.status(201).json({
    success: true,
    message: 'Celda creada exitosamente',
    data: celda.toJSON()
  });
});

// @desc    Update cell (type and/or status)
// @route   PUT /api/celdas/:id
// @access  Public
const updateCell = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { tipo, estado } = req.body;
  
  console.log(`[UPDATE CELL] Actualizando celda con ID: ${id}`);
  console.log(`[UPDATE CELL] Datos recibidos:`, { tipo, estado });
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    console.log(`[UPDATE CELL] ID inválido: ${id}`);
    return res.status(400).json({
      success: false,
      error: 'ID de celda inválido'
    });
  }

  // Validar tipos permitidos
  const tiposPermitidos = ['Carro', 'Moto', 'otro'];
  if (tipo && !tiposPermitidos.includes(tipo)) {
    console.log(`[UPDATE CELL] Tipo inválido: ${tipo}`);
    return res.status(400).json({
      success: false,
      error: `Tipo de celda inválido. Los tipos permitidos son: ${tiposPermitidos.join(', ')}`
    });
  }

  // Validar estados permitidos
  const estadosPermitidos = ['Libre', 'Ocupada', 'Mantenimiento'];
  if (estado && !estadosPermitidos.includes(estado)) {
    console.log(`[UPDATE CELL] Estado inválido: ${estado}`);
    return res.status(400).json({
      success: false,
      error: `Estado de celda inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`
    });
  }

  // Validar que se proporcione al menos un campo para actualizar
  if (!tipo && !estado) {
    return res.status(400).json({
      success: false,
      error: 'Debe proporcionar al menos un campo para actualizar (tipo o estado)'
    });
  }

  // Buscar la celda
  const celda = new Celda();
  const result = await celda.findById(id);
  
  console.log(`[UPDATE CELL] Resultado de búsqueda:`, result ? 'Encontrada' : 'No encontrada');
  
  if (!result || !celda.id) {
    console.log(`[UPDATE CELL] Celda no encontrada en la base de datos`);
    return res.status(404).json({
      success: false,
      error: `Celda con ID ${id} no encontrada`
    });
  }

  // Guardar datos anteriores para el log
  const datosAnteriores = celda.toJSON();
  console.log(`[UPDATE CELL] Datos anteriores:`, datosAnteriores);

  // Actualizar solo los campos proporcionados
  if (tipo !== undefined) {
    celda.tipo = tipo;
    console.log(`[UPDATE CELL] Cambiando tipo de '${datosAnteriores.tipo}' a '${tipo}'`);
  }
  
  if (estado !== undefined) {
    celda.estado = estado;
    console.log(`[UPDATE CELL] Cambiando estado de '${datosAnteriores.estado}' a '${estado}'`);
  }

  // Ejecutar la actualización
  await celda.update();
  
  const datosNuevos = celda.toJSON();
  console.log(`[UPDATE CELL] Datos nuevos:`, datosNuevos);
  console.log(`[UPDATE CELL] Celda actualizada exitosamente`);

  res.status(200).json({
    success: true,
    message: 'Celda actualizada exitosamente',
    data: {
      previous: datosAnteriores,
      current: datosNuevos,
      changes: {
        tipo: tipo !== undefined ? { from: datosAnteriores.tipo, to: tipo } : null,
        estado: estado !== undefined ? { from: datosAnteriores.estado, to: estado } : null
      }
    }
  });
});

// @desc    Change cell status
// @route   PATCH /api/celdas/:id/estado
// @access  Public
const changeCellStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;
  
  console.log(`[CHANGE CELL STATUS] Cambiando estado de celda con ID: ${id} a: ${estado}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    console.log(`[CHANGE CELL STATUS] ID inválido: ${id}`);
    return res.status(400).json({
      success: false,
      error: 'ID de celda inválido'
    });
  }
  
  if (!estado) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione el nuevo estado'
    });
  }

  // Validar estados permitidos
  const estadosPermitidos = ['Libre', 'Ocupada', 'Mantenimiento'];
  if (!estadosPermitidos.includes(estado)) {
    console.log(`[CHANGE CELL STATUS] Estado inválido: ${estado}`);
    return res.status(400).json({
      success: false,
      error: `Estado de celda inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`
    });
  }

  const celda = new Celda();
  const result = await celda.findById(id);
  
  if (!result || !celda.id) {
    console.log(`[CHANGE CELL STATUS] Celda no encontrada en la base de datos`);
    return res.status(404).json({
      success: false,
      error: `Celda con ID ${id} no encontrada`
    });
  }

  const estadoAnterior = celda.estado;
  console.log(`[CHANGE CELL STATUS] Cambiando estado de '${estadoAnterior}' a '${estado}'`);

  await celda.changeStatus(estado);

  console.log(`[CHANGE CELL STATUS] Estado cambiado exitosamente`);

  res.status(200).json({
    success: true,
    message: 'Estado de celda actualizado exitosamente',
    data: {
      current: celda.toJSON(),
      change: {
        from: estadoAnterior,
        to: estado
      }
    }
  });
});

// @desc    Change cell type
// @route   PATCH /api/celdas/:id/tipo
// @access  Public
const changeCellType = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { tipo } = req.body;
  
  console.log(`[CHANGE CELL TYPE] Cambiando tipo de celda con ID: ${id} a: ${tipo}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    console.log(`[CHANGE CELL TYPE] ID inválido: ${id}`);
    return res.status(400).json({
      success: false,
      error: 'ID de celda inválido'
    });
  }
  
  if (!tipo) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione el nuevo tipo'
    });
  }

  // Validar tipos permitidos
  const tiposPermitidos = ['Carro', 'Moto', 'otro'];
  if (!tiposPermitidos.includes(tipo)) {
    console.log(`[CHANGE CELL TYPE] Tipo inválido: ${tipo}`);
    return res.status(400).json({
      success: false,
      error: `Tipo de celda inválido. Los tipos permitidos son: ${tiposPermitidos.join(', ')}`
    });
  }

  const celda = new Celda();
  const result = await celda.findById(id);
  
  if (!result || !celda.id) {
    console.log(`[CHANGE CELL TYPE] Celda no encontrada en la base de datos`);
    return res.status(404).json({
      success: false,
      error: `Celda con ID ${id} no encontrada`
    });
  }

  const tipoAnterior = celda.tipo;
  console.log(`[CHANGE CELL TYPE] Cambiando tipo de '${tipoAnterior}' a '${tipo}'`);

  celda.tipo = tipo;
  await celda.update();

  console.log(`[CHANGE CELL TYPE] Tipo cambiado exitosamente`);

  res.status(200).json({
    success: true,
    message: 'Tipo de celda actualizado exitosamente',
    data: {
      current: celda.toJSON(),
      change: {
        from: tipoAnterior,
        to: tipo
      }
    }
  });
});

// @desc    Delete cell
// @route   DELETE /api/celdas/:id
// @access  Public
const deleteCell = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  console.log(`[DELETE CELL] Intentando eliminar celda con ID: ${id}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    console.log(`[DELETE CELL] ID inválido: ${id}`);
    return res.status(400).json({
      success: false,
      error: 'ID de celda inválido'
    });
  }

  const celda = new Celda();
  const result = await celda.findById(id);
  
  console.log(`[DELETE CELL] Resultado de búsqueda:`, result ? 'Encontrada' : 'No encontrada');
  console.log(`[DELETE CELL] ID de celda encontrada:`, celda.id);
  
  if (!result || !celda.id) {
    console.log(`[DELETE CELL] Celda no encontrada en la base de datos`);
    return res.status(404).json({
      success: false,
      error: `Celda con ID ${id} no encontrada`
    });
  }

  console.log(`[DELETE CELL] Eliminando celda:`, celda.toJSON());
  await celda.delete();
  console.log(`[DELETE CELL] Celda eliminada exitosamente`);

  res.status(200).json({
    success: true,
    message: 'Celda eliminada exitosamente',
    data: {
      deletedCellId: id
    }
  });
});



// @desc    Get valid cell types and states
// @route   GET /api/celdas/config
// @access  Public
const getCellConfig = asyncHandler(async (req, res) => {
  console.log(`[GET CELL CONFIG] Enviando configuración de celdas`);
  
  res.status(200).json({
    success: true,
    message: 'Configuración de celdas obtenida exitosamente',
    data: {
      types: {
        allowed: ['Carro', 'Moto', 'otro'],
        default: 'Carro',
        description: 'Tipos de vehículos permitidos en las celdas'
      },
      states: {
        allowed: ['Libre', 'Ocupada', 'Mantenimiento'],
        default: 'Libre',
        description: 'Estados posibles de las celdas de parqueo'
      },
      validation: {
        tipo: {
          required: true,
          type: 'string',
          enum: ['Carro', 'Moto', 'otro']
        },
        estado: {
          required: false,
          type: 'string',
          enum: ['Libre', 'Ocupada', 'Mantenimiento'],
          default: 'Libre'
        }
      }
    }
  });
});

// @desc    Debug endpoint to check if cell exists
// @route   GET /api/celdas/debug/:id
// @access  Public
const debugCell = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  console.log(`[DEBUG CELL] Verificando existencia de celda con ID: ${id}`);
  
  try {
    // Realizar consulta directa a la base de datos
    const db = require('../config/DatabaseConnection');
    const dbInstance = new db();
    const result = await dbInstance.executeQuery('SELECT * FROM CELDA WHERE id = ?', [id]);
    
    console.log(`[DEBUG CELL] Resultado de consulta directa:`, result.results);
    
    await dbInstance.close();
    
    res.status(200).json({
      success: true,
      searchedId: id,
      sqlResult: result.results,
      found: result.results.length > 0,
      message: result.results.length > 0 ? 'Celda encontrada en base de datos' : 'Celda NO encontrada en base de datos'
    });
  } catch (error) {
    console.error(`[DEBUG CELL] Error:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = {
  getCells,
  getCell,
  getCellsByType,
  getCellsByStatus,
  getAvailableCellsByType,
  getCellStatistics,
  getCellConfig,
  createCell,
  updateCell,
  changeCellStatus,
  changeCellType,
  deleteCell,
  debugCell
}; 