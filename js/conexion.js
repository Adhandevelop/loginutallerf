// Clase para manejar la conexión con el backend API
class DatabaseConnection {
    constructor() {
        // Detectar automáticamente el entorno
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLiveServer = window.location.port === '5500' || window.location.port === '8080' || window.location.port === '3000';
        const isDevelopment = isLocalhost && isLiveServer;
        
        console.log('🔍 Detectando entorno:');
        console.log('  - Hostname:', window.location.hostname);
        console.log('  - Protocol:', window.location.protocol);
        console.log('  - Port:', window.location.port);
        console.log('  - Full URL:', window.location.href);
        console.log('  - isDevelopment:', isDevelopment);
        
        // URL del backend - detección automática
        this.baseURL = isDevelopment 
            ? 'http://localhost:3001/api'
            : 'https://loginutaller.vercel.app/api';
            
        this.token = localStorage.getItem('cine_token');
        
        console.log(`🌐 Conectando a: ${this.baseURL}`);
    }

    // Método genérico para hacer peticiones HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        console.log('🔗 Haciendo petición a:', url);
        console.log('⚙️ Configuración:', config);

        try {
            const response = await fetch(url, config);
            console.log('📡 Respuesta recibida:', response.status, response.statusText);
            
            const data = await response.json();
            console.log('📄 Datos:', data);
            
            return { 
                success: response.ok, 
                data, 
                status: response.status 
            };
        } catch (error) {
            console.error('❌ Error de conexión completo:', error);
            console.error('🌐 URL que falló:', url);
            
            // Si es un error de CORS, dar información específica
            if (error.message.includes('fetch')) {
                console.error('🚫 Posible problema de CORS. Espera a que Vercel se actualice (2-3 minutos)');
            }
            
            return { 
                success: false, 
                error: 'Error de conexión con el servidor',
                data: { message: `No se pudo conectar con el servidor: ${error.message}` }
            };
        }
    }

    // Login de usuarios (cliente o trabajador)
    async login(username, password, userType) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, userType })
        });
        
        // Si el login es exitoso, guardar el token
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    // Registro de nuevo cliente
    async registerCliente(userData) {
        return await this.request('/auth/register/cliente', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Registro general (cliente o trabajador)
    async register(username, password, nombre, correo, telefono, userType) {
        const userData = {
            username,
            password,
            nombre,
            correo,
            telefono
        };

        const endpoint = userType === 'trabajador' 
            ? '/auth/register/trabajador' 
            : '/auth/register/cliente';

        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Verificar token JWT
    async verifyToken() {
        if (!this.token) {
            return { 
                success: false, 
                data: { message: 'No hay token almacenado' } 
            };
        }
        
        return await this.request('/auth/verify');
    }

    // Obtener perfil del usuario autenticado
    async getProfile() {
        return await this.request('/auth/profile');
    }

    // Verificar salud del servidor
    async checkHealth() {
        return await this.request('/health');
    }

    // Gestionar token de autenticación
    setToken(token) {
        this.token = token;
        localStorage.setItem('cine_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('cine_token');
        localStorage.removeItem('cine_user');
    }

    getToken() {
        return this.token;
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Obtener datos de la tabla datosExcel
    async getDatosExcel() {
        return await this.request('/auth/datos-excel');
    }
}

// Crear instancia global para usar en toda la aplicación
window.DB = new DatabaseConnection();

// Verificar conexión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await window.DB.checkHealth();
        if (health.success) {
            console.log('✅ Conexión con el servidor establecida');
        } else {
            console.warn('⚠️ El servidor no está respondiendo');
        }
    } catch (error) {
        console.error('❌ Error verificando conexión:', error);
    }
});