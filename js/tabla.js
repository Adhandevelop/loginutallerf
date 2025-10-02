// Archivo: tabla.js - Manejo de la página de tabla dedicada

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación más detallada
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔐 Verificando autenticación en tabla.html...');
    console.log('Token existe:', !!token);
    console.log('Usuario existe:', !!user);
    
    if (!token || !user) {
        console.log('❌ Sin autenticación válida, redirigiendo...');
        alert('Sesión expirada. Serás redirigido al login.');
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
    // Elementos del DOM
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
            
            const response = await getDatosExcel();
            
            if (response.success && response.data && response.data.length > 0) {
                renderTable(response.data);
                totalRecords.textContent = response.data.length;
                loadingStatus.textContent = 'Datos cargados correctamente';
                showTable();
            } else {
                showError(response.error || 'No se encontraron datos');
            }
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showError('Error de conexión: ' + error.message);
        }
    }

    function renderTable(data) {
        const tbody = dataTable.querySelector('tbody');
        tbody.innerHTML = '';

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id || ''}</td>
                <td>${formatValue(row.nrocto)}</td>
                <td>${formatValue(row.contratista)}</td>
                <td class="binary-field">${formatValue(row.identificacion)}</td>
                <td>${formatValue(row.objeto)}</td>
                <td>${formatValue(row.cdp)}</td>
                <td>${formatValue(row.tiempo)}</td>
                <td class="binary-field">${formatValue(row.vrcto)}</td>
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

    function formatValue(value) {
        if (!value && value !== 0) return '';
        
        // Para valores muy largos, mostrar con tooltip
        if (typeof value === 'string' && value.length > 100) {
            return `<span class="long-text" title="${value}">${value.substring(0, 97)}...</span>`;
        }
        
        return value;
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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