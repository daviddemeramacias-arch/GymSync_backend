import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GymSync API',
      version: '1.0.0',
      description: `
## GymSync — Smart Gym Operations & Membership Ecosystem

API REST para la plataforma de gestión integral de gimnasios.

### Autenticación
La API usa **JWT Bearer Token**. Incluye el token en el header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Roles disponibles
| Rol | Descripción |
|-----|-------------|
| \`OWNER\` | Dueño del gimnasio — acceso total |
| \`ADMIN\` | Administrador — gestión operativa |
| \`RECEPTIONIST\` | Recepción — control de acceso |
| \`MEMBER\` | Socio — acceso a su portal PWA |

### Colores corporativos GymSync
- 🔴 **Coral Rush** \`#F4806A\` — Acciones principales
- 🔵 **Steel Teal** \`#437F91\` — Información
- 🟢 **Deep Moss** \`#4C5E51\` — Navegación
- 🟡 **Golden Wheat** \`#D1B174\` — Logros y VIP
      `,
      contact: {
        name: 'GymSync Dev Team',
        email: 'dev@gymsync.app',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.API_PORT || 3000}/api/v1`,
        description: 'Servidor de desarrollo local',
      },
      {
        url: 'https://api.gymsync.app/api/v1',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido desde POST /auth/login',
        },
      },
      schemas: {
        // ── Respuestas genéricas ──────────────────────
        ApiResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Operación exitosa' },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                items: { type: 'array', items: {} },
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Mensaje de error' },
          },
        },
        // ── Enums compartidos ─────────────────────────
        UserRole: {
          type: 'string',
          enum: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'MEMBER'],
        },
        MemberStatus: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'OVERDUE', 'FROZEN', 'CANCELLED'],
        },
        PaymentStatus: {
          type: 'string',
          enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
        },
        TokenType: {
          type: 'string',
          enum: ['DAILY_PASS', 'PICKUP', 'MONTHLY_PASS'],
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Estado del servidor' },
      { name: 'Auth', description: 'Autenticación — PIN, Biometría, JWT' },
      { name: 'Members', description: 'Gestión de socios y membresías' },
      { name: 'Access', description: 'Control de acceso — semáforo y tokens' },
      { name: 'Finance', description: 'Pagos, OCR y arqueo de caja' },
      { name: 'Marketplace', description: 'Productos y tokens de pickup' },
      { name: 'Routines', description: 'Rutinas de entrenamiento y AI Coach' },
      { name: 'Notifications', description: 'WhatsApp y email automatizados' },
      { name: 'Agents', description: 'Estado y control de agentes autónomos' },
    ],
  },
  apis: ['./src/modules/**/*.router.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
