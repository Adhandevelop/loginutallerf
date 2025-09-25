class AuthSystem {
    constructor() {
        this.userType = 'cliente'; // 'cliente' o 'trabajador'
        this.init();
    }
    
    init() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.dashboard = document.getElementById('dashboard');
        this.loginBox = document.querySelector('.login-box');
        this.messageDiv = document.getElementById('message');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.userTypeToggle = document.getElementById('userTypeToggle');
        this.showRegisterLink = document.getElementById('showRegister');
        this.showLoginLink = document.getElementById('showLogin');
        
        this.bindEvents();
        this.checkAuthStatus();
    }
    
    bindEvents() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Enlaces para cambiar entre login y registro
        this.showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        
        this.showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        
        // Toggle entre cliente y trabajador
        if (this.userTypeToggle) {
            this.userTypeToggle.addEventListener('change', (e) => {
                this.userType = e.target.checked ? 'trabajador' : 'cliente';
                this.updateLoginForm();
            });
        }
    }
    
    updateLoginForm() {
        const title = document.querySelector('.logo h1');
        const subtitle = document.querySelector('.logo p');
        
        if (this.userType === 'trabajador') {
            title.innerHTML = '🎬 <span style="color: #dc2626;">Staff</span> CineMax';
            subtitle.textContent = 'Área de trabajadores';
        } else {
            title.innerHTML = '🎬 CineMax';
            subtitle.textContent = 'Tu cine favorito en línea';
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        this.showLoading(true);
        this.hideMessage();
        
        try {
            // Usar la conexión a la base de datos real
            const response = await window.DB.login(username, password, this.userType);
            
            if (response.success) {
                this.loginSuccess(response.data.user, response.data.token);
            } else {
                this.showMessage(response.data.message || 'Error de autenticación', 'error');
            }
        } catch (error) {
            console.error('Error de login:', error);
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async mockLogin(username, password, userType) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Datos de prueba para clientes
                const testClientes = [
                    { 
                        id: 1, 
                        username: 'juanperez', 
                        password: 'cliente123', 
                        name: 'Juan Pérez',
                        type: 'cliente',
                        email: 'juan@email.com'
                    },
                    { 
                        id: 2, 
                        username: 'anag', 
                        password: 'cliente123', 
                        name: 'Ana García',
                        type: 'cliente',
                        email: 'ana@email.com'
                    }
                ];
                
                // Datos de prueba para trabajadores
                const testTrabajadores = [
                    { 
                        id: 101, 
                        username: 'admin', 
                        password: 'admin123', 
                        name: 'Administrador Principal',
                        type: 'trabajador',
                        rol: 'admin',
                        email: 'admin@cinemax.com'
                    },
                    { 
                        id: 102, 
                        username: 'maria.empleado', 
                        password: 'admin123', 
                        name: 'María González',
                        type: 'trabajador',
                        rol: 'empleado',
                        email: 'maria@cinemax.com'
                    },
                    { 
                        id: 103, 
                        username: 'carlos.gerente', 
                        password: 'admin123', 
                        name: 'Carlos Rodríguez',
                        type: 'trabajador',
                        rol: 'gerente',
                        email: 'carlos@cinemax.com'
                    }
                ];
                
                const users = userType === 'trabajador' ? testTrabajadores : testClientes;
                const user = users.find(u => u.username === username && u.password === password);
                
                resolve(user || null);
            }, 1000);
        });
    }
    
    loginSuccess(user, token) {
        localStorage.setItem('cine_user', JSON.stringify(user));
        if (token) {
            localStorage.setItem('cine_token', token);
        }
        this.showDashboard(user);
        this.showMessage(`¡Bienvenido ${user.name}! (${user.userType})`, 'success');
    }
    
    showDashboard(user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.rol ? `Rol: ${user.rol}` : 'Cliente';
        document.getElementById('userType').textContent = `Tipo: ${user.userType}`;
        
        this.loginBox.style.display = 'none';
        this.dashboard.style.display = 'block';
    }
    
    handleLogout() {
        window.DB.removeToken();
        this.dashboard.style.display = 'none';
        this.loginBox.style.display = 'block';
        this.hideMessage();
        this.loginForm.reset();
    }
    
    checkAuthStatus() {
        const user = localStorage.getItem('cine_user');
        const token = localStorage.getItem('cine_token');
        if (user && token) {
            this.showDashboard(JSON.parse(user));
        }
    }
    
    showLoadingOld(show) {
        if (show) {
            this.loginBtn.innerHTML = '<div class="btn-loader">Cargando...</div>';
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.innerHTML = 'Iniciar Sesión';
            this.loginBtn.disabled = false;
        }
    }
    
    showMessage(message, type) {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';
    }
    
    hideMessage() {
        this.messageDiv.style.display = 'none';
    }

    // Funciones para manejar el registro
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const nombre = document.getElementById('regNombre').value;
        const correo = document.getElementById('regCorreo').value;
        const telefono = document.getElementById('regTelefono').value;
        
        // Validaciones
        if (password !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        this.showLoading(true, 'register');
        this.hideMessage();
        
        try {
            const response = await window.DB.register(username, password, nombre, correo, telefono, this.userType);
            
            if (response.success) {
                this.showMessage('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', 'success');
                setTimeout(() => {
                    this.showLoginForm();
                    this.clearRegisterForm();
                }, 2000);
            } else {
                this.showMessage(response.data.message || 'Error al crear la cuenta', 'error');
            }
        } catch (error) {
            console.error('Error de registro:', error);
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
        } finally {
            this.showLoading(false, 'register');
        }
    }

    showRegisterForm() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
        this.showRegisterLink.style.display = 'none';
        this.showLoginLink.style.display = 'inline';
        this.hideMessage();
        
        // Actualizar título
        const title = document.querySelector('.logo h1');
        const subtitle = document.querySelector('.logo p');
        title.innerHTML = '🎬 CineMax <span style="color: #dc2626;">Registro</span>';
        subtitle.textContent = 'Crear nueva cuenta';
    }

    showLoginForm() {
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.showRegisterLink.style.display = 'inline';
        this.showLoginLink.style.display = 'none';
        this.hideMessage();
        
        // Restaurar título
        this.updateLoginForm();
    }

    clearRegisterForm() {
        document.getElementById('regUsername').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regConfirmPassword').value = '';
        document.getElementById('regNombre').value = '';
        document.getElementById('regCorreo').value = '';
        document.getElementById('regTelefono').value = '';
    }

    showLoading(show, form = 'login') {
        const btnId = form === 'register' ? 'registerBtn' : 'loginBtn';
        const btn = document.getElementById(btnId);
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        
        if (show) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }
}

// Inicializar el sistema de autenticación
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});