const express = require('express');
const { AccesoSalida } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

// GET /api/accesos-salidas/config - Obtener configuración válida
router.get('/config', asyncHandler(async (req, res) => {
  console.log(`[GET ACCESOS-SALIDAS CONFIG] Enviando configuración`);
  
  res.status(200).json({
    success: true,
    message: 'Configuración de accesos-salidas obtenida exitosamente',
    data: {
      movimientos: {
        allowed: ['Entrada', 'Salida'],
        description: 'Tipos de movimiento permitidos en el sistema'
      },
      funcionalidades: {
        calculo_automatico: {
          descripcion: 'Para movimiento "Salida", el tiempo_estadia se calcula automáticamente',
          formula: 'fecha_hora_salida - fecha_hora_ultima_entrada (en segundos)',
          validaciones: [
            'El vehículo debe tener un registro de entrada previo',
            'No se permite registrar salida sin entrada',
            'No se permite registrar entrada si ya existe una entrada activa'
          ]
        },
        validacion_estado: {
          descripcion: 'El sistema valida el estado del vehículo antes de registrar movimientos',
          endpoint_consulta: '/api/accesos-salidas/estado-vehiculo/:vehiculo_id'
        }
      },
      campos: {
        movimiento: {
          required: true,
          type: 'string',
          enum: ['Entrada', 'Salida'],
          description: 'Tipo de movimiento. Para "Salida" se calcula tiempo_estadia automáticamente'
        },
        fecha_hora: {
          required: false,
          type: 'datetime',
          description: 'Se usará fecha/hora actual si no se proporciona',
          formato: 'ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)'
        },
        puerta: {
          required: false,
          type: 'string',
          description: 'Identificador de la puerta de acceso'
        },
        tiempo_estadia: {
          required: false,
          type: 'integer',
          description: 'Para "Entrada": Opcional, acepta 0. Para "Salida": Se calcula automáticamente',
          minimum: 0,
          unidad: 'segundos',
          nota: 'Este campo se ignora para movimiento "Salida" y se calcula automáticamente'
        },
        vehiculo_id: {
          required: true,
          type: 'integer',
          description: 'ID del vehículo asociado al registro'
        }
      },
      respuestas_especiales: {
        salida_exitosa: {
          descripcion: 'Incluye información adicional sobre el tiempo calculado',
          campos_extra: ['tiempo_calculado.tiempo_estadia_segundos', 'tiempo_calculado.tiempo_estadia_minutos', 'tiempo_calculado.tiempo_estadia_horas']
        },
        codigos_error: {
          'ENTRADA_DUPLICADA': 'El vehículo ya tiene una entrada activa',
          'SIN_ENTRADA_PREVIA': 'No se puede registrar salida sin entrada previa',
          'INCONSISTENCIA_DATOS': 'Error de datos, contactar administrador'
        }
      }
    }
  });
}));

// GET /api/accesos-salidas - Obtener todos los accesos/salidas
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, movimiento, vehiculo_id } = req.query;
  
  console.log(`[GET ACCESOS-SALIDAS] Parámetros de consulta:`, {
    page, limit, movimiento, vehiculo_id
  });
  
  let accesos = await AccesoSalida.findAll();
  
  // Filtrar por movimiento si se proporciona
  if (movimiento) {
    accesos = accesos.filter(acceso => acceso.movimiento === movimiento);
    console.log(`[GET ACCESOS-SALIDAS] Filtrado por movimiento '${movimiento}': ${accesos.length} registros`);
  }
  
  // Filtrar por vehículo si se proporciona
  if (vehiculo_id) {
    accesos = accesos.filter(acceso => acceso.vehiculo_id == vehiculo_id);
    console.log(`[GET ACCESOS-SALIDAS] Filtrado por vehiculo_id '${vehiculo_id}': ${accesos.length} registros`);
  }
  
  // Paginación
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedAccesos = accesos.slice(startIndex, endIndex);
  
  console.log(`[GET ACCESOS-SALIDAS] Paginación: página ${page}, límite ${limit}, total ${accesos.length}`);
  
  res.status(200).json({
    success: true,
    count: paginatedAccesos.length,
    total: accesos.length,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(accesos.length / limit)
    },
    data: paginatedAccesos.map(acceso => acceso.toJSON())
  });
}));

// GET /api/accesos-salidas/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  console.log(`[GET ACCESO-SALIDA] Buscando registro con ID: ${id}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'ID de registro inválido'
    });
  }

  const acceso = new AccesoSalida();
  const result = await acceso.findById(id);
  
  if (!result || !acceso.id) {
    console.log(`[GET ACCESO-SALIDA] Registro no encontrado con ID: ${id}`);
    return res.status(404).json({
      success: false,
      error: `Registro de acceso/salida con ID ${id} no encontrado`
    });
  }
  
  console.log(`[GET ACCESO-SALIDA] Registro encontrado:`, acceso.toJSON());
  
  res.status(200).json({
    success: true,
    data: acceso.toJSON()
  });
}));

// POST /api/accesos-salidas
router.post('/', asyncHandler(async (req, res) => {
  const { movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id } = req.body;

  console.log(`[POST ACCESO-SALIDA] Datos recibidos:`, {
    movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id
  });
  
  console.log(`[POST ACCESO-SALIDA] Tipos de datos:`, {
    movimiento: typeof movimiento,
    fecha_hora: typeof fecha_hora,
    puerta: typeof puerta,
    tiempo_estadia: typeof tiempo_estadia,
    tiempo_estadia_value: tiempo_estadia,
    vehiculo_id: typeof vehiculo_id
  });

  if (!movimiento || !vehiculo_id) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione movimiento y ID del vehículo'
    });
  }

  // Validar que vehiculo_id sea un número válido
  if (!Number.isInteger(Number(vehiculo_id))) {
    return res.status(400).json({
      success: false,
      error: 'El ID del vehículo debe ser un número válido'
    });
  }

  // Variables para el procesamiento
  let fechaHoraFinal = fecha_hora ? new Date(fecha_hora) : new Date();
  let tiempoEstadiaFinal = tiempo_estadia !== undefined ? tiempo_estadia : null;

  // VALIDACIONES ADICIONALES SEGÚN EL TIPO DE MOVIMIENTO
  if (movimiento === 'Entrada') {
    console.log(`[POST ACCESO-SALIDA] Procesando ENTRADA - Verificando estado del vehículo...`);
    
    // Verificar si el vehículo ya tiene una entrada sin salida
    const tieneEntradaSinSalida = await AccesoSalida.tieneEntradaSinSalida(parseInt(vehiculo_id));
    
    if (tieneEntradaSinSalida) {
      console.log(`[POST ACCESO-SALIDA] Vehículo ${vehiculo_id} ya tiene una entrada sin salida registrada`);
      return res.status(400).json({
        success: false,
        error: `El vehículo ${vehiculo_id} ya tiene un registro de entrada activo. Debe registrar la salida antes de una nueva entrada.`,
        codigo: 'ENTRADA_DUPLICADA'
      });
    }
    
    console.log(`[POST ACCESO-SALIDA] Vehículo ${vehiculo_id} puede registrar entrada`);
  }

  // LÓGICA ESPECIAL PARA SALIDAS: Calcular tiempo de estadía automáticamente
  if (movimiento === 'Salida') {
    console.log(`[POST ACCESO-SALIDA] Procesando SALIDA - Calculando tiempo de estadía...`);
    
    try {
      // Verificar que el vehículo tenga una entrada sin salida
      const tieneEntradaSinSalida = await AccesoSalida.tieneEntradaSinSalida(parseInt(vehiculo_id));
      
      if (!tieneEntradaSinSalida) {
        console.log(`[POST ACCESO-SALIDA] Vehículo ${vehiculo_id} no tiene entrada activa para salida`);
        return res.status(400).json({
          success: false,
          error: `El vehículo ${vehiculo_id} no tiene un registro de entrada activo. No se puede registrar la salida.`,
          codigo: 'SIN_ENTRADA_PREVIA'
        });
      }

      // Buscar la última entrada para este vehículo
      const ultimaEntrada = await AccesoSalida.findUltimaEntradaPorVehiculo(parseInt(vehiculo_id));
      
      if (!ultimaEntrada) {
        console.log(`[POST ACCESO-SALIDA] Error: Inconsistencia de datos para vehículo ${vehiculo_id}`);
        return res.status(500).json({
          success: false,
          error: `Error de inconsistencia de datos. Por favor contacte al administrador.`,
          codigo: 'INCONSISTENCIA_DATOS'
        });
      }

      console.log(`[POST ACCESO-SALIDA] Última entrada encontrada:`, {
        id: ultimaEntrada.id,
        fecha_hora: ultimaEntrada.fecha_hora,
        movimiento: ultimaEntrada.movimiento
      });

      // Calcular diferencia en segundos
      const fechaEntrada = new Date(ultimaEntrada.fecha_hora);
      const fechaSalida = fechaHoraFinal;
      
      const diferenciaMs = fechaSalida.getTime() - fechaEntrada.getTime();
      const diferenciaSegundos = Math.floor(diferenciaMs / 1000);

      console.log(`[POST ACCESO-SALIDA] Cálculo de tiempo:`, {
        fecha_entrada: fechaEntrada.toISOString(),
        fecha_salida: fechaSalida.toISOString(),
        diferencia_ms: diferenciaMs,
        diferencia_segundos: diferenciaSegundos
      });

      // Validar que la diferencia sea positiva
      if (diferenciaSegundos < 0) {
        return res.status(400).json({
          success: false,
          error: 'La fecha/hora de salida no puede ser anterior a la fecha/hora de entrada'
        });
      }

      // Asignar el tiempo calculado
      tiempoEstadiaFinal = diferenciaSegundos;
      
      console.log(`[POST ACCESO-SALIDA] Tiempo de estadía calculado: ${tiempoEstadiaFinal} segundos`);

    } catch (error) {
      console.error(`[POST ACCESO-SALIDA] Error calculando tiempo de estadía:`, error);
      return res.status(500).json({
        success: false,
        error: 'Error al calcular el tiempo de estadía: ' + error.message
      });
    }
  } else {
    console.log(`[POST ACCESO-SALIDA] Procesando ENTRADA - No se calcula tiempo de estadía`);
  }

  // Construir el objeto con los parámetros en el orden correcto
  const acceso = new AccesoSalida(
    null,                              // id
    movimiento,                        // movimiento
    fechaHoraFinal,                    // fecha_hora
    puerta || null,                    // puerta
    tiempoEstadiaFinal,                // tiempo_estadia (calculado automáticamente para salidas)
    parseInt(vehiculo_id)              // vehiculo_id (asegurar que sea número)
  );

  console.log(`[POST ACCESO-SALIDA] Objeto AccesoSalida creado:`, acceso.toJSON());

  await acceso.create();

  console.log(`[POST ACCESO-SALIDA] Registro creado exitosamente con ID: ${acceso.id}`);

  res.status(201).json({
    success: true,
    message: movimiento === 'Salida' 
      ? `Registro de salida creado exitosamente. Tiempo de estadía: ${tiempoEstadiaFinal} segundos` 
      : 'Registro de entrada creado exitosamente',
    data: acceso.toJSON(),
    ...(movimiento === 'Salida' && {
      tiempo_calculado: {
        tiempo_estadia_segundos: tiempoEstadiaFinal,
        tiempo_estadia_minutos: Math.floor(tiempoEstadiaFinal / 60),
        tiempo_estadia_horas: Math.floor(tiempoEstadiaFinal / 3600)
      }
    })
  });
}));

// GET /api/accesos-salidas/vehiculo/:vehiculo_id - Obtener registros por vehículo
router.get('/vehiculo/:vehiculo_id', asyncHandler(async (req, res) => {
  const vehiculo_id = req.params.vehiculo_id;
  
  console.log(`[GET ACCESOS-SALIDAS POR VEHICULO] Buscando registros para vehículo ID: ${vehiculo_id}`);
  
  // Validar que el ID sea un número válido
  if (!vehiculo_id || isNaN(parseInt(vehiculo_id))) {
    return res.status(400).json({
      success: false,
      error: 'ID de vehículo inválido'
    });
  }

  const accesos = await AccesoSalida.findByVehicleId(parseInt(vehiculo_id));
  
  console.log(`[GET ACCESOS-SALIDAS POR VEHICULO] Encontrados ${accesos.length} registros para vehículo ${vehiculo_id}`);
  
  res.status(200).json({
    success: true,
    count: accesos.length,
    vehiculo_id: parseInt(vehiculo_id),
    data: accesos.map(acceso => acceso.toJSON())
  });
}));

// PUT /api/accesos-salidas/:id - Actualizar registro
router.put('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id } = req.body;
  
  console.log(`[PUT ACCESO-SALIDA] Actualizando registro ID ${id} con datos:`, {
    movimiento, fecha_hora, puerta, tiempo_estadia, vehiculo_id
  });
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'ID de registro inválido'
    });
  }

  // Buscar el registro existente
  const acceso = new AccesoSalida();
  const result = await acceso.findById(id);
  
  if (!result || !acceso.id) {
    return res.status(404).json({
      success: false,
      error: `Registro de acceso/salida con ID ${id} no encontrado`
    });
  }

  // Actualizar solo los campos proporcionados
  if (movimiento !== undefined) acceso.movimiento = movimiento;
  if (fecha_hora !== undefined) acceso.fecha_hora = fecha_hora;
  if (puerta !== undefined) acceso.puerta = puerta;
  if (tiempo_estadia !== undefined) {
    console.log(`[PUT ACCESO-SALIDA] Actualizando tiempo_estadia - Tipo: ${typeof tiempo_estadia}, Valor: ${tiempo_estadia}`);
    acceso.tiempo_estadia = tiempo_estadia;
  }
  if (vehiculo_id !== undefined) acceso.vehiculo_id = parseInt(vehiculo_id);

  await acceso.update();

  console.log(`[PUT ACCESO-SALIDA] Registro actualizado exitosamente:`, acceso.toJSON());

  res.status(200).json({
    success: true,
    message: 'Registro actualizado exitosamente',
    data: acceso.toJSON()
  });
}));

// DELETE /api/accesos-salidas/:id - Eliminar registro
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  console.log(`[DELETE ACCESO-SALIDA] Eliminando registro con ID: ${id}`);
  
  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'ID de registro inválido'
    });
  }

  // Buscar el registro existente
  const acceso = new AccesoSalida();
  const result = await acceso.findById(id);
  
  if (!result || !acceso.id) {
    return res.status(404).json({
      success: false,
      error: `Registro de acceso/salida con ID ${id} no encontrado`
    });
  }

  await acceso.delete();

  console.log(`[DELETE ACCESO-SALIDA] Registro eliminado exitosamente`);

  res.status(200).json({
    success: true,
    message: 'Registro eliminado exitosamente',
    data: {
      deletedId: parseInt(id)
    }
  });
}));

// GET /api/accesos-salidas/estado-vehiculo/:vehiculo_id - Consultar estado actual del vehículo
router.get('/estado-vehiculo/:vehiculo_id', asyncHandler(async (req, res) => {
  const vehiculo_id = req.params.vehiculo_id;
  
  console.log(`[ESTADO VEHICULO] Consultando estado para vehículo ID: ${vehiculo_id}`);
  
  // Validar que el ID sea un número válido
  if (!vehiculo_id || isNaN(parseInt(vehiculo_id))) {
    return res.status(400).json({
      success: false,
      error: 'ID de vehículo inválido'
    });
  }

  try {
    // Verificar si tiene entrada sin salida
    const tieneEntradaSinSalida = await AccesoSalida.tieneEntradaSinSalida(parseInt(vehiculo_id));
    
    let estadoInfo = {
      vehiculo_id: parseInt(vehiculo_id),
      estado: tieneEntradaSinSalida ? 'DENTRO' : 'FUERA',
      descripcion: tieneEntradaSinSalida 
        ? 'El vehículo está actualmente dentro del parqueadero' 
        : 'El vehículo no está en el parqueadero o ya registró su salida'
    };

    // Si está dentro, obtener información de la entrada
    if (tieneEntradaSinSalida) {
      const ultimaEntrada = await AccesoSalida.findUltimaEntradaPorVehiculo(parseInt(vehiculo_id));
      
      if (ultimaEntrada) {
        const fechaEntrada = new Date(ultimaEntrada.fecha_hora);
        const ahora = new Date();
        const tiempoTranscurrido = Math.floor((ahora.getTime() - fechaEntrada.getTime()) / 1000);
        
        estadoInfo.ultima_entrada = {
          id_registro: ultimaEntrada.id,
          fecha_hora: ultimaEntrada.fecha_hora,
          puerta: ultimaEntrada.puerta,
          tiempo_transcurrido_segundos: tiempoTranscurrido,
          tiempo_transcurrido_minutos: Math.floor(tiempoTranscurrido / 60),
          tiempo_transcurrido_horas: Math.floor(tiempoTranscurrido / 3600)
        };
      }
    }

    // Obtener historial reciente
    const historialReciente = await AccesoSalida.findByVehicleId(parseInt(vehiculo_id));
    const ultimosCincoRegistros = historialReciente
      .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
      .slice(0, 5);

    estadoInfo.historial_reciente = ultimosCincoRegistros.map(registro => ({
      id: registro.id,
      movimiento: registro.movimiento,
      fecha_hora: registro.fecha_hora,
      tiempo_estadia: registro.tiempo_estadia,
      puerta: registro.puerta
    }));

    console.log(`[ESTADO VEHICULO] Estado consultado:`, estadoInfo);

    res.status(200).json({
      success: true,
      data: estadoInfo
    });

  } catch (error) {
    console.error(`[ESTADO VEHICULO] Error:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al consultar el estado del vehículo: ' + error.message
    });
  }
}));

module.exports = router; 