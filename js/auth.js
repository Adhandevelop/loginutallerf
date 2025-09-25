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
        
        // Validación en tiempo real para campos de registro
        this.bindRealTimeValidation();
        
        // Toggle entre cliente y trabajador
        if (this.userTypeToggle) {
            this.userTypeToggle.addEventListener('change', (e) => {
                this.userType = e.target.checked ? 'trabajador' : 'cliente';
                this.updateLoginForm();
            });
        }
    }

    // Validación en tiempo real
    bindRealTimeValidation() {
        const fields = [
            { id: 'regUsername', validator: this.validateUsername },
            { id: 'regPassword', validator: this.validatePassword },
            { id: 'regConfirmPassword', validator: this.validateConfirmPassword },
            { id: 'regNombre', validator: this.validateNombre },
            { id: 'regCorreo', validator: this.validateCorreo },
            { id: 'regTelefono', validator: this.validateTelefono }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('blur', () => {
                    this.validateField(element, field.validator);
                });
                element.addEventListener('input', () => {
                    this.clearFieldError(element);
                });
            }
        });
    }

    validateField(element, validator) {
        const result = validator.call(this, element.value);
        if (!result.isValid) {
            this.showFieldError(element, result.message);
        } else {
            this.clearFieldError(element);
        }
    }

    showFieldError(element, message) {
        this.clearFieldError(element);
        element.style.borderColor = '#dc2626';
        element.style.backgroundColor = '#fef2f2';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            font-size: 0.8em;
            margin-top: 5px;
            display: block;
        `;
        errorDiv.textContent = message;
        
        element.parentNode.appendChild(errorDiv);
    }

    clearFieldError(element) {
        element.style.borderColor = '';
        element.style.backgroundColor = '';
        
        const existingError = element.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Validadores individuales
    validateUsername(value) {
        if (value.length < 4) return { isValid: false, message: 'Mínimo 4 caracteres' };
        if (!/^[a-zA-Z0-9._-]+$/.test(value)) return { isValid: false, message: 'Solo letras, números, puntos y guiones' };
        return { isValid: true };
    }

    validatePassword(value) {
        if (value.length < 9) return { isValid: false, message: 'Mínimo 9 caracteres' };
        if (value.includes(' ')) return { isValid: false, message: 'No puede contener espacios' };
        if (!/^[a-zA-Z0-9@#$%^&+=!?._-]+$/.test(value)) return { isValid: false, message: 'Caracteres no permitidos' };
        return { isValid: true };
    }

    validateConfirmPassword(value) {
        const password = document.getElementById('regPassword').value;
        if (value !== password) return { isValid: false, message: 'Las contraseñas no coinciden' };
        return { isValid: true };
    }

    validateNombre(value) {
        if (value.length < 5) return { isValid: false, message: 'Mínimo 5 caracteres' };
        if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(value)) return { isValid: false, message: 'Solo letras y espacios' };
        return { isValid: true };
    }

    validateCorreo(value) {
        if (value.length < 9) return { isValid: false, message: 'Mínimo 9 caracteres' };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { isValid: false, message: 'Formato de email inválido' };
        return { isValid: true };
    }

    validateTelefono(value) {
        if (value.length < 9) return { isValid: false, message: 'Mínimo 9 caracteres' };
        if (!/^[0-9\s\-\(\)\+]+$/.test(value)) return { isValid: false, message: 'Solo números, espacios y guiones' };
        return { isValid: true };
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
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const nombre = document.getElementById('regNombre').value.trim();
        const correo = document.getElementById('regCorreo').value.trim();
        const telefono = document.getElementById('regTelefono').value.trim();
        
        // Validaciones detalladas
        const validationResult = this.validateRegistrationData({
            username, password, confirmPassword, nombre, correo, telefono
        });
        
        if (!validationResult.isValid) {
            this.showMessage(validationResult.message, 'error');
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

    // Validaciones detalladas para el registro
    validateRegistrationData({ username, password, confirmPassword, nombre, correo, telefono }) {
        // Validar longitud mínima de todos los campos
        if (username.length < 4) {
            return { isValid: false, message: 'El usuario debe tener al menos 4 caracteres' };
        }
        
        if (password.length < 9) {
            return { isValid: false, message: 'La contraseña debe tener al menos 9 caracteres' };
        }
        
        if (nombre.length < 5) {
            return { isValid: false, message: 'El nombre debe tener al menos 5 caracteres' };
        }
        
        if (correo.length < 9) {
            return { isValid: false, message: 'El correo debe tener al menos 9 caracteres' };
        }
        
        if (telefono.length < 9) {
            return { isValid: false, message: 'El teléfono debe tener al menos 9 caracteres' };
        }
        
        // Validar coincidencia de contraseñas
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Las contraseñas no coinciden' };
        }
        
        // Validar que la contraseña no tenga espacios ni caracteres peligrosos
        const passwordRegex = /^[a-zA-Z0-9@#$%^&+=!?._-]+$/;
        if (!passwordRegex.test(password)) {
            return { isValid: false, message: 'La contraseña solo puede contener letras, números y estos símbolos: @#$%^&+=!?._-' };
        }
        
        if (password.includes(' ')) {
            return { isValid: false, message: 'La contraseña no puede contener espacios' };
        }
        
        // Validar que el nombre solo tenga letras y espacios
        const nombreRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
        if (!nombreRegex.test(nombre)) {
            return { isValid: false, message: 'El nombre solo puede contener letras y espacios' };
        }
        
        // Validar que el username no tenga caracteres especiales peligrosos
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return { isValid: false, message: 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos' };
        }
        
        // Validar formato de email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return { isValid: false, message: 'El formato del correo electrónico no es válido' };
        }
        
        // Validar que el teléfono solo tenga números, espacios, guiones y paréntesis
        const telefonoRegex = /^[0-9\s\-\(\)\+]+$/;
        if (!telefonoRegex.test(telefono)) {
            return { isValid: false, message: 'El teléfono solo puede contener números, espacios, guiones y paréntesis' };
        }
        
        return { isValid: true, message: 'Datos válidos' };
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