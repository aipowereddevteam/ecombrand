
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API with Return & Refund',
      version: '1.0.0',
      description: 'Enterprise REST API documentation including Order Management, Returns, and QC.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
      {
         url: 'http://localhost:5000/api', 
         description: 'Legacy Base URL',
      }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{
        bearerAuth: [],
    }],
  },
  apis: ['./routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
