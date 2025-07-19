const express = require('express');
const {
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
} = require('../controllers/usuario.controller');

const router = express.Router();

// NOTA: El orden de las rutas es importante para evitar conflictos
// Las rutas más específicas deben ir antes que las más generales

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', getUsers);

// GET /api/usuarios/config - Obtener configuración de usuarios
router.get('/config', getUserConfig);

// GET /api/usuarios/documento/:numero_documento - Obtener usuario por número de documento
router.get('/documento/:numero_documento', getUserByDocument);

// GET /api/usuarios/email/:email - Obtener usuario por email
router.get('/email/:email', getUserByEmail);

// GET /api/usuarios/buscar/:identifier - Obtener usuario por identificador (email o documento)
router.get('/buscar/:identifier', getUserByIdentifier);

// POST /api/usuarios - Crear usuario
router.post('/', createUser);

// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUser);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', getUser);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', updateUser);

// PUT /api/usuarios/:id/estado - Actualizar solo el estado del usuario
router.put('/:id/estado', updateUserStatus);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', deleteUser);

module.exports = router;
