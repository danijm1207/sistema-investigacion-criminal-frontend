/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuración de dominios permitidos para optimización y visualización de imágenes
    // Soporta Supabase Storage y los tres backends de la comparativa de lenguajes (Java, Scala, Kotlin)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Backend Java
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8081',
        pathname: '/uploads/**',
      },
      // Backend Scala
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8082',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8082',
        pathname: '/uploads/**',
      },
      // Backend Kotlin
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8083',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8083',
        pathname: '/uploads/**',
      },
      // Compatibilidad con entorno de desarrollo previo (puerto 4000)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
