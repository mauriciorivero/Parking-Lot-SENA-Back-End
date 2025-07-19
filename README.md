# Parking Management System API

Sistema de gestión de parqueaderos con arquitectura de microservicios desarrollado en Node.js, Express y MySQL con ORM manual.

## 🏗️ Arquitectura

Este proyecto está estructurado siguiendo las mejores prácticas de desarrollo de APIs REST con Express.js:

```
src/
├── app.js                 # Configuración principal de Express con CORS mejorado
├── server.js              # Punto de entrada del servidor
├── config/                # Configuraciones
│   ├── DatabaseConnection.js
│   ├── checkDbConnection.js
│   └── environment.js
├── controllers/           # Lógica de negocio
│   ├── usuario.controller.js     # Sistema completo de usuarios + autenticación MD5
│   ├── vehiculo.controller.js    # Gestión mejorada de vehículos
│   ├── celda.controller.js       # Funcionalidades mejoradas
│   └── ...
├── middlewares/          # Middleware personalizado
│   ├── errorHandler.js
│   ├── notFound.js
│   └── asyncHandler.js
├── models/               # Modelos ORM manuales
│   ├── Usuario.js               # Con encriptación MD5, múltiples búsquedas y validateLogin
│   ├── Vehiculo.js              # Búsquedas mejoradas y validaciones de placa
│   ├── Celda.js                 # Funciones corregidas y mejoradas
│   ├── AccesoSalida.js          # Con cálculo automático de tiempo de estadía
│   └── ...
├── routes/               # Definición de rutas
│   ├── usuario.routes.js        # 11 endpoints completos de usuarios
│   ├── vehiculo.routes.js       # Gestión completa de vehículos
│   ├── celda.routes.js          # Endpoints debug y configuración
│   ├── accesoSalida.routes.js   # Con cálculo automático y estado de vehículos
│   └── ...
├── services/             # Servicios de negocio (futuro)
├── utils/                # Utilidades (futuro)
└── validators/           # Validadores (futuro)
```

## 🚀 Características Principales

- **API REST completa** con todos los métodos HTTP
- **Arquitectura de microservicios** lista para escalabilidad
- **ORM manual** con operaciones CRUD completas
- **🔐 Autenticación MD5** - Sistema seguro de login de usuarios
- **🌐 CORS optimizado** - Acceso desde cualquier dominio/puerto (incluyendo localhost:5175, 5174)
- **🛡️ Middleware de seguridad** (Helmet, CORS, Rate Limiting)
- **📝 Sistema de logging** - Para debugging y monitoreo
- **✅ Validaciones robustas** - Para tipos y estados de celdas
- **🔧 Endpoints de debug** - Para troubleshooting
- **📊 Configuración dinámica** - Obtener tipos y estados válidos
- **🚗 Gestión completa de celdas** - Crear, actualizar tipo/estado, eliminar
- **⏱️ Cálculo automático de tiempo de estadía** - Para salidas de vehículos
- **🚪 Control inteligente de accesos** - Validaciones entrada/salida
- **📍 Estado en tiempo real de vehículos** - Consultar si está dentro/fuera
- **🔍 Búsquedas flexibles** - Por email, documento, identificador universal
- **📱 Compatible con frontends** - React, Vue, Angular en cualquier puerto
- **📄 Paginación** en endpoints de listado
- **🏥 Health checks** para monitoreo
- **☁️ Configuración para despliegue** en Vercel y Render

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL >= 5.7

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/mauriciorivero/ParkingSENABend.git
cd ParkingSENABend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables de entorno
nano .env
```

4. **Configurar la base de datos**
```bash
# Importar el script SQL
mysql -u root -p < Script-SQL-ParkingLot.sql
```

5. **Verificar conexión a la base de datos**
```bash
node src/config/checkDbConnection.js
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 Documentación Completa de API

### 🔗 **URL Base**: `http://localhost:3001`

---

## 🔐 **AUTENTICACIÓN - ENDPOINT PRINCIPAL PARA FRONTEND**

### **⭐ POST** `/api/usuarios/login` - Login de usuario
**🎯 ENDPOINT CLAVE**: Este es el endpoint principal que el frontend debe usar para implementar el sistema de login.

#### **📋 Información Técnica:**
- **URL Completa**: `http://localhost:3001/api/usuarios/login`
- **Método**: `POST`
- **Encriptación**: MD5 automática
- **Validación**: Email y contraseña requeridos

#### **📤 Request (Petición):**

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "direccion_correo": "user@example.com",
  "clave": "mi_password_123"
}
```

#### **📥 Responses (Respuestas):**

**✅ Login Exitoso (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id_usuario": 1,
    "tipo_documento": "cedula",
    "numero_documento": "12345678",
    "primer_nombre": "Juan",
    "segundo_nombre": "Carlos",
    "primer_apellido": "Pérez",
    "segundo_apellido": "González",
    "direccion_correo": "user@example.com",
    "numero_celular": "3001234567",
    "foto_perfil": "https://ejemplo.com/foto.jpg",
    "estado": "activo",
    "perfil_usuario_id": 3
    // 🔒 NOTA: El campo 'clave' NUNCA se retorna por seguridad
  }
}
```

**❌ Errores Posibles:**

```json
// Credenciales inválidas (401)
{
  "success": false,
  "error": "Credenciales inválidas"
}

// Datos faltantes (400)
{
  "success": false,
  "error": "Email y clave son requeridos"
}

// Error del servidor (500)
{
  "success": false,
  "error": "Error interno del servidor durante el login"
}
```

#### **💻 Implementación en Frontend:**

**JavaScript/Fetch:**
```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3001/api/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        direccion_correo: email,
        clave: password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Login exitoso - guardar datos del usuario
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('isLoggedIn', 'true');
      return { success: true, user: data.data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
}

// Uso
const result = await loginUser('user@example.com', 'password123');
```

**React Example:**
```javascript
const [user, setUser] = useState(null);
const [error, setError] = useState('');

const handleLogin = async (email, password) => {
  const result = await loginUser(email, password);
  
  if (result.success) {
    setUser(result.user);
    setError('');
    // Redirigir al dashboard
  } else {
    setError(result.error);
  }
};
```

---

## 👥 **USUARIOS** - `/api/usuarios` *(Sistema Completo - 11 Endpoints)*

### **🆕 GET** `/api/usuarios/config` - Obtener configuración de usuarios
Endpoint para obtener todos los tipos de documento, estados válidos, validaciones y documentación completa.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/usuarios/config
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "tipos_documento": {
      "allowed": ["cedula", "tarjeta_identidad", "cedula_extranjeria", "pasaporte"],
      "descriptions": {
        "cedula": "Cédula de Ciudadanía",
        "tarjeta_identidad": "Tarjeta de Identidad",
        // ...
      }
    },
    "estados": {
      "allowed": ["activo", "inactivo", "suspendido", "bloqueado"],
      "descriptions": { /* descripciones de cada estado */ }
    },
    "campos": { /* validaciones completas de cada campo */ },
    "endpoints": { /* lista de todos los endpoints disponibles */ }
  }
}
```

### **GET** `/api/usuarios` - Obtener todos los usuarios
**Query Parameters (opcionales):**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 10)
- `estado` (string): Filtrar por estado
- `perfil_usuario_id` (number): Filtrar por perfil

**Ejemplo Postman:**
```
GET http://localhost:3001/api/usuarios?page=1&limit=5&estado=activo
```

### **GET** `/api/usuarios/:id` - Obtener usuario por ID

### **GET** `/api/usuarios/documento/:numero_documento` - Obtener usuario por documento

### **🆕 GET** `/api/usuarios/email/:email` - Obtener usuario por email
**Nuevo endpoint** para buscar usuarios específicamente por su dirección de correo electrónico.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/usuarios/email/juan@ejemplo.com
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "direccion_correo": "juan@ejemplo.com",
    "primer_nombre": "Juan",
    // ... otros campos del usuario
  }
}
```

### **🆕 GET** `/api/usuarios/buscar/:identifier` - Búsqueda universal por identificador
**Endpoint inteligente** que busca por email O número de documento automáticamente.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/usuarios/buscar/juan@ejemplo.com
GET http://localhost:3001/api/usuarios/buscar/12345678
```

**Respuesta:**
```json
{
  "success": true,
  "data": { /* datos del usuario */ },
  "info": {
    "tipo_busqueda": "email", // o "documento"
    "identificador_usado": "juan@ejemplo.com"
  }
}
```

### **POST** `/api/usuarios` - Crear nuevo usuario
**💡 Nota**: Las contraseñas se encriptan automáticamente con MD5.

**Body (JSON):**
```json
{
  "tipo_documento": "cedula",
  "numero_documento": "87654321",
  "primer_nombre": "Ana",
  "segundo_nombre": "María",
  "primer_apellido": "García",
  "segundo_apellido": "Rodríguez",
  "direccion_correo": "ana.garcia@email.com",
  "numero_celular": "3009876543",
  "foto_perfil": "ana.jpg",
  "estado": "activo",
  "clave": "mi_password_123",
  "perfil_usuario_id": 2
}
```

### **PUT** `/api/usuarios/:id` - Actualizar usuario completo
**💡 Nota**: Si se actualiza la contraseña, se encripta automáticamente con MD5.

### **🆕 PUT** `/api/usuarios/:id/estado` - Actualizar solo el estado del usuario
**Endpoint específico** para cambiar únicamente el estado sin afectar otros datos.

**Ejemplo Postman:**
```
PUT http://localhost:3001/api/usuarios/5/estado
```

**Body (JSON):**
```json
{
  "estado": "inactivo"  // Estados: activo, inactivo, suspendido, bloqueado
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Estado del usuario actualizado exitosamente",
  "data": { /* usuario actualizado */ },
  "cambio": {
    "estado_anterior": "activo",
    "estado_nuevo": "inactivo"
  }
}
```

### **DELETE** `/api/usuarios/:id` - Eliminar usuario

---

## 🔍 **Búsquedas de Usuarios - Múltiples Opciones**

El sistema ofrece múltiples formas de encontrar usuarios:

```javascript
// Por ID específico
GET /api/usuarios/1

// Por número de documento
GET /api/usuarios/documento/12345678

// Por email específico  
GET /api/usuarios/email/usuario@email.com

// Búsqueda universal (email O documento)
GET /api/usuarios/buscar/usuario@email.com
GET /api/usuarios/buscar/12345678

// Obtener todos con filtros
GET /api/usuarios?estado=activo&perfil_usuario_id=2

// Obtener configuración completa
GET /api/usuarios/config
```

---

## 🅿️ **CELDAS** - `/api/celdas` *(Funcionalidades Mejoradas)*

### **🆕 GET** `/api/celdas/config` - Obtener configuración válida
Endpoint para obtener tipos y estados permitidos para las celdas.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/celdas/config
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Configuración de celdas obtenida exitosamente",
  "data": {
    "types": {
      "allowed": ["Carro", "Moto", "otro"],
      "default": "Carro",
      "description": "Tipos de vehículos permitidos en las celdas"
    },
    "states": {
      "allowed": ["Libre", "Ocupada", "Mantenimiento"],
      "default": "Libre",
      "description": "Estados posibles de las celdas de parqueo"
    },
    "validation": {
      "tipo": {
        "required": true,
        "type": "string",
        "enum": ["Carro", "Moto", "otro"]
      },
      "estado": {
        "required": false,
        "type": "string",
        "enum": ["Libre", "Ocupada", "Mantenimiento"],
        "default": "Libre"
      }
    }
  }
}
```

### **GET** `/api/celdas` - Obtener todas las celdas
**Query Parameters:** `page`, `limit`, `tipo`, `estado`

### **✅ GET** `/api/celdas/:id` - Obtener celda por ID
*Funcionalidad corregida con mejor validación y logging.*

### **GET** `/api/celdas/tipo/:tipo` - Obtener celdas por tipo
**Tipos válidos:** `Carro`, `Moto`, `otro`

### **GET** `/api/celdas/estado/:estado` - Obtener celdas por estado
**Estados válidos:** `Libre`, `Ocupada`, `Mantenimiento`

### **GET** `/api/celdas/disponibles/:tipo` - Obtener celdas disponibles por tipo

### **GET** `/api/celdas/estadisticas/:tipo` - Obtener estadísticas por tipo

### **🆕 GET** `/api/celdas/debug/:id` - Debug de celda específica
Endpoint para troubleshooting y verificación directa en base de datos.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/celdas/debug/1
```

**Respuesta:**
```json
{
  "success": true,
  "searchedId": "1",
  "sqlResult": [...],
  "found": true,
  "message": "Celda encontrada en base de datos"
}
```

### **POST** `/api/celdas` - Crear nueva celda
**✅ Mejorado**: Con validaciones completas de tipos y estados.

**Body (JSON):**
```json
{
  "tipo": "Carro",    // Requerido: "Carro", "Moto", "otro"
  "estado": "Libre"   // Opcional: "Libre" (default), "Ocupada", "Mantenimiento"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Celda creada exitosamente",
  "data": {
    "id": 15,
    "tipo": "Carro",
    "estado": "Libre"
  }
}
```

### **✅ PUT** `/api/celdas/:id` - Actualizar celda completa
**🆕 Mejorado**: Permite cambiar tipo y/o estado con validaciones robustas.

**Body (JSON) - Ambos campos opcionales:**
```json
{
  "tipo": "Moto",      // Opcional: "Carro", "Moto", "otro"
  "estado": "Ocupada"  // Opcional: "Libre", "Ocupada", "Mantenimiento"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Celda actualizada exitosamente",
  "data": {
    "previous": {
      "id": 1,
      "tipo": "Carro",
      "estado": "Libre"
    },
    "current": {
      "id": 1,
      "tipo": "Moto",
      "estado": "Ocupada"
    },
    "changes": {
      "tipo": {
        "from": "Carro",
        "to": "Moto"
      },
      "estado": {
        "from": "Libre",
        "to": "Ocupada"
      }
    }
  }
}
```

### **✅ PATCH** `/api/celdas/:id/estado` - Cambiar solo el estado
**🆕 Mejorado**: Con validaciones y mejor logging.

**Body (JSON):**
```json
{
  "estado": "Mantenimiento"  // Requerido: "Libre", "Ocupada", "Mantenimiento"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Estado de celda actualizado exitosamente",
  "data": {
    "current": {
      "id": 1,
      "tipo": "Carro",
      "estado": "Mantenimiento"
    },
    "change": {
      "from": "Libre",
      "to": "Mantenimiento"
    }
  }
}
```

### **🆕 PATCH** `/api/celdas/:id/tipo` - Cambiar solo el tipo
**Nuevo endpoint** para cambiar únicamente el tipo de celda.

**Ejemplo Postman:**
```
PATCH http://localhost:3001/api/celdas/1/tipo
```

**Body (JSON):**
```json
{
  "tipo": "Moto"  // Requerido: "Carro", "Moto", "otro"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tipo de celda actualizado exitosamente",
  "data": {
    "current": {
      "id": 1,
      "tipo": "Moto",
      "estado": "Libre"
    },
    "change": {
      "from": "Carro",
      "to": "Moto"
    }
  }
}
```

### **✅ DELETE** `/api/celdas/:id` - Eliminar celda
**🔧 Corregido**: Solucionados problemas de búsqueda y eliminación.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Celda eliminada exitosamente",
  "data": {
    "deletedCellId": "1"
  }
}
```

---

## 🚗 **VEHÍCULOS** - `/api/vehiculos`

### **GET** `/api/vehiculos` - Obtener todos los vehículos
**Query Parameters:** `page`, `limit`, `tipo`, `usuario_id`

### **GET** `/api/vehiculos/:id` - Obtener vehículo por ID

### **GET** `/api/vehiculos/placa/:placa` - Obtener vehículo por placa

### **GET** `/api/vehiculos/usuario/:usuario_id` - Obtener vehículos por usuario

### **POST** `/api/vehiculos` - Crear nuevo vehículo

### **PUT** `/api/vehiculos/:id` - Actualizar vehículo

### **DELETE** `/api/vehiculos/:id` - Eliminar vehículo

---

## 🚪 **ACCESOS/SALIDAS** - `/api/accesos-salidas` *(Con Cálculo Automático de Tiempo)*

### **🆕 GET** `/api/accesos-salidas/config` - Obtener configuración de accesos-salidas
Endpoint para obtener la configuración completa del módulo incluyendo información sobre el cálculo automático.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/accesos-salidas/config
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "movimientos": {
      "allowed": ["Entrada", "Salida"],
      "description": "Tipos de movimiento permitidos en el sistema"
    },
    "funcionalidades": {
      "calculo_automatico": {
        "descripcion": "Para movimiento 'Salida', el tiempo_estadia se calcula automáticamente",
        "formula": "fecha_hora_salida - fecha_hora_ultima_entrada (en segundos)",
        "validaciones": [
          "El vehículo debe tener un registro de entrada previo",
          "No se permite registrar salida sin entrada",
          "No se permite registrar entrada si ya existe una entrada activa"
        ]
      }
    },
    "campos": { /* validaciones completas */ },
    "respuestas_especiales": {
      "codigos_error": {
        "ENTRADA_DUPLICADA": "El vehículo ya tiene una entrada activa",
        "SIN_ENTRADA_PREVIA": "No se puede registrar salida sin entrada previa"
      }
    }
  }
}
```

### **GET** `/api/accesos-salidas` - Obtener todos los registros
**Query Parameters:** `page`, `limit`, `movimiento`, `vehiculo_id`

### **GET** `/api/accesos-salidas/:id` - Obtener registro por ID

### **🆕 GET** `/api/accesos-salidas/estado-vehiculo/:vehiculo_id` - Estado actual del vehículo
**Endpoint inteligente** para consultar si un vehículo está dentro o fuera del parqueadero.

**Ejemplo Postman:**
```
GET http://localhost:3001/api/accesos-salidas/estado-vehiculo/30
```

**Respuesta - Vehículo DENTRO:**
```json
{
  "success": true,
  "data": {
    "vehiculo_id": 30,
    "estado": "DENTRO",
    "descripcion": "El vehículo está actualmente dentro del parqueadero",
    "ultima_entrada": {
      "id_registro": 101,
      "fecha_hora": "2024-01-15T10:00:00.000Z",
      "puerta": "Principal",
      "tiempo_transcurrido_segundos": 3600,
      "tiempo_transcurrido_minutos": 60,
      "tiempo_transcurrido_horas": 1
    },
    "historial_reciente": [...]
  }
}
```

**Respuesta - Vehículo FUERA:**
```json
{
  "success": true,
  "data": {
    "vehiculo_id": 30,
    "estado": "FUERA",
    "descripcion": "El vehículo no está en el parqueadero o ya registró su salida",
    "historial_reciente": [...]
  }
}
```

### **⭐ POST** `/api/accesos-salidas` - Crear registro con cálculo automático
**🚀 FUNCIONALIDAD PRINCIPAL**: Para movimiento "Salida", calcula automáticamente el tiempo de estadía.

#### **📋 Funcionamiento:**

**Para ENTRADAS:**
```json
{
  "movimiento": "Entrada",
  "vehiculo_id": 30,
  "puerta": "Principal"
  // tiempo_estadia es opcional para entradas
}
```

**Para SALIDAS (⏱️ Cálculo Automático):**
```json
{
  "movimiento": "Salida",
  "vehiculo_id": 30,
  "puerta": "Principal"
  // ⚠️ tiempo_estadia se IGNORA y se calcula automáticamente
}
```

#### **✅ Respuesta de ENTRADA:**
```json
{
  "success": true,
  "message": "Registro de entrada creado exitosamente",
  "data": {
    "id": 101,
    "movimiento": "Entrada",
    "fecha_hora": "2024-01-15T10:00:00.000Z",
    "puerta": "Principal",
    "tiempo_estadia": null,
    "vehiculo_id": 30
  }
}
```

#### **⭐ Respuesta de SALIDA (con tiempo calculado):**
```json
{
  "success": true,
  "message": "Registro de salida creado exitosamente. Tiempo de estadía: 7200 segundos",
  "data": {
    "id": 102,
    "movimiento": "Salida",
    "fecha_hora": "2024-01-15T12:00:00.000Z",
    "puerta": "Principal",
    "tiempo_estadia": 7200,  // ⭐ CALCULADO AUTOMÁTICAMENTE
    "vehiculo_id": 30
  },
  "tiempo_calculado": {
    "tiempo_estadia_segundos": 7200,
    "tiempo_estadia_minutos": 120,
    "tiempo_estadia_horas": 2
  }
}
```

#### **❌ Validaciones y Errores:**

**Entrada Duplicada:**
```json
{
  "success": false,
  "error": "El vehículo 30 ya tiene un registro de entrada activo. Debe registrar la salida antes de una nueva entrada.",
  "codigo": "ENTRADA_DUPLICADA"
}
```

**Salida Sin Entrada:**
```json
{
  "success": false,
  "error": "El vehículo 30 no tiene un registro de entrada activo. No se puede registrar la salida.",
  "codigo": "SIN_ENTRADA_PREVIA"
}
```

**Fecha Inválida:**
```json
{
  "success": false,
  "error": "La fecha/hora de salida no puede ser anterior a la fecha/hora de entrada"
}
```

### **PUT** `/api/accesos-salidas/:id` - Actualizar registro

### **DELETE** `/api/accesos-salidas/:id` - Eliminar registro

---

## ⏱️ **Flujo de Trabajo de Accesos-Salidas**

### **Secuencia Normal:**
```javascript
// 1. Consultar estado del vehículo
GET /api/accesos-salidas/estado-vehiculo/30
// Respuesta: { estado: "FUERA" }

// 2. Registrar entrada
POST /api/accesos-salidas
{
  "movimiento": "Entrada",
  "vehiculo_id": 30
}

// 3. Consultar estado nuevamente
GET /api/accesos-salidas/estado-vehiculo/30
// Respuesta: { estado: "DENTRO", tiempo_transcurrido_minutos: 45 }

// 4. Registrar salida (⭐ tiempo calculado automáticamente)
POST /api/accesos-salidas
{
  "movimiento": "Salida",
  "vehiculo_id": 30
}
// Respuesta incluye tiempo_calculado automáticamente
```

### **🛡️ Sistema de Validaciones:**
- ✅ **Previene entradas duplicadas** - No permite nueva entrada si el vehículo está dentro
- ✅ **Requiere entrada previa** - No permite salida sin registro de entrada
- ✅ **Cálculo preciso** - Diferencia exacta en segundos entre entrada y salida  
- ✅ **Validación temporal** - Salida no puede ser anterior a entrada
- ✅ **Estado coherente** - Mantiene integridad del sistema de parqueadero

---

## 📊 **HISTORIAL PARQUEO** - `/api/historial-parqueo`

### **GET** `/api/historial-parqueo` - Obtener todo el historial

### **GET** `/api/historial-parqueo/vehiculo/:vehiculo_id` - Por vehículo

### **GET** `/api/historial-parqueo/celda/:celda_id` - Por celda

### **GET** `/api/historial-parqueo/estadisticas` - Estadísticas generales

### **POST** `/api/historial-parqueo` - Crear registro

---

## 🚨 **INCIDENCIAS** - `/api/incidencias`

### **GET** `/api/incidencias` - Obtener todas las incidencias

### **GET** `/api/incidencias/:id` - Obtener incidencia por ID

### **POST** `/api/incidencias` - Crear nueva incidencia

### **PUT** `/api/incidencias/:id` - Actualizar incidencia

### **DELETE** `/api/incidencias/:id` - Eliminar incidencia

---

## 📋 **REPORTES DE INCIDENCIA** - `/api/reportes-incidencia`

### **GET** `/api/reportes-incidencia` - Obtener todos los reportes

### **GET** `/api/reportes-incidencia/vehiculo/:vehiculo_id` - Por vehículo

### **GET** `/api/reportes-incidencia/incidencia/:incidencia_id` - Por incidencia

### **POST** `/api/reportes-incidencia` - Crear reporte

---

## 🚦 **PICO Y PLACA** - `/api/pico-placa`

### **GET** `/api/pico-placa` - Obtener todas las reglas

### **GET** `/api/pico-placa/:id` - Obtener regla por ID

### **GET** `/api/pico-placa/tipo/:tipo/dia/:dia` - Por tipo y día

### **POST** `/api/pico-placa` - Crear nueva regla

### **PUT** `/api/pico-placa/:id` - Actualizar regla

### **DELETE** `/api/pico-placa/:id` - Eliminar regla

---

## 👤 **PERFILES DE USUARIO** - `/api/perfiles-usuario`

### **GET** `/api/perfiles-usuario` - Obtener todos los perfiles

### **GET** `/api/perfiles-usuario/:id` - Obtener perfil por ID

### **POST** `/api/perfiles-usuario` - Crear nuevo perfil

### **PUT** `/api/perfiles-usuario/:id` - Actualizar perfil

### **DELETE** `/api/perfiles-usuario/:id` - Eliminar perfil

---

## 🏥 **HEALTH CHECK** - `/health`

### **GET** `/health` - Verificar estado del servidor
**Ejemplo Postman:**
```
GET http://localhost:3001/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "parking-management-api"
}
```

---

## 🌐 **CORS y Frontend Integration**

### **✅ CORS Optimizado**
El servidor está configurado para permitir acceso desde:

- **✅ Cualquier dominio/puerto** (desarrollo y producción)
- **✅ localhost:5175** (Vite dev server)
- **✅ localhost:5174** (Vite dev server alternativo)
- **✅ localhost:3000** (React dev server)
- **✅ localhost:3001** (Backend)
- **✅ Todos los métodos HTTP** (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- **✅ Headers personalizados** (Authorization, X-Requested-With, etc.)

### **Configuración para Frontend**

**React/Vue/Angular:**
```javascript
// Configuración base para fetch
const API_BASE = 'http://localhost:3001';

// Ejemplo de uso con fetch
const response = await fetch(`${API_BASE}/api/usuarios/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    direccion_correo: 'user@example.com',
    clave: 'password123'
  })
});

const data = await response.json();
```

**Axios:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
});

// Login example
const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/usuarios/login', {
      direccion_correo: email,
      clave: password
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response.data);
    throw error;
  }
};
```

---

## 📝 **Códigos de Respuesta HTTP**

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos de entrada inválidos o faltantes
- **401**: Unauthorized - Credenciales inválidas o usuario inactivo
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Conflicto (ej: documento duplicado)
- **500**: Internal Server Error - Error del servidor

## 📊 **Estructura de Respuestas**

### **Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos de respuesta
  }
}
```

### **Respuesta de Error:**
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

## 🔧 **Validaciones de Datos**

### **Celdas:**
- **Tipos permitidos**: `"Carro"`, `"Moto"`, `"otro"`
- **Estados permitidos**: `"Libre"`, `"Ocupada"`, `"Mantenimiento"`

### **Usuarios:**
- **Tipos de documento**: `"CC"`, `"TI"`, `"CE"`, etc.
- **Estados**: `"activo"`, `"inactivo"`
- **Contraseñas**: Encriptación automática MD5

### **Vehículos:**
- **Tipos**: `"Carro"`, `"Moto"`, `"Bicicleta"`, etc.
- **Placas**: Formato validado

## 📈 **Sistema de Logging**

El sistema incluye logging detallado para debugging:

```bash
# Logs de ejemplo en consola del servidor
[GET CELL] Buscando celda con ID: 1
[GET CELL] Resultado de búsqueda: Encontrada
[UPDATE CELL] Actualizando celda con ID: 1
[UPDATE CELL] Datos recibidos: { tipo: "Moto", estado: "Ocupada" }
[DELETE CELL] Intentando eliminar celda con ID: 1
[CREATE CELL] Creando nueva celda: { tipo: "Carro", estado: "Libre" }
```

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas
npm run test:usuario

# Ejecutar con información detallada
npm run test:verbose

# Guardar resultados en archivo
npm run test:save
```

## 🚀 Despliegue

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3001` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `3306` |
| `DB_USER` | Usuario de la base de datos | `root` |
| `DB_PASSWORD` | Contraseña de la base de datos | |
| `DB_NAME` | Nombre de la base de datos | `ParkingLot` |

### Vercel

```bash
npm i -g vercel
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel --prod
```

### Render

1. Conectar repositorio en [render.com](https://render.com)
2. Configurar variables de entorno en el dashboard
3. El archivo `render.yaml` ya está configurado

## 🔄 **Changelog Reciente**

### **v3.0.0** - Latest *(Actualización Mayor)*
- ⭐ **Cálculo automático de tiempo de estadía** - Para movimiento "Salida" en accesos-salidas
- 🚪 **Control inteligente de accesos** - Validaciones entrada/salida con estado coherente
- 📍 **Estado en tiempo real de vehículos** - Endpoint para consultar si está dentro/fuera del parqueadero
- 🔍 **Sistema de búsqueda expandido** - 11 endpoints de usuarios con múltiples opciones de búsqueda
- 👥 **Gestión completa de usuarios**:
  - `GET /api/usuarios/email/:email` - Búsqueda por email
  - `GET /api/usuarios/buscar/:identifier` - Búsqueda universal (email o documento)
  - `PUT /api/usuarios/:id/estado` - Actualización específica de estado
  - `GET /api/usuarios/config` - Configuración completa del módulo
- 🚗 **Endpoints de accesos-salidas mejorados**:
  - `GET /api/accesos-salidas/estado-vehiculo/:id` - Estado actual del vehículo
  - `GET /api/accesos-salidas/config` - Configuración con funcionalidades automáticas
- 🛡️ **Validaciones robustas mejoradas**:
  - Prevención de entradas duplicadas
  - Validación de salidas sin entrada previa
  - Estados de usuario expandidos (activo, inactivo, suspendido, bloqueado)
- ⏱️ **Cálculo automático de tiempo**:
  - Diferencia exacta en segundos entre entrada y salida
  - Conversión automática a minutos y horas
  - Validación temporal (salida no anterior a entrada)
- 📝 **Logging mejorado** con trazabilidad completa de operaciones
- 📊 **Documentación expandida** con ejemplos detallados y casos de uso

### **v2.0.0** - Previous
- ✅ **CORS optimizado** para acceso desde cualquier dominio/puerto
- 🔐 **Autenticación MD5** implementada con endpoint `/api/usuarios/login`
- 🔧 **Funcionalidad de celdas corregida** y mejorada completamente
- 🆕 **Nuevos endpoints**: `/config`, `/debug/:id`, `/:id/tipo`
- ✅ **Validaciones robustas** para tipos y estados de celdas
- 📝 **Sistema de logging** para debugging y monitoreo
- 🎯 **Respuestas mejoradas** con historial de cambios
- 📚 **Documentación completa** actualizada

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **SENA - Grupo Huber Andres** - Desarrollo inicial y mejoras

## 🆘 Soporte

Para reportar bugs o solicitar funcionalidades, crear un [issue](https://github.com/mauriciorivero/ParkingSENABend/issues) en GitHub.

---

## 📞 **Contacto y Desarrollo**

- **Repositorio**: https://github.com/mauriciorivero/ParkingSENABend
- **Documentación API**: http://localhost:3001/
- **Health Check**: http://localhost:3001/health
- **Versión Actual**: v3.0.0 (Actualización Mayor)

### **🌟 Funcionalidades Destacadas v3.0.0**

- **⏱️ Cálculo automático de tiempo de estadía** para control preciso de parqueadero
- **🔍 Sistema de búsqueda universal** de usuarios (email, documento, identificador)
- **📍 Consulta de estado en tiempo real** de vehículos (dentro/fuera)
- **🛡️ Validaciones inteligentes** que previenen inconsistencias de datos
- **📊 Endpoints de configuración** para integración dinámica con frontend

### **🎯 Endpoints Clave para Frontend**

```javascript
// Sistema de login
POST /api/usuarios/login

// Búsqueda flexible de usuarios  
GET /api/usuarios/buscar/:identifier

// Control de accesos con cálculo automático
POST /api/accesos-salidas

// Estado en tiempo real de vehículos
GET /api/accesos-salidas/estado-vehiculo/:vehiculo_id

// Configuraciones dinámicas
GET /api/usuarios/config
GET /api/accesos-salidas/config
GET /api/celdas/config
```

**¡API v3.0.0 completamente funcional y lista para integración con cualquier frontend moderno!** 🚀⭐