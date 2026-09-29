# TRABAJO AUTÓNOMO PRIMERA ETAPA - DESARROLLO BACKEND WEB CON NESTJS

**UNIVERSIDAD LAICA ELOY ALFARO DE MANABÍ**  
**FACULTAD DE CIENCIAS DE LA VIDA Y LAS TECNOLOGÍAS**  
**CARRERA DE INGENIERÍA DE SOFTWARE**  

* **Asignatura:** Aplicaciones para el Servidor Web  
* **Nivel:** 5to Semestre  
* **Docente:** Edgardo Panchana Flores  
* **Fecha de entrega:** Semana 4  
* **Calificación:** 10 puntos  

---

## 👥 DATOS DE LOS INTEGRANTES
1. **[Nombre y Apellidos del Integrante 1]**
2. **[Nombre y Apellidos del Integrante 2]**
3. **[Nombre y Apellidos del Integrante 3]**
4. **[Nombre y Apellidos del Integrante 4]**

* **Enlace al Repositorio de GitHub:** `https://github.com/tu-usuario/PTA_API_1era_etapa`

---

## 📑 1. DEFINICIÓN DEL PROYECTO

### 1.1 Tema Seleccionado
**TechStore API:** API REST para la gestión de productos e inventario de comercio electrónico de tecnología.

### 1.2 Problema que Resuelve
En la pequeña y mediana industria retail de tecnología, el control manual de productos, precios y niveles de stock produce inconsistencias de inventario y lentitud en la atención al cliente. La **TechStore API** ofrece una plataforma backend centralizada, eficiente y escalable que permite gestionar el catálogo de productos con validaciones automatizadas y persistencia relacional.

### 1.3 Usuarios Previstos
1. **Administrador del Sistema / Gestor de Inventario:** Encargado de registrar nuevos productos, actualizar existencias, modificar precios y deshabilitar artículos agotados.
2. **Cliente Final / Aplicación Web Frontend (Etapa 4):** Consume la API REST para visualizar los productos en venta, filtrar por categorías y consultar disponibilidad.

### 1.4 Recurso Principal
* **`Product` (`Producto`):** Representa cada bien tecnológico en venta (nombre, SKU, precio, stock, categoría, disponibilidad y timestamps).

### 1.5 Diagrama de Entidades Previstas para el Semestre
```
+-------------------------------------------------------------------------+
|                                CATEGORY                                 |
| - id: UUID (PK)                                                         |
| - name: String (Unique)                                                 |
| - description: String                                                   |
+-------------------------------------------------------------------------+
                                    | 1
                                    |
                                    | N
+-------------------------------------------------------------------------+
|                                PRODUCT                                  |
| - id: UUID (PK)                                                         |
| - name: String (Unique)                                                 |
| - sku: String (Unique)                                                  |
| - price: Decimal                                                        |
| - stock: Integer                                                        |
| - category: String                                                      |
| - isAvailable: Boolean                                                  |
| - createdAt: Timestamp                                                  |
| - updatedAt: Timestamp                                                  |
+-------------------------------------------------------------------------+
                                    | 1
                                    |
                                    | N
+-------------------------------------------------------------------------+
|                              ORDER_ITEM                                 |
| - id: UUID (PK)                                                         |
| - orderId: UUID (FK)                                                    |
| - productId: UUID (FK)                                                  |
| - quantity: Integer                                                     |
| - unitPrice: Decimal                                                    |
+-------------------------------------------------------------------------+
                                    | N
                                    |
                                    | 1
+-------------------------------------------------------------------------+
|                                 ORDER                                   |
| - id: UUID (PK)                                                         |
| - userId: UUID (FK)                                                     |
| - total: Decimal                                                        |
| - status: String                                                        |
| - createdAt: Timestamp                                                  |
+-------------------------------------------------------------------------+
                                    | N
                                    |
                                    | 1
+-------------------------------------------------------------------------+
|                                 USER                                    |
| - id: UUID (PK)                                                         |
| - name: String                                                          |
| - email: String (Unique)                                                |
| - role: String                                                          |
+-------------------------------------------------------------------------+
```

---

## 🏛️ 2. ESTRUCTURA Y ARQUITECTURA EN NESTJS

La solución se dividió modularmente respetando el principio de Inyección de Dependencias (DI):

1. **`ProductsModule` (`products.module.ts`):** Encapsula el dominio del catálogo e inyecta la entidad `Product`.
2. **`ProductsController` (`products.controller.ts`):** Gestiona las rutas `/api/v1/products`, mapea las peticiones REST y delega la ejecución al servicio.
3. **`ProductsService` (`products.service.ts`):** Concentra la lógica de negocio y la toma de decisiones sobre excepciones HTTP (400 Bad Request y 404 Not Found).
4. **`Product` Entity (`product.entity.ts`):** Mapeo objeto-relacional con TypeORM hacia la tabla `products` en PostgreSQL.

---

## 🛡️ 3. DTOs, VALIDACIONES Y MANEJO DE ERRORES HTTP

Se aplicó la biblioteca `class-validator` y `class-transformer` junto con el pipe global de NestJS (`ValidationPipe`):

### 3.1 DTO de Creación (`CreateProductDto`)
* `name`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(3)`, `@MaxLength(150)`
* `description`: `@IsString()`, `@IsOptional()`
* `price`: `@IsNumber()`, `@Min(0)`
* `stock`: `@IsInt()`, `@Min(0)`
* `sku`: `@IsString()`, `@IsNotEmpty()`, `@Matches(/^[A-Z0-9-]+$/i)`
* `category`: `@IsString()`, `@IsOptional()`
* `isAvailable`: `@IsBoolean()`, `@IsOptional()`

### 3.2 DTO de Actualización (`UpdateProductDto`)
* Extiende de `PartialType(CreateProductDto)` permitiendo actualizaciones parciales para el método `PATCH`.

### 3.3 Configuración de Pipe Global (`main.ts`)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Filtra propiedades no declaradas
    forbidNonWhitelisted: true,// Devuelve HTTP 400 si se envían campos extra
    transform: true,           // Convierte payloads a instancias de los DTOs
  }),
);
```

### 3.4 Decisiones de Excepciones HTTP Centralizadas en el Servicio
* **HTTP 400 (Bad Request):** Emitido cuando se intenta registrar un nombre o SKU duplicado, cuando un parámetro UUID es inválido, o cuando las propiedades del cuerpo de la petición no cumplen con la validación.
* **HTTP 404 (Not Found):** Emitido cuando se consulta, actualiza o elimina un producto cuyo UUID no existe en PostgreSQL.

---

## 🗄️ 4. PERSISTENCIA CON POSTGRESQL Y TYPEORM

Se configuró el acceso a datos dinámico mediante variables de entorno (`ConfigService`) y `TypeOrmModule.forRootAsync`.

* **Entorno en `.env`:**
  * `DB_HOST=localhost`
  * `DB_PORT=5432`
  * `DB_USERNAME=postgres`
  * `DB_PASSWORD=postgres`
  * `DB_NAME=techstore_db`

---

## 📸 5. EVIDENCIA DE PRUEBAS DE ENDPOINTS Y PERSISTENCIA

### 5.1 Registro Exitoso (POST `/api/v1/products`) - 201 Created
**Payload Enviado:**
```json
{
  "name": "Teclado Mecánico RGB Redragon",
  "description": "Teclado switch blue, retroiluminado",
  "price": 59.99,
  "stock": 25,
  "sku": "TEC-RED-001",
  "category": "Periféricos",
  "isAvailable": true
}
```
**Respuesta Obtenida:**
```json
{
  "id": "f3a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "name": "Teclado Mecánico RGB Redragon",
  "description": "Teclado switch blue, retroiluminado",
  "price": 59.99,
  "stock": 25,
  "sku": "TEC-RED-001",
  "category": "Periféricos",
  "isAvailable": true,
  "createdAt": "2026-09-29T18:15:00.000Z",
  "updatedAt": "2026-09-29T18:15:00.000Z"
}
```

---

### 5.2 Rechazo por Propiedades No Permitidas o Inválidas - 400 Bad Request
**Payload Enviado:**
```json
{
  "name": "A",
  "price": -10,
  "sku": "INVALID SKU!",
  "campoInexistente": "hack"
}
```
**Respuesta Obtenida:**
```json
{
  "statusCode": 400,
  "message": [
    "property campoInexistente should not exist",
    "El nombre debe tener al menos 3 caracteres",
    "El precio no puede ser negativo",
    "El SKU solo debe contener letras, números y guiones (ej. PROD-101)"
  ],
  "error": "Bad Request"
}
```

---

### 5.3 Consulta por Recurso Inexistente (GET `/api/v1/products/:id`) - 404 Not Found
**Respuesta Obtenida:**
```json
{
  "statusCode": 404,
  "message": "El producto con el ID \"00000000-0000-0000-0000-000000000000\" no fue encontrado",
  "error": "Not Found"
}
```

---

### 5.4 Verificación de Persistencia tras Reiniciar la API
1. Se insertaron datos iniciales en el recurso `/products`.
2. Se detuvo la ejecución de la API en la terminal (`Ctrl + C`).
3. Se volvió a iniciar la aplicación (`npm run start:dev`).
4. Al realizar la petición `GET /api/v1/products`, **todos los registros se mantuvieron almacenados intactos** en la base de datos PostgreSQL en el contenedor Docker.
