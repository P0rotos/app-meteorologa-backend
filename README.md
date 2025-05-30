# 🌦️ App Meteorológica - Backend API

API backend para aplicación meteorológica con gestión de usuarios, actividades y preferencias climáticas.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Supabase
- API Key de OpenWeatherMap

### Instalación
```bash
# Clonar el repositorio
git clone <url-del-repo>
cd app-meteorologa-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Variables de Entorno (.env)
```env
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_anon_key
WEATHER_API_KEY=tu_openweather_api_key
PORT=3000
```

### Ejecutar el servidor
```bash
# Modo desarrollo
npm run devStart

# El servidor se ejecuta en http://localhost:3000
```

## 📊 Base de Datos (Supabase)

### Estructura de Tablas

#### `ciudades`
- `id` (int4, PK)
- `nombre` (varchar)
- `lat` (numeric)
- `lon` (numeric)

#### `usuarios`
- `id` (uuid, PK)
- `email` (varchar)
- `nombre` (varchar)
- `creado_en` (timestamp)

#### `actividades`
- `id` (int4, PK)
- `nombre` (varchar)
- `tipo` (varchar)
- `min_temp` (numeric)
- `max_temp` (numeric)
- `prefiere_soleado` (bool)
- `prefiere_nublado` (bool)
- `prefiere_lluvia` (bool)

#### `actividad_usuario`
- `id` (int4, PK)
- `usuario_id` (uuid, FK)
- `actividad_id` (int4, FK)
- `min_temp` (numeric)
- `max_temp` (numeric)
- `prefiere_soleado` (bool)
- `prefiere_nublado` (bool)
- `prefiere_lluvia` (bool)

---

# 📋 Documentación de API

## **🔗 Base URL**
```
http://localhost:3000
```

---

## **👥 Endpoints de Usuarios**

### **POST /users/register**
Registra un nuevo usuario usando Supabase Auth.

**Request:**
```javascript
fetch('http://localhost:3000/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: "Juan Pérez",
    email: "juan@email.com",
    password: "password123"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (201):**
```json
{
  "message": "usuario created",
  "user": {
    "id": "uuid-del-usuario",
    "email": "juan@email.com",
    "user_metadata": {
      "username": "Juan Pérez"
    }
  }
}
```

### **POST /users/login**
Inicia sesión de usuario.

**Request:**
```javascript
fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: "juan@email.com",
    password: "password123"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "usuario logged in",
  "user": {
    "id": "uuid-del-usuario",
    "email": "juan@email.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### **POST /users/logout**
Cierra sesión del usuario.

**Request:**
```javascript
fetch('http://localhost:3000/users/logout', {
  method: 'POST'
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "usuario logged out successfully"
}
```

---

## **🌤️ Endpoints de Clima**

### **GET /weather/hourly**
Obtiene pronóstico por horas (próximas 7 horas).

**Request:**
```javascript
fetch('http://localhost:3000/weather/hourly', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lat: -33.4489,
    lon: -70.6693
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
[
  {
    "dt": 1673625600,
    "main": {
      "temp": 22.5,
      "feels_like": 21.8,
      "humidity": 65
    },
    "weather": [
      {
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "wind": {
      "speed": 3.2
    }
  }
  // ... 6 objetos más
]
```

### **GET /weather/daily**
Obtiene pronóstico diario (próximos días).

**Request:**
```javascript
fetch('http://localhost:3000/weather/daily', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lat: -33.4489,
    lon: -70.6693
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
[
  {
    "date": "15/1",
    "maxTemp": 28.5,
    "minTemp": 15.2,
    "precipitation": 20,
    "icon": "02d"
  }
  // ... más días
]
```

### **GET /weather/cities**
Busca ciudades por nombre.

**Request:**
```javascript
fetch('http://localhost:3000/weather/cities', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    city: "Santiago"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
[
  {
    "nombre": "Santiago"
  },
  {
    "nombre": "Santiago de Compostela"
  }
]
```

### **GET /weather/cords**
Obtiene coordenadas de una ciudad específica.

**Request:**
```javascript
fetch('http://localhost:3000/weather/cords', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    city: "Santiago"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
[
  {
    "lat": -33.4489,
    "lon": -70.6693
  }
]
```

---

## **🎯 Endpoints de Actividades**

### **GET /activities**
Obtiene todas las actividades disponibles.

**Request:**
```javascript
fetch('http://localhost:3000/activities')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "Actividades obtenidas exitosamente",
  "activities": [
    {
      "id": 1,
      "nombre": "Correr",
      "tipo": "deportivo",
      "min_temp": 15,
      "max_temp": 25,
      "prefiere_soleado": true,
      "prefiere_nublado": false,
      "prefiere_lluvia": false
    },
    {
      "id": 2,
      "nombre": "Leer en el parque",
      "tipo": "recreativo",
      "min_temp": 18,
      "max_temp": 28,
      "prefiere_soleado": true,
      "prefiere_nublado": true,
      "prefiere_lluvia": false
    }
  ]
}
```

### **GET /activities/:id**
Obtiene una actividad específica por ID.

**Request:**
```javascript
fetch('http://localhost:3000/activities/1')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "Actividad obtenida exitosamente",
  "activity": {
    "id": 1,
    "nombre": "Correr",
    "tipo": "deportivo",
    "min_temp": 15,
    "max_temp": 25,
    "prefiere_soleado": true,
    "prefiere_nublado": false,
    "prefiere_lluvia": false
  }
}
```

---

## **👤 Endpoints de Preferencias de Usuario**

### **GET /user-preferences/:usuario_id**
Obtiene todas las actividades preferidas de un usuario.

**Request:**
```javascript
const userId = "usuario-uuid-aqui";
fetch(`http://localhost:3000/user-preferences/${userId}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "Preferencias obtenidas exitosamente",
  "preferences": [
    {
      "id": 1,
      "usuario_id": "usuario-uuid",
      "actividad_id": 1,
      "min_temp": 18,
      "max_temp": 25,
      "prefiere_soleado": true,
      "prefiere_nublado": false,
      "prefiere_lluvia": false,
      "actividades": {
        "id": 1,
        "nombre": "Correr",
        "tipo": "deportivo"
      }
    }
  ]
}
```

### **POST /user-preferences**
Agrega una nueva actividad preferida al usuario.

**Request:**
```javascript
fetch('http://localhost:3000/user-preferences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    usuario_id: "usuario-uuid-aqui",
    actividad_id: 2,
    min_temp: 20,
    max_temp: 30,
    prefiere_soleado: true,
    prefiere_nublado: false,
    prefiere_lluvia: false
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (201):**
```json
{
  "message": "Preferencia creada exitosamente",
  "preference": {
    "id": 2,
    "usuario_id": "usuario-uuid",
    "actividad_id": 2,
    "min_temp": 20,
    "max_temp": 30,
    "prefiere_soleado": true,
    "prefiere_nublado": false,
    "prefiere_lluvia": false,
    "actividades": {
      "id": 2,
      "nombre": "Leer en el parque",
      "tipo": "recreativo"
    }
  }
}
```

**Errores comunes:**
- **409**: Ya existe preferencia para esa actividad
- **400**: Datos faltantes o min_temp > max_temp

### **PUT /user-preferences/:id**
Actualiza una preferencia existente (actualización parcial permitida).

**Request:**
```javascript
const preferenceId = 1;
fetch(`http://localhost:3000/user-preferences/${preferenceId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    min_temp: 22,
    prefiere_nublado: true
    // Solo envías los campos que quieres cambiar
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "Preferencia actualizada exitosamente",
  "preference": {
    "id": 1,
    "usuario_id": "usuario-uuid",
    "actividad_id": 1,
    "min_temp": 22,
    "max_temp": 25,
    "prefiere_soleado": true,
    "prefiere_nublado": true,
    "prefiere_lluvia": false,
    "actividades": {
      "id": 1,
      "nombre": "Correr",
      "tipo": "deportivo"
    }
  }
}
```

### **DELETE /user-preferences/:id**
Elimina una preferencia específica.

**Request:**
```javascript
const preferenceId = 1;
fetch(`http://localhost:3000/user-preferences/${preferenceId}`, {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response exitoso (200):**
```json
{
  "message": "Preferencia eliminada exitosamente"
}
```

---

## **🎨 Flujo de UI Sugerido**

### **1. Pantalla de Actividades Disponibles**
```javascript
// Obtener todas las actividades
const loadActivities = async () => {
  const response = await fetch('http://localhost:3000/activities');
  const data = await response.json();
  return data.activities;
};
```

### **2. Pantalla de Mis Preferencias**
```javascript
// Cargar preferencias del usuario logueado
const loadUserPreferences = async (userId) => {
  const response = await fetch(`http://localhost:3000/user-preferences/${userId}`);
  const data = await response.json();
  return data.preferences;
};
```

### **3. Agregar Nueva Preferencia**
```javascript
const addPreference = async (userId, activityId, preferences) => {
  const response = await fetch('http://localhost:3000/user-preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: userId,
      actividad_id: activityId,
      ...preferences
    })
  });
  
  if (response.status === 409) {
    alert('Ya tienes preferencias para esta actividad');
    return null;
  }
  
  return await response.json();
};
```

### **4. Editar Preferencia**
```javascript
const updatePreference = async (preferenceId, changes) => {
  const response = await fetch(`http://localhost:3000/user-preferences/${preferenceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes)
  });
  
  return await response.json();
};
```

---

## **⚠️ Manejo de Errores**

### **Códigos de Estado HTTP**
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Datos faltantes o inválidos
- **401**: No autorizado (credenciales inválidas)
- **404**: Recurso no encontrado
- **409**: Conflicto (recurso ya existe)
- **500**: Error interno del servidor

### **Ejemplo de manejo de errores:**
```javascript
const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error desconocido');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en API:', error.message);
    // Mostrar mensaje al usuario
    alert(`Error: ${error.message}`);
  }
};
```

---

## **📋 Campos de Datos**

### **Usuario:**
- `id`: string (UUID)
- `email`: string
- `nombre`: string (guardado en user_metadata.username)

### **Actividad:**
- `id`: number (único)
- `nombre`: string
- `tipo`: string
- `min_temp`: number (temperatura mínima recomendada)
- `max_temp`: number (temperatura máxima recomendada)
- `prefiere_soleado`: boolean
- `prefiere_nublado`: boolean
- `prefiere_lluvia`: boolean

### **Preferencia de Usuario:**
- `id`: number (único)
- `usuario_id`: string (UUID del usuario)
- `actividad_id`: number (referencia a actividad)
- `min_temp`: number (preferencia personal)
- `max_temp`: number (preferencia personal)
- `prefiere_soleado`: boolean
- `prefiere_nublado`: boolean
- `prefiere_lluvia`: boolean

### **Ciudad:**
- `id`: number
- `nombre`: string
- `lat`: number (latitud)
- `lon`: number (longitud)

---

## **🛠️ Tecnologías Utilizadas**

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Supabase** - Base de datos y autenticación
- **OpenWeatherMap API** - Datos meteorológicos
- **dotenv** - Gestión de variables de entorno

---

## **📝 Notas para Desarrollo**

### **Para el equipo de backend:**
- Los endpoints de actividades y preferencias están completos
- Falta modificar `/users/register` para incluir actividades preferidas en el registro

### **Para el equipo de frontend:**
- Todos los endpoints están documentados con ejemplos
- Manejar correctamente los códigos de error HTTP
- El `usuario_id` se obtiene del response del login de Supabase
- Las coordenadas se pueden obtener de `/weather/cords` o usar geolocalización del navegador

---

## **🔄 Próximos Pasos**

1. **Backend**: Modificar endpoint de registro para incluir actividades preferidas
2. **Frontend**: Implementar interfaz de usuario basada en estos endpoints
3. **Testing**: Crear tests unitarios y de integración
4. **Deployment**: Configurar despliegue en producción

---

## **📞 Contacto**

Para dudas sobre la API, contactar al equipo de backend del proyecto.
