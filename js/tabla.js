// Archivo: tabla.js - Manejo de la página de tabla dedicada

document.addEventListener('DOMContentLoaded', function() {
    // Verificación de autenticación usando las claves correctas
    const token = localStorage.getItem('cine_token');
    const user = localStorage.getItem('cine_user');
    
    console.log('🔐 Verificando autenticación en tabla.html...');
    console.log('Token existe:', !!token);
    console.log('Usuario existe:', !!user);
    
    if (!token || !user) {
        console.log('❌ Sin autenticación válida, redirigiendo al login...');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('✅ Autenticación válida, cargando tabla...');

    // Pequeño retraso para asegurar que conexion.js se cargue
    setTimeout(() => {
        initializeTable();
    }, 100);
});

function initializeTable() {
    // Variables de estado
    let currentData = null;
    let showAsText = false; // false = formato binario, true = texto normal
    
    // Elementos del DOM
    const toggleBinaryBtn = document.getElementById('toggleBinaryBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const backBtn = document.getElementById('backBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const retryBtn = document.getElementById('retryBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorContainer = document.getElementById('errorContainer');
    const tableWrapper = document.getElementById('tableWrapper');
    const dataTable = document.getElementById('dataTable');
    const totalRecords = document.getElementById('totalRecords');
    const loadingStatus = document.getElementById('loadingStatus');
    const errorMessage = document.getElementById('errorMessage');

    // Event listeners
    toggleBinaryBtn.addEventListener('click', toggleBinaryFormat);
    refreshBtn.addEventListener('click', loadTableData);
    backBtn.addEventListener('click', () => window.location.href = 'index.html');
    logoutBtn.addEventListener('click', logout);
    retryBtn.addEventListener('click', loadTableData);

    // Cargar datos al iniciar
    loadTableData();

    async function loadTableData() {
        showLoading();
        
        try {
            loadingStatus.textContent = 'Obteniendo datos...';
            
            console.log('🔍 Solicitando datos...');
            const response = await getDatosExcel();
            
            console.log('📡 Respuesta recibida:', response);
            
            if (response.success) {
                // Los datos pueden estar en response.data.data o response.data
                const actualData = response.data?.data || response.data;
                
                console.log('📊 Datos procesados:', actualData);
                
                if (actualData && Array.isArray(actualData) && actualData.length > 0) {
                    console.log('✅ Datos encontrados:', actualData.length, 'registros');
                    renderTable(actualData);
                    totalRecords.textContent = actualData.length;
                    loadingStatus.textContent = 'Datos cargados correctamente';
                    showTable();
                } else {
                    console.log('⚠️ Respuesta exitosa pero sin datos válidos');
                    showError('No se encontraron datos válidos');
                }
            } else {
                console.log('❌ Error en respuesta:', response.error);
                showError(response.error || 'Error al obtener datos');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            console.error('❌ Detalles del error:', {
                message: error.message,
                stack: error.stack,
                windowDB: !!window.DB,
                token: !!localStorage.getItem('cine_token')
            });
            showError('Error de conexión: ' + error.message);
        }
    }

    function renderTable(data) {
        currentData = data; // Guardar datos para re-render
        const tbody = dataTable.querySelector('tbody');
        tbody.innerHTML = '';

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id || ''}</td>
                <td>${formatValue(row.nrocto)}</td>
                <td>${formatValue(row.contratista)}</td>
                <td class="binary-field">${formatValue(row.identificacion, 'identificacion')}</td>
                <td>${formatValue(row.objeto)}</td>
                <td>${formatValue(row.cdp)}</td>
                <td>${formatValue(row.tiempo)}</td>
                <td class="binary-field">${formatValue(row.vrcto, 'vrcto')}</td>
                <td>${formatValue(row.unidad)}</td>
                <td>${formatValue(row.rubro)}</td>
            `;
            
            // Alternar colores de filas
            if (index % 2 === 0) {
                tr.classList.add('even-row');
            }
            
            tbody.appendChild(tr);
        });
    }

    function formatValue(value, columnName) {
        if (!value && value !== 0) return '';
        
        // Para campos binarios (identificacion y vrcto)
        if ((columnName === 'identificacion' || columnName === 'vrcto') && 
            typeof value === 'string' && value.startsWith('\\x')) {
            
            if (showAsText) {
                // Convertir hexadecimal a texto legible
                const convertedText = hexToText(value);
                return `<span class="converted-text" title="Original: ${value}">${convertedText}</span>`;
            } else {
                // Mostrar formato hexadecimal original
                return `<span class="hex-text" title="Hex format">${value}</span>`;
            }
        }
        
        // Para valores muy largos, mostrar con tooltip
        if (typeof value === 'string' && value.length > 100) {
            return `<span class="long-text" title="${value}">${value.substring(0, 97)}...</span>`;
        }
        
        return value;
    }

    // Función para convertir hexadecimal a texto
    function hexToText(hexString) {
        try {
            // Remover los \x y convertir a texto
            const hex = hexString.replace(/\\x/g, '');
            let result = '';
            
            for (let i = 0; i < hex.length; i += 2) {
                const hexPair = hex.substr(i, 2);
                const charCode = parseInt(hexPair, 16);
                
                // Solo agregar caracteres imprimibles
                if (charCode >= 32 && charCode <= 126) {
                    result += String.fromCharCode(charCode);
                } else if (charCode === 46) { // punto decimal
                    result += '.';
                } else {
                    result += '?'; // Para caracteres no imprimibles
                }
            }
            
            return result || 'No convertible';
            
        } catch (error) {
            console.error('Error convirtiendo hex a texto:', error);
            return 'Error de conversión';
        }
    }

    // Función para alternar entre formato binario y texto
    function toggleBinaryFormat() {
        showAsText = !showAsText;
        
        // Actualizar texto del botón
        toggleBinaryBtn.textContent = showAsText 
            ? '🔢 Mostrar Formato Hex' 
            : '📝 Mostrar Texto Normal';
            
        // Actualizar clase del botón
        toggleBinaryBtn.classList.toggle('active', showAsText);
        
        // Re-renderizar la tabla si hay datos
        if (currentData) {
            renderTable(currentData);
        }
    }

    function showLoading() {
        loadingIndicator.style.display = 'flex';
        errorContainer.style.display = 'none';
        tableWrapper.style.display = 'none';
        totalRecords.textContent = 'Cargando...';
    }

    function showTable() {
        loadingIndicator.style.display = 'none';
        errorContainer.style.display = 'none';
        tableWrapper.style.display = 'block';
    }

    function showError(message) {
        loadingIndicator.style.display = 'none';
        tableWrapper.style.display = 'none';
        errorContainer.style.display = 'block';
        errorMessage.textContent = message;
        totalRecords.textContent = 'Error';
        loadingStatus.textContent = 'Error al cargar datos';
    }

    function logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('cine_token');
            localStorage.removeItem('cine_user');
            window.location.href = 'index.html';
        }
    }

    // Usar la función getDatosExcel de conexion.js
    async function getDatosExcel() {
        // Verificar que window.DB esté disponible
        if (!window.DB || !window.DB.getDatosExcel) {
            throw new Error('Sistema de conexión no disponible');
        }
        
        return await window.DB.getDatosExcel();
    }
}