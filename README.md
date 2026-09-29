# 🛒 TechStore API - Backend NestJS (Primera Etapa)

**Universidad Laica Eloy Alfaro de Manabí (ULEAM)**  
**Carrera:** Ingeniería del Software  
**Asignatura:** Aplicaciones para el Servidor Web  
**Nivel:** 5to Semestre  
**Docente:** Edgardo Panchana Flores  
**Calificación:** 10 Puntos  

---

## 📋 1. Definición del Proyecto

### 1.1 Descripción General y Problemática
En el comercio minorista de tecnología (tiendas de equipos de computación, accesorios y dispositivos electrónicos), la falta de una API centralizada y modular dificulta el control en tiempo real de inventarios, precios y estado de disponibilidad de los productos. 

**TechStore API** es una solución backend construida sobre **NestJS** y **PostgreSQL** que proporciona contratos HTTP robustos para administrar recursos de catálogo de productos con validaciones en tiempo de ejecución, arquitectura por capas e inyección de dependencias.

### 1.2 Usuarios Previstos
- **Administrador de Tienda / Inventario:** Gestiona el alta, modificación y bajas del catálogo de productos, controlando el stock y estado de disponibilidad.
- **Cliente HTTP / Frontend App (React en Etapa 4):** Consume los endpoints REST para consultar la lista de productos disponibles y detalles de ítems.

### 1.3 Recurso Principal de la Etapa
- **`Product` (`Producto`):** Administra los atributos clave de cada artículo tecnológico (nombre, SKU único, precio, cantidad en stock, categoría, estado de disponibilidad y estampas de tiempo).

### 1.4 Modelo de Entidades Previsto para el Semestre
A continuación se presenta la evolución semestral del dominio de la aplicación:

```mermaid
erdiagram
    PRODUCT ||--o{ ORDER_ITEM : "contiene"
    CATEGORY ||--o{ PRODUCT : "clasifica"
    USER ||--o{ ORDER : "realiza"
    ORDER ||--|{ ORDER_ITEM : "posee"

    PRODUCT {
        uuid id PK
        string name
        string sku UK
        decimal price
        int stock
        string category
        boolean isAvailable
        timestamp createdAt
        timestamp updatedAt
    }

    CATEGORY {
        uuid id PK
        string name UK
        string description
    }

    USER {
        uuid id PK
        string name
        string email UK
        string role
    }

    ORDER {
        uuid id PK
        uuid userId FK
        decimal total
        string status
        timestamp createdAt
    }

    ORDER_ITEM {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        decimal unitPrice
    }
```

---

## 🏛️ 2. Arquitectura NestJS

La aplicación está estructurada respetando el principio de responsabilidad única (SRP) y la arquitectura en capas recomendada por NestJS:

```
src/
├── app.module.ts              # Módulo raíz (ConfigModule + TypeOrmModule + ProductsModule)
├── main.ts                    # Entrypoint con ValidationPipe global y prefijo /api/v1
└── products/
    ├── dto/
    │   ├── create-product.dto.ts # DTO con class-validator para POST /products
    │   └── update-product.dto.ts # DTO parcial (PartialType) para PATCH /products/:id
    ├── entities/
    │   └── product.entity.ts  # Entidad TypeORM mapeada a PostgreSQL
    ├── products.controller.ts # Controlador REST (gestión de rutas HTTP)
    ├── products.module.ts     # Módulo de negocio encapsulado
    └── products.service.ts    # Servicio con lógica de negocio y excepciones centralizadas
```

- **Controller (`products.controller.ts`):** Recibe las solicitudes HTTP, aplica `ParseUUIDPipe` en los parámetros y delega las operaciones al servicio.
- **Service (`products.service.ts`):** Contiene las reglas de negocio, interactúa con el repositorio inyectado (`@InjectRepository(Product)`) y centraliza las excepciones HTTP (400 Bad Request, 404 Not Found).
- **Module (`products.module.ts`):** Registra los controladores, servicios e inyecta la entidad TypeORM.

---

## ⚙️ 3. Requisitos y Configuración del Entorno

### 3.1 Prerrequisitos
- Node.js (v18.x o superior)
- npm (v9.x o superior)
- Docker Desktop o PostgreSQL local instalado y corriendo

### 3.2 Variables de Entorno (`.env`)
Crear un archivo `.env` basado en `.env.example`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=techstore_db

NODE_ENV=development
```

---

## 🚀 4. Instrucciones de Ejecución

### Paso 1: Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd PTA_API_1era_etapa
npm install
```

### Paso 2: Levantar PostgreSQL con Docker Compose
```bash
docker compose up -d
```
*(Si usas PostgreSQL local, asegúrate de crear la base de datos `techstore_db` en pgAdmin o psql).*

### Paso 3: Iniciar la API NestJS en modo desarrollo
```bash
npm run start:dev
```
La API estará escuchando en: **`http://localhost:3000/api/v1`**

---

## 📑 5. Especificación de Endpoints REST (CRUD)

| Método | Endpoint | Descripción | Código Éxito | Códigos Error |
| :--- | :--- | :--- | :---: | :---: |
| **POST** | `/api/v1/products` | Crear un nuevo producto | `201 Created` | `400 Bad Request` |
| **GET** | `/api/v1/products` | Obtener todos los productos | `200 OK` | - |
| **GET** | `/api/v1/products/:id` | Obtener un producto por UUID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **PATCH** | `/api/v1/products/:id` | Actualizar parcialmente un producto | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/v1/products/:id` | Eliminar un producto por UUID | `200 OK` | `400 Bad Request`, `404 Not Found` |

---

## 🧪 6. Evidencia de Pruebas Manuales y Comandos cURL

### 6.1 Crear Producto (POST `/api/v1/products`) - Éxito (201)
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop ASUS ROG Strix G16",
    "description": "Intel Core i7-13650HX, RTX 4060, 16GB RAM, 512GB SSD",
    "price": 1499.99,
    "stock": 10,
    "sku": "LAP-ASUS-001",
    "category": "Laptops",
    "isAvailable": true
  }'
```
**Respuesta:**
```json
{
  "id": "e4b8a2c1-8d3f-4e9a-9b1c-7d5a3e2f1b0a",
  "name": "Laptop ASUS ROG Strix G16",
  "description": "Intel Core i7-13650HX, RTX 4060, 16GB RAM, 512GB SSD",
  "price": 1499.99,
  "stock": 10,
  "sku": "LAP-ASUS-001",
  "category": "Laptops",
  "isAvailable": true,
  "createdAt": "2026-09-29T18:00:00.000Z",
  "updatedAt": "2026-09-29T18:00:00.000Z"
}
```

---

### 6.2 Prueba de Validación DTO - Error 400 Bad Request
**Intento de envío de propiedades inválidas (precio negativo, SKU inválido, propiedad no permitida `invalidField`):**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "L",
    "price": -50,
    "stock": 5,
    "sku": "sku con espacios!",
    "invalidField": "propiedad no permitida"
  }'
```
**Respuesta 400 Bad Request (ValidationPipe):**
```json
{
  "statusCode": 400,
  "message": [
    "property invalidField should not exist",
    "El nombre debe tener al menos 3 caracteres",
    "El precio no puede ser negativo",
    "El SKU solo debe contener letras, números y guiones (ej. PROD-101)"
  ],
  "error": "Bad Request"
}
```

---

### 6.3 Obtener Todos los Productos (GET `/api/v1/products`) - Éxito (200)
```bash
curl -X GET http://localhost:3000/api/v1/products
```

---

### 6.4 Obtener Producto por ID (GET `/api/v1/products/:id`) - 404 Not Found
```bash
curl -X GET http://localhost:3000/api/v1/products/00000000-0000-0000-0000-000000000000
```
**Respuesta 404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "El producto con el ID \"00000000-0000-0000-0000-000000000000\" no fue encontrado",
  "error": "Not Found"
}
```

---

### 6.5 Actualizar Producto (PATCH `/api/v1/products/:id`) - Éxito (200)
```bash
curl -X PATCH http://localhost:3000/api/v1/products/e4b8a2c1-8d3f-4e9a-9b1c-7d5a3e2f1b0a \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1399.99,
    "stock": 8
  }'
```

---

### 6.6 Eliminar Producto (DELETE `/api/v1/products/:id`) - Éxito (200)
```bash
curl -X DELETE http://localhost:3000/api/v1/products/e4b8a2c1-8d3f-4e9a-9b1c-7d5a3e2f1b0a
```
**Respuesta:**
```json
{
  "message": "El producto con ID \"e4b8a2c1-8d3f-4e9a-9b1c-7d5a3e2f1b0a\" ha sido eliminado exitosamente.",
  "id": "e4b8a2c1-8d3f-4e9a-9b1c-7d5a3e2f1b0a"
}
```

---

## 🔒 7. Verificación de Persistencia
Para verificar la persistencia exigida en la rúbrica:
1. Crear un producto con el endpoint `POST /api/v1/products`.
2. Reiniciar el servidor NestJS (`Ctrl + C` y ejecutar `npm run start:dev`).
3. Ejecutar `GET /api/v1/products`. El producto permanecerá en la base de datos PostgreSQL.

---

## 👥 Integrantes del Grupo
1. **Alonso Bailon Kevin Joel**

