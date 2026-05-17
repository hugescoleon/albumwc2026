# WorldCup 2026 Collector Hub PWA

Una aplicación web progresiva (PWA) de alta fidelidad diseñada para gestionar tu álbum World Cup 2026.

## Características

- **Dual Tracking**: Controla lo que ya pegaste y tu inventario de repetidas.
- **Real-Time Sync**: Sincronización automática con Firebase (Firestore).
- **Offline Support**: Persistencia de datos incluso sin conexión.
- **Modo Vendedor**: Genera automáticamente listas de repetidas formateadas para WhatsApp.
- **Diseño Premium**: Estética Glassmorphism con modo oscuro y acentos dorados.

## Configuración

1. **Firebase**:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Habilita **Firestore Database** y **Authentication** (Google Auth).
   - Copia tus credenciales en un archivo `.env` basado en `.env.example`.

2. **Instalación**:
   ```bash
   npm install
   ```

3. **Desarrollo**:
   ```bash
   npm run dev
   ```

4. **Producción**:
   ```bash
   npm run build
   ```

## Stack Tecnológico

- React + Vite
- Tailwind CSS v4 (Glassmorphism)
- Firebase (Auth & Firestore)
- Lucide React (Icons)
- Framer Motion (Animations)
- Vite PWA Plugin
