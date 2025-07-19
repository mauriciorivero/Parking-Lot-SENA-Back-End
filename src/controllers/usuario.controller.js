const { Usuario } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all users
// @route   GET /api/usuarios
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, estado, perfil_usuario_id } = req.query;
  
  let users = await Usuario.findAll();
  
  // Filter by status if provided
  if (estado) {
    users = users.filter(user => user.estado === estado);
  }
  
  // Filter by profile if provided
  if (perfil_usuario_id) {
    users = users.filter(user => user.perfil_usuario_id == perfil_usuario_id);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = users.slice(startIndex, endIndex);
  
  res.status(200).json({
    success: true,
    count: paginatedUsers.length,
    total: users.length,
    pagination: {
      current: page,
      pages: Math.ceil(users.length / limit)
    },
    data: paginatedUsers.map(user => user.toJSON())
  });
});

// @desc    Get single user
// @route   GET /api/usuarios/:id
// @access  Public
const getUser = asyncHandler(async (req, res) => {
  const usuario = new Usuario();
  await usuario.findById(req.params.id);
  
  if (!usuario.id_usuario) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }
  
  res.status(200).json({
    success: true,
    data: usuario.toJSON()
  });
});

// @desc    Get user by document
// @route   GET /api/usuarios/documento/:numero_documento
// @access  Public
const getUserByDocument = asyncHandler(async (req, res) => {
  const usuario = new Usuario();
  await usuario.findByDocument(req.params.numero_documento);
  
  if (!usuario.id_usuario) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado con ese número de documento'
    });
  }
  
  res.status(200).json({
    success: true,
    data: usuario.toJSON()
  });
});

// @desc    Create new user
// @route   POST /api/usuarios
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  const {
    tipo_documento,
    numero_documento,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    direccion_correo,
    numero_celular,
    foto_perfil,
    estado,
    clave,
    perfil_usuario_id
  } = req.body;

  // Validate required fields
  if (!tipo_documento || !numero_documento || !primer_nombre || !primer_apellido || !direccion_correo || !clave || !perfil_usuario_id) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione todos los campos requeridos'
    });
  }

  // Check if user with document already exists
  const existingUser = new Usuario();
  await existingUser.findByDocument(numero_documento);
  
  if (existingUser.id_usuario) {
    return res.status(409).json({
      success: false,
      error: 'Ya existe un usuario con ese número de documento'
    });
  }

  const usuario = new Usuario(
    null,
    tipo_documento,
    numero_documento,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    direccion_correo,
    numero_celular,
    foto_perfil,
    estado || 'activo',
    clave,
    perfil_usuario_id
  );

  await usuario.create();

  res.status(201).json({
    success: true,
    data: usuario.toJSON()
  });
});

// @desc    Update user
// @route   PUT /api/usuarios/:id
// @access  Public
const updateUser = asyncHandler(async (req, res) => {
  const usuario = new Usuario();
  await usuario.findById(req.params.id);
  
  if (!usuario.id_usuario) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }

  // Update fields if provided
  const fieldsToUpdate = [
    'tipo_documento', 'numero_documento', 'primer_nombre', 'segundo_nombre',
    'primer_apellido', 'segundo_apellido', 'direccion_correo', 'numero_celular',
    'foto_perfil', 'estado', 'clave', 'perfil_usuario_id'
  ];

  fieldsToUpdate.forEach(field => {
    if (req.body[field] !== undefined) {
      usuario[field] = req.body[field];
    }
  });

  await usuario.update();

  res.status(200).json({
    success: true,
    data: usuario.toJSON()
  });
});

// @desc    Delete user
// @route   DELETE /api/usuarios/:id
// @access  Public
const deleteUser = asyncHandler(async (req, res) => {
  const usuario = new Usuario();
  await usuario.findById(req.params.id);
  
  if (!usuario.id_usuario) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }

  await usuario.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Login user
// @route   POST /api/usuarios/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { direccion_correo, clave } = req.body;

  // Validate required fields
  if (!direccion_correo || !clave) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione email y contraseña'
    });
  }

  try {
    // Use the new validateLogin method
    const loginResult = await Usuario.validateLogin(direccion_correo, clave);
    
    if (loginResult.success) {
      res.status(200).json({
        success: true,
        message: loginResult.message,
        data: {
          user: loginResult.user
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: loginResult.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante el login'
    });
  }
});

// @desc    Get user by email
// @route   GET /api/usuarios/email/:email
// @access  Public
const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.params.email;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email es requerido'
    });
  }

  try {
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado con ese email'
      });
    }

    res.status(200).json({
      success: true,
      data: usuario.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get user by identifier (email or document)
// @route   GET /api/usuarios/buscar/:identifier
// @access  Public
const getUserByIdentifier = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;
  
  if (!identifier) {
    return res.status(400).json({
      success: false,
      error: 'Identificador es requerido'
    });
  }

  try {
    const usuario = await Usuario.findByLoginIdentifier(identifier);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado con ese identificador (email o documento)'
      });
    }

    res.status(200).json({
      success: true,
      data: usuario.toJSON(),
      info: {
        tipo_busqueda: identifier.includes('@') ? 'email' : 'documento',
        identificador_usado: identifier
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update user status only
// @route   PUT /api/usuarios/:id/estado
// @access  Public  
const updateUserStatus = asyncHandler(async (req, res) => {
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({
      success: false,
      error: 'Estado es requerido'
    });
  }

  // Validar estados permitidos
  const estadosPermitidos = ['activo', 'inactivo', 'suspendido', 'bloqueado'];
  if (!estadosPermitidos.includes(estado.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Estado inválido. Estados permitidos: ${estadosPermitidos.join(', ')}`
    });
  }

  try {
    const usuario = new Usuario();
    await usuario.findById(req.params.id);
    
    if (!usuario.id_usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const estadoAnterior = usuario.estado;
    usuario.estado = estado;
    await usuario.update();

    res.status(200).json({
      success: true,
      message: 'Estado del usuario actualizado exitosamente',
      data: usuario.toJSON(),
      cambio: {
        estado_anterior: estadoAnterior,
        estado_nuevo: estado
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get user configuration
// @route   GET /api/usuarios/config
// @access  Public
const getUserConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Configuración de usuarios obtenida exitosamente',
    data: {
      tipos_documento: {
        allowed: ['cedula', 'tarjeta_identidad', 'cedula_extranjeria', 'pasaporte'],
        descriptions: {
          'cedula': 'Cédula de Ciudadanía',
          'tarjeta_identidad': 'Tarjeta de Identidad',
          'cedula_extranjeria': 'Cédula de Extranjería',
          'pasaporte': 'Pasaporte'
        }
      },
      estados: {
        allowed: ['activo', 'inactivo', 'suspendido', 'bloqueado'],
        descriptions: {
          'activo': 'Usuario activo y con acceso completo',
          'inactivo': 'Usuario inactivo temporalmente',
          'suspendido': 'Usuario suspendido por políticas',
          'bloqueado': 'Usuario bloqueado por seguridad'
        },
        default: 'activo'
      },
      campos: {
        tipo_documento: {
          required: true,
          type: 'string',
          enum: ['cedula', 'tarjeta_identidad', 'cedula_extranjeria', 'pasaporte']
        },
        numero_documento: {
          required: true,
          type: 'string',
          unique: true,
          min_length: 6,
          max_length: 20
        },
        primer_nombre: {
          required: true,
          type: 'string',
          min_length: 2,
          max_length: 50
        },
        segundo_nombre: {
          required: false,
          type: 'string',
          max_length: 50
        },
        primer_apellido: {
          required: true,
          type: 'string',
          min_length: 2,
          max_length: 50
        },
        segundo_apellido: {
          required: false,
          type: 'string',
          max_length: 50
        },
        direccion_correo: {
          required: true,
          type: 'email',
          unique: true,
          format: 'email_valido@dominio.com'
        },
        numero_celular: {
          required: false,
          type: 'string',
          format: 'internacional (+57) o nacional (3001234567)',
          min_length: 10,
          max_length: 15
        },
        foto_perfil: {
          required: false,
          type: 'url',
          description: 'URL de la imagen de perfil'
        },
        clave: {
          required: true,
          type: 'string',
          min_length: 6,
          max_length: 100,
          encryption: 'MD5',
          description: 'Se encripta automáticamente con MD5'
        },
        perfil_usuario_id: {
          required: true,
          type: 'integer',
          description: 'ID del perfil de usuario asociado'
        }
      },
      endpoints: {
        obtener_todos: 'GET /api/usuarios',
        obtener_por_id: 'GET /api/usuarios/:id',
        obtener_por_documento: 'GET /api/usuarios/documento/:numero_documento',
        obtener_por_email: 'GET /api/usuarios/email/:email',
        buscar_por_identificador: 'GET /api/usuarios/buscar/:identifier',
        crear: 'POST /api/usuarios',
        login: 'POST /api/usuarios/login',
        actualizar: 'PUT /api/usuarios/:id',
        actualizar_estado: 'PUT /api/usuarios/:id/estado',
        eliminar: 'DELETE /api/usuarios/:id',
        configuracion: 'GET /api/usuarios/config'
      }
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  getUserByDocument,
  getUserByEmail,
  getUserByIdentifier,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  loginUser,
  getUserConfig
}; 