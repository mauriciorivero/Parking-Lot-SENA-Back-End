const { Vehiculo } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all vehicles
// @route   GET /api/vehiculos
// @access  Public
const getVehicles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tipo, usuario_id } = req.query;
  
  let vehicles = await Vehiculo.findAll();
  
  // Filter by type if provided
  if (tipo) {
    vehicles = vehicles.filter(vehicle => vehicle.tipo === tipo);
  }
  
  // Filter by user if provided
  if (usuario_id) {
    vehicles = vehicles.filter(vehicle => vehicle.usuario_id == usuario_id);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedVehicles = vehicles.slice(startIndex, endIndex);
  
  res.status(200).json({
    success: true,
    count: paginatedVehicles.length,
    total: vehicles.length,
    pagination: {
      current: page,
      pages: Math.ceil(vehicles.length / limit)
    },
    data: paginatedVehicles.map(vehicle => vehicle.toJSON())
  });
});

// @desc    Get single vehicle
// @route   GET /api/vehiculos/:id
// @access  Public
const getVehicle = asyncHandler(async (req, res) => {
  const vehiculo = new Vehiculo();
  await vehiculo.findById(req.params.id);
  
  if (!vehiculo.id_vehiculo) {
    return res.status(404).json({
      success: false,
      error: 'Vehículo no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    data: vehiculo.toJSON()
  });
});

// @desc    Get vehicle by plate
// @route   GET /api/vehiculos/placa/:placa
// @access  Public
const getVehicleByPlate = asyncHandler(async (req, res) => {
  const placa = req.params.placa;
  
  console.log(`[GET VEHICLE BY PLATE] Buscando vehículo con placa: "${placa}"`);
  
  try {
    // Usar el método estático mejorado para buscar por placa
    const vehiculo = await Vehiculo.findByPlacaStatic(placa);
    
    if (!vehiculo || !vehiculo.id) {
      console.log(`[GET VEHICLE BY PLATE] Vehículo no encontrado con placa: "${placa}"`);
      return res.status(404).json({
        success: false,
        error: `Vehículo no encontrado con la placa: ${placa}`
      });
    }
    
    console.log(`[GET VEHICLE BY PLATE] Vehículo encontrado:`, vehiculo.toJSON());
    
    res.status(200).json({
      success: true,
      data: vehiculo.toJSON()
    });
  } catch (error) {
    console.error(`[GET VEHICLE BY PLATE] Error:`, error);
    
    // Si es un error de validación, enviar 400 en lugar de 500
    if (error.message.includes('placa') && (
        error.message.includes('requerida') || 
        error.message.includes('string válido') || 
        error.message.includes('caracteres') ||
        error.message.includes('contener')
      )) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    throw error; // Re-throw para otros errores
  }
});

// @desc    Get vehicles by user ID
// @route   GET /api/vehiculos/usuario/:usuario_id
// @access  Public
const getVehiclesByUser = asyncHandler(async (req, res) => {
  const vehicles = await Vehiculo.findByUserId(req.params.usuario_id);
  
  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles.map(vehicle => vehicle.toJSON())
  });
});

// @desc    Create new vehicle
// @route   POST /api/vehiculos
// @access  Public
const createVehicle = asyncHandler(async (req, res) => {
  const {
    placa,
    color,
    año,
    marca,
    tipo,
    usuario_id
  } = req.body;

  console.log(`[CREATE VEHICLE] Creando vehículo con datos:`, {
    placa, color, año, marca, tipo, usuario_id
  });

  // Validate required fields
  if (!placa || !color || !año || !marca || !tipo || !usuario_id) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione todos los campos requeridos: placa, color, año, marca, tipo, usuario_id'
    });
  }

  try {
    // Las validaciones de placa y verificación de duplicados ahora se manejan en el modelo
    const vehiculo = new Vehiculo(
      null,
      placa,
      color,
      año,
      marca,
      tipo,
      usuario_id
    );

    await vehiculo.create();

    console.log(`[CREATE VEHICLE] Vehículo creado exitosamente:`, vehiculo.toJSON());

    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: vehiculo.toJSON()
    });
  } catch (error) {
    console.error(`[CREATE VEHICLE] Error:`, error);
    
    // Manejar errores específicos de validación de placa
    if (error.message.includes('placa') && (
        error.message.includes('requerida') || 
        error.message.includes('string válido') || 
        error.message.includes('caracteres') ||
        error.message.includes('contener')
      )) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    // Manejar error de placa duplicada
    if (error.message.includes('Ya existe un vehículo registrado con la placa')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    
    throw error; // Re-throw para otros errores
  }
});

// @desc    Update vehicle
// @route   PUT /api/vehiculos/:id
// @access  Public
const updateVehicle = asyncHandler(async (req, res) => {
  const vehiculo = new Vehiculo();
  await vehiculo.findById(req.params.id);
  
  if (!vehiculo.id_vehiculo) {
    return res.status(404).json({
      success: false,
      error: 'Vehículo no encontrado'
    });
  }

  // Update fields if provided
  const fieldsToUpdate = ['placa', 'color', 'año', 'marca', 'tipo', 'usuario_id'];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      vehiculo[field] = req.body[field];
    }
  });

  await vehiculo.update();

  res.status(200).json({
    success: true,
    data: vehiculo.toJSON()
  });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehiculos/:id
// @access  Public
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehiculo = new Vehiculo();
  await vehiculo.findById(req.params.id);
  
  if (!vehiculo.id_vehiculo) {
    return res.status(404).json({
      success: false,
      error: 'Vehículo no encontrado'
    });
  }

  await vehiculo.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getVehicles,
  getVehicle,
  getVehicleByPlate,
  getVehiclesByUser,
  createVehicle,
  updateVehicle,
  deleteVehicle
}; 