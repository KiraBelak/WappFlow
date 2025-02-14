import themes from "daisyui/src/theming/themes";

const config = {
  // REQUIRED
  appName: "WappFlow",
  // REQUIRED: una descripción breve para SEO (puede sobreescribirse en cada página)
  appDescription:
    "Analiza tus conversaciones de WhatsApp y obtén insights valiosos con WappFlow.",
  // REQUIRED (sin https://, sin barra final)
  domainName: "wappflow.com",

  crisp: {
    // ID de Crisp (si no lo usas, elimina esta sección y usa mailgun.supportEmail)
    id: "",
    // Si solo quieres mostrar Crisp en la ruta "/", deja esta propiedad. De lo contrario, elimínala para mostrar Crisp en todas partes.
    onlyShowOnRoutes: ["/"],
  },

  stripe: {
    // Planes configurados en tu dashboard de Stripe
    plans: [
      {
        // Plan básico (Manantial)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_DEV_MANANTIAL"
            : "price_PROD_MANANTIAL",
        name: "Manantial",
        description: "Empieza a fluir con el análisis básico de WhatsApp.",
        price: 0, // Ejemplo: gratis o 9 USD/mes
        priceAnchor: 9, // Muestra un precio tachado o vacío si no lo usas
        features: [
          { name: "Análisis de 1 conversación" },
          { name: "Estadísticas básicas" },
          { name: "Exportación en PDF" },
        ],
      },
      {
        // Plan destacado (Corriente)
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_DEV_CORRIENTE"
            : "price_PROD_CORRIENTE",
        name: "Corriente",
        description: "Un flujo más amplio de análisis para proyectos en crecimiento.",
        price: 49,
        priceAnchor: 79,
        features: [
          { name: "Análisis de múltiples conversaciones" },
          { name: "Estadísticas avanzadas (tiempo de respuesta, actividad)" },
          { name: "Exportación en múltiples formatos" },
          { name: "Panel en tiempo real" },
          { name: "Soporte prioritario" },
        ],
      },
      {
        // Plan completo (Marea)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_DEV_MAREA"
            : "price_PROD_MAREA",
        name: "Marea",
        description:
          "El paquete completo para empresas con grandes necesidades de análisis.",
        price: 199,
        priceAnchor: 249,
        features: [
          { name: "Análisis ilimitado de conversaciones" },
          { name: "API de integración (CRM, Slack, etc.)" },
          { name: "Personalización de reportes (marca blanca)" },
          { name: "Soporte 24/7" },
          { name: "Funciones avanzadas de NLP" },
        ],
      },
    ],
  },

  aws: {
    // Configuración de S3/CloudFront (si lo usas)
    bucket: "wappflow-bucket",
    bucketUrl: "https://wappflow-bucket.s3.amazonaws.com/",
    cdn: "https://cdn-wappflow.cloudfront.net/",
  },

  mailgun: {
    // Subdominio para Mailgun (opcional)
    subdomain: "",
    // Email “From” para el envío de magic login links
    fromNoReply: `WappFlow <noreply@wappflow.com>`,
    // Email “From” para otras notificaciones
    fromAdmin: `WappFlow Team <admin@wappflow.com>`,
    // Email de soporte (si no usas Crisp, se mostrará para contacto directo)
    supportEmail: "support@wappflow.com",
    // Dirección a la que se redirigen las respuestas de los usuarios (opcional)
    forwardRepliesTo: "support@wappflow.com",
  },

  colors: {
    // Tema de DaisyUI (asegúrate de que "light" exista en tu config.tailwind.js)
    theme: "light",
    // Color principal para la app (por defecto toma el primary del tema "light")
    main: themes["light"]["primary"],
  },

  auth: {
    // Ruta para iniciar sesión (NextAuth u otra config)
    loginUrl: "/api/auth/signin",
    // Ruta de callback tras login exitoso (por ejemplo, tu dashboard)
    callbackUrl: "/dashboard",
  },
};

export default config;
