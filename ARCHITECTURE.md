# Project Alpha — Constitución de Arquitectura de Software

> **Documento vivo.** Toda decisión técnica que contradiga este archivo debe primero actualizar este archivo.
> Cualquier PR que viole las reglas aquí definidas es inválido sin excepción.

> **Sobre los ejemplos de código.** Los bloques de código en este documento usan nombres genéricos con la notación
> `{Entity}`, `{UseCase}`, `{Port}`, etc. Son **plantillas universales**, no referencias al dominio actual.
> Los nombres concretos del proyecto viven en `docs/openapi.yaml` y en los Skills de Antigravity.

---

## 1. Resumen Ejecutivo

Project Alpha sigue **Arquitectura Hexagonal** (Puertos y Adaptadores / Clean Architecture).
El objetivo es aislar la lógica de negocio de cualquier detalle técnico: frameworks, bases de datos, transporte HTTP.

**Stack:** Node.js · NestJS · MongoDB (Mongoose) · Docker

**Fuente de verdad del contrato API:** `docs/openapi.yaml`
Cualquier cambio en la API **comienza** en ese archivo, no en el código.

---

## 2. Capas y Reglas de Dependencia

```
┌─────────────────────────────────────────────────┐
│              INFRAESTRUCTURA                    │  ← puede importar todo
│  controllers · persistence · adapters · config  │
└───────────────────┬─────────────────────────────┘
                    │ depende de ↓
┌───────────────────▼─────────────────────────────┐
│               APLICACIÓN                        │  ← solo importa dominio
│         use-cases · services · dtos             │
└───────────────────┬─────────────────────────────┘
                    │ depende de ↓
┌───────────────────▼─────────────────────────────┐
│                 DOMINIO                         │  ← 0 dependencias externas
│         entities · ports · exceptions           │
└─────────────────────────────────────────────────┘
```

### Regla de Oro
> La dirección de dependencia es **siempre hacia adentro**.
> El Dominio nunca importa Aplicación ni Infraestructura.
> La Aplicación nunca importa Infraestructura.

---

## 3. Estructura de Directorios

```
src/
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts              ← una clase por concepto de negocio
│   ├── ports/
│   │   ├── repositories/
│   │   │   └── {entity}.repository.port.ts ← interfaz + Symbol de inyección
│   │   └── services/
│   │       └── {service}.service.port.ts   ← interfaz + Symbol de inyección
│   └── exceptions/
│       └── {description}.exception.ts      ← extiende Error nativo
│
├── application/
│   ├── use-cases/
│   │   └── {verb-noun}/                    ← una carpeta por caso de uso
│   │       ├── {verb-noun}.use-case.ts
│   │       └── {verb-noun}.use-case.spec.ts  ← OBLIGATORIO, mismo nivel
│   ├── services/
│   │   └── {noun}-orchestrator.service.ts  ← lógica que abarca múltiples casos de uso
│   └── dtos/
│       └── {verb-noun}.dto.ts              ← interfaces TypeScript puras
│
├── infrastructure/
│   ├── controllers/
│   │   └── {entity}.controller.ts
│   ├── persistence/
│   │   ├── schemas/
│   │   │   └── {entity}.schema.ts          ← Mongoose Schema + Document
│   │   └── repositories/
│   │       └── {entity}.repository.ts      ← implementa I{Entity}Repository
│   ├── adapters/
│   │   └── {provider}/
│   │       └── {provider}.adapter.ts       ← implementa I{Service}Service
│   ├── filters/
│   │   └── domain-exception.filter.ts      ← mapeo global excepciones → HTTP
│   ├── config/
│   │   ├── env.config.ts
│   │   └── database.config.ts
│   └── modules/
│       └── {entity}.module.ts              ← registra providers con Symbols
│
├── app.module.ts
└── main.ts

docs/
└── openapi.yaml

test/
└── e2e/
```

---

## 4. Capa de Dominio

**Ruta:** `src/domain`
**Regla crítica:** `grep -r "@nestjs\|mongoose\|typeorm" src/domain` debe devolver vacío. Si encuentra algo, el código es inválido.

### 4.1 Entidades

Las entidades son **clases TypeScript puras**. Sin decoradores de framework.

```typescript
// {entity}.entity.ts
export class {Entity} {
  constructor(
    public readonly id: string,
    public readonly {field1}: {Type1},
    public readonly {field2}: {Type2},
    // ... campos según el modelo de negocio
  ) {}

  // Los métodos de negocio van aquí, dentro de la entidad
  {businessMethod}(): {ReturnType} {
    // lógica pura, sin efectos secundarios externos
  }
}
```

**Reglas de entidades:**
- Solo TypeScript nativo, sin imports externos
- Métodos de negocio van dentro de la entidad (no en servicios)
- Campos `readonly` por defecto; mutable solo si el negocio lo requiere
- Usar tipos de unión (`'valueA' | 'valueB'`) en lugar de enums cuando los valores son simples y estables

### 4.2 Puertos (Interfaces)

Los puertos definen **contratos** que la infraestructura debe cumplir.

```typescript
// {entity}.repository.port.ts
export interface I{Entity}Repository {
  save(entity: {Entity}): Promise<{Entity}>;
  findById(id: string): Promise<{Entity} | null>;
  findAll(): Promise<{Entity}[]>;
  // métodos adicionales según necesidades del dominio
}

export const {ENTITY}_REPOSITORY = Symbol('I{Entity}Repository');
```

**Reglas de puertos:**
- Nombrar con prefijo `I` y sufijo según tipo: `IXxxRepository`, `IXxxService`
- Exportar siempre un `Symbol` de inyección junto a la interfaz
- Los métodos retornan entidades de dominio, nunca documentos de Mongoose

**Puertos de salida para efectos (no persistencia):** además de los repositorios,
el dominio puede declarar puertos para **efectos externos** (envío de email, notificaciones,
pagos…). Siguen las mismas reglas (interfaz + `Symbol`), pero su adaptador no vive en
`persistence/` sino en `infrastructure/adapters/{concern}/`. Primer ejemplo (SPE-008):

```typescript
// email-sender.port.ts
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
export const EMAIL_SENDER = Symbol('EmailSender');
```

El caso de uso depende del puerto `EmailSender`; el adaptador concreto
`NodemailerEmailSender` (`infrastructure/adapters/email/`) implementa el envío real vía SMTP
(config por env). En tests se inyecta un fake del puerto, nunca el adaptador real.

### 4.3 Excepciones de Dominio

```typescript
// {description}.exception.ts
export class {Description}Exception extends Error {
  constructor(context: string) {
    super(`{Entity} with id "${context}" was not found`);
    this.name = '{Description}Exception';
  }
}
```

---

## 5. Capa de Aplicación

**Ruta:** `src/application`
**Regla crítica:** Ningún caso de uso accede a Mongoose, NestJS, o HTTP directamente. Solo interactúa con interfaces del dominio.

### 5.1 Casos de Uso

Cada caso de uso es una **clase con un único método público `execute()`**.

```typescript
// {verb-noun}.use-case.ts
import { Inject } from '@nestjs/common'; // ← ÚNICA excepción permitida: decorador DI
import { {Entity} } from '@/domain/entities/{entity}.entity';
import { I{Entity}Repository, {ENTITY}_REPOSITORY } from '@/domain/ports/repositories/{entity}.repository.port';
import { {VerbNoun}Dto } from '@/application/dtos/{verb-noun}.dto';

export class {VerbNoun}UseCase {
  constructor(
    @Inject({ENTITY}_REPOSITORY)
    private readonly {entity}Repository: I{Entity}Repository,
  ) {}

  async execute(dto: {VerbNoun}Dto): Promise<{Entity}> {
    // 1. Validaciones de negocio via puertos
    // 2. Construcción de la entidad
    // 3. Persistencia y retorno
    const entity = new {Entity}(crypto.randomUUID(), /* ...campos del dto */ );
    return this.{entity}Repository.save(entity);
  }
}
```

**Reglas de casos de uso:**
- Un caso de uso = un archivo = un `execute()` público
- El nombre del archivo y la clase describen la acción: verbo + sustantivo (`{VerbNoun}UseCase`)
- **Cada caso de uso DEBE tener su archivo `.spec.ts` en la misma carpeta**
- Los repositorios se inyectan siempre mediante el `Symbol`, nunca por clase concreta

### 5.2 DTOs

Los DTOs son **tipos o clases simples** de entrada/salida. Sin decoradores de validación en la capa de aplicación (la validación HTTP va en los controladores).

```typescript
// {verb-noun}.dto.ts
export interface {VerbNoun}Dto {
  {field1}: {Type1};
  {field2}: {Type2};
  // campos de entrada necesarios para el caso de uso
}
```

### 5.3 Tests Unitarios (obligatorios)

```typescript
// {verb-noun}.use-case.spec.ts
describe('{VerbNoun}UseCase', () => {
  let useCase: {VerbNoun}UseCase;
  let mockRepository: jest.Mocked<I{Entity}Repository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    useCase = new {VerbNoun}UseCase(mockRepository);
  });

  it('should {descripción del comportamiento esperado}', async () => {
    // Arrange — preparar datos y mocks
    // Act — ejecutar el caso de uso
    // Assert — verificar resultado y llamadas a puertos
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw {Exception} when {condición de error}', async () => {
    mockRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({...})).rejects.toThrow({Exception});
  });
});
```

**Reglas de tests:**
- Usar mocks manuales (`jest.Mocked<IPort>`), no librerías de mocking externas
- No instanciar `AppModule` ni levantar NestJS en tests unitarios
- Probar el comportamiento, no la implementación

---

## 6. Capa de Infraestructura

**Ruta:** `src/infrastructure`
**Puede importar:** NestJS, Mongoose, librerías externas, capas de dominio y aplicación.

### 6.1 Controladores

Los controladores **solo orquestan**: validan entrada HTTP, llaman al caso de uso, devuelven respuesta. Cero lógica de negocio.

```typescript
// {entity}.controller.ts
@Controller('{route}')
export class {Entity}Controller {
  constructor(private readonly {verbNoun}UseCase: {VerbNoun}UseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async {action}(@Body() body: {VerbNoun}HttpDto): Promise<{Entity}ResponseDto> {
    const result = await this.{verbNoun}UseCase.execute(body);
    return {Entity}Presenter.toResponse(result);
  }
}
```

**Reglas de controladores:**
- Usar DTOs HTTP con `class-validator` decorators solo en esta capa
- Mapear excepciones de dominio a errores HTTP mediante un `ExceptionFilter` global
- No retornar entidades de dominio directamente; usar Presenters/mappers

### 6.2 Repositorios (Implementación de Puertos)

```typescript
// {technology}-{entity}.repository.ts
@Injectable()
export class {Technology}{Entity}Repository implements I{Entity}Repository {
  constructor(
    @InjectModel({Entity}Document.name)
    private model: Model<{Entity}Document>,
  ) {}

  async save(entity: {Entity}): Promise<{Entity}> {
    const doc = await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: {Entity}Mapper.toPersistence(entity) },
      { upsert: true, new: true }
    ).exec();
    return {Entity}Mapper.toDomain(doc);
  }

  async findById(id: string): Promise<{Entity} | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? {Entity}Mapper.toDomain(doc) : null;
  }
}
```

**Reglas de repositorios:**
- Nombrar las implementaciones con el prefijo de la tecnología usada (ej: `MongoosePlanRepository`)
- Siempre usar un `Mapper` para convertir entre documento Mongoose y entidad de dominio
- El repositorio nunca expone el documento de Mongoose fuera de esta clase
- Implementar **todas** las firmas definidas en el puerto correspondiente

### 6.3 Mappers

Los mappers son clases estáticas encargadas de la transformación bidireccional entre el Dominio y la Infraestructura.

```typescript
// {entity}.mapper.ts
export class {Entity}Mapper {
  static toDomain(doc: {Entity}Document): {Entity} {
    return new {Entity}(/* mapeo de campos */);
  }

  static toPersistence(entity: {Entity}): Partial<{Entity}Document> {
    return { /* mapeo de campos */ };
  }
}
```

**Reglas de mappers:**
- Solo viven en la capa de **Infraestructura**.
- Deben ser clases puras con métodos estáticos.
- Manejan las conversiones de tipos (ej: de `string` en DB a un tipo unión específico en el Dominio).

### 6.4 Módulos NestJS y Registro de Dependencias

Cada módulo registra los `providers` usando el `Symbol` del puerto como token:

```typescript
// {entity}.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: {Entity}Document.name, schema: {Entity}Schema }]),
  ],
  controllers: [{Entity}Controller],
  providers: [
    {VerbNoun}UseCase,
    {
      provide: {ENTITY}_REPOSITORY,       // ← Symbol del puerto (dominio)
      useClass: {Entity}Repository,       // ← Implementación (infraestructura)
    },
  ],
  exports: [{ENTITY}_REPOSITORY],        // ← Permitir que otros módulos usen este repositorio
})
export class {Entity}Module {}
```

### 6.5 Presenters

Los Presenters transforman las Entidades de Dominio en DTOs de respuesta HTTP, asegurando que el contrato de salida sea consistente con el OpenAPI.

```typescript
// {entity}.presenter.ts
export class {Entity}Presenter {
  static toResponse(entity: {Entity}): any {
    return {
      id: entity.id,
      // formateo de fechas, ocultamiento de campos sensibles, etc.
    };
  }
}
```

**Reglas de presenters:**
- Solo viven en la capa de **Infraestructura**.
- Transforman entidades de dominio a objetos JSON simples.
- Encargados del formateo final (ej: Date a string ISO).

### 6.6 Manejo de Errores (Exception Filters)

Se utiliza el patrón **Global Exception Filter** para desacoplar las excepciones de negocio del protocolo de transporte (HTTP).

**Práctica sugerida:**
1.  **Excepciones de Dominio**: Deben ser semánticas y no contener códigos HTTP.
2.  **Traducción en Infraestructura**: El `DomainExceptionFilter` es el único lugar donde se decide qué código HTTP (404, 400, etc.) corresponde a cada error de negocio.
3.  **Contrato Único**: Todas las respuestas de error deben seguir el esquema `ErrorResponse` definido en el OpenAPI.

```typescript
// Ejemplo de mapeo en el filtro
if (exception instanceof PlanNotFoundException) {
  status = HttpStatus.NOT_FOUND;
  code = 'plan_not_found';
}
```

### 6.7 Documentación de API (Swagger)

Es obligatorio que todos los puntos de entrada HTTP estén documentados utilizando los decoradores de `@nestjs/swagger`. Esto garantiza que la interfaz de Swagger UI (`/api-docs`) sea siempre el contrato vivo del sistema.

**Estándares de documentación:**
- **Controladores**: Deben usar `@ApiTags` para agrupar endpoints y `@ApiOperation` para describir la intención.
- **DTOs (HTTP)**: Deben usar `@ApiProperty` en todos sus campos, incluyendo `description` y `example`.
- **Respuestas**: Se deben documentar los códigos de estado comunes con `@ApiResponse` (ej: 201, 400, 404, 409).

```typescript
// Ejemplo de DTO documentado
export class CreatePlanHttpDto {
  @ApiProperty({ description: 'Nombre del plan', example: 'Premium' })
  @IsString()
  name: string;
}
```

---

## 7. Convenciones de Naming

| Elemento              | Convención                        | Ejemplo                            |
|-----------------------|-----------------------------------|------------------------------------|
| Entidad de dominio    | `PascalCase` + `.entity.ts`       | `plan.entity.ts`                   |
| Puerto repositorio    | `I` + nombre + `Repository`       | `IPlanRepository`                  |
| Puerto servicio       | `I` + nombre + `Service`          | `IAccessService`                   |
| Symbol de inyección   | `SCREAMING_SNAKE_CASE`            | `PLAN_REPOSITORY`                  |
| Caso de uso           | Verbo + Sustantivo + `UseCase`    | `CreatePlanUseCase`                |
| DTO de aplicación     | Verbo + Sustantivo + `Dto`        | `CreatePlanDto`                    |
| DTO HTTP              | Verbo + Sustantivo + `HttpDto`    | `CreatePlanHttpDto`                |
| Controlador           | Sustantivo + `Controller`         | `PlanController`                   |
| Repositorio impl.     | Sustantivo + `Repository`         | `PlanRepository`                   |
| Schema Mongoose       | Sustantivo + `Document`           | `PlanDocument`                     |
| Mapper                | Sustantivo + `Mapper`             | `PlanMapper`                       |
| Excepción de dominio  | Descripción + `Exception`         | `PlanNotFoundException`            |
| Módulo NestJS         | Sustantivo + `Module`             | `PlanModule`                       |
| Archivos              | `kebab-case`                      | `create-plan.use-case.ts`          |

---

## 8. Mapeo OpenAPI → Código

Cada endpoint del contrato en `docs/openapi.yaml` tiene un mapeo **exacto y obligatorio**:

| Endpoint                    | Caso de Uso          | Controlador          | Puerto(s)                     |
|-----------------------------|----------------------|----------------------|-------------------------------|
| `{METHOD} /{resource}`      | `{VerbNoun}UseCase`  | `{Entity}Controller` | `I{Entity}Repository`         |
| `{METHOD} /{resource}/{id}` | `{VerbNoun}UseCase`  | `{Entity}Controller` | `I{Entity}Repository`         |
| `GET /health`               | — (sin caso de uso)  | `HealthController`   | —                             |

El mapeo completo y actualizado del proyecto se mantiene en `docs/openapi.yaml`.
Cada `operationId` del contrato corresponde 1:1 al nombre del caso de uso en `camelCase`.

> Agregar un endpoint al OpenAPI sin crear su caso de uso correspondiente **no está permitido**.

---

## 9. Manejo de Errores

### Excepciones de Dominio → HTTP

Un `ExceptionFilter` global en `src/infrastructure/filters/domain-exception.filter.ts` mapea todas las excepciones de dominio a respuestas HTTP:

| Excepción de Dominio              | HTTP Status | Código de error (`error`)       |
|-----------------------------------|-------------|---------------------------------|
| `{Entity}NotFoundException`       | 404         | `{entity}_not_found`            |
| `{Entity}AlreadyExistsException`  | 409         | `{entity}_already_exists`       |
| `{Entity}AlreadyActiveException`  | 409         | `{entity}_already_active`       |
| `{Action}FailedException`         | 422         | `{action}_failed`               |
| Cualquier `Error` no mapeado      | 500         | `internal_server_error`         |

El catálogo completo de excepciones del proyecto y su mapeo HTTP se mantiene actualizado en este filtro.
Toda excepción nueva de dominio **debe registrarse** en el filtro antes de hacer merge.

### Formato de Error Estándar

```json
{
  "statusCode": 404,
  "error": "plan_not_found",
  "message": "Plan with id \"abc\" was not found",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/plans/abc"
}
```

---

## 10. Configuración Docker

```
docker/
├── Dockerfile
└── docker-compose.yml
```

- El servicio de la aplicación **nunca se conecta** a MongoDB directamente en local; siempre usa `docker-compose`.
- Las variables de entorno se inyectan mediante `ConfigModule` de NestJS; nunca hardcodeadas.
- `NODE_ENV=production` activa las validaciones de esquema de variables de entorno.

---

## 11. Checklist de PR

Antes de aprobar cualquier Pull Request, verificar:

- [ ] `src/domain` no importa `@nestjs`, `mongoose`, ni librerías externas
- [ ] Cada caso de uso nuevo tiene su archivo `.spec.ts` con al menos un test
- [ ] Los casos de uso solo inyectan mediante `Symbol` de puerto, nunca por clase concreta
- [ ] Los controladores no contienen lógica de negocio
- [ ] Los repositorios usan `Mapper` para convertir entre Mongoose ↔ dominio
- [ ] Los errores de dominio están mapeados en el `ExceptionFilter` global
- [ ] El endpoint nuevo está definido primero en `docs/openapi.yaml`
- [ ] La nomenclatura sigue las convenciones de la sección 7
