document.addEventListener('DOMContentLoaded', () => {

    const fileUrl = 'egyetem/statgyak.xlsx';
    const statusCard = document.getElementById('status-card');
    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-desc');
    const statusIcon = document.getElementById('status-icon');
    const excelViewer = document.getElementById('excel-viewer');
    const sheetTabsContainer = document.getElementById('sheet-tabs');
    const tableContainer = document.getElementById('table-container');
    const searchInput = document.getElementById('table-search');
    const fileUpload = document.getElementById('file-upload');
    
    // Mobile Drawer Navigation elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    let currentWorkbook = null;

    // Mobile Sidebar Drawer Actions
    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling when drawer is open
        }
    }

    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    }

    // Bind event listeners for mobile drawer
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate bubbling if any
            if (sidebar && sidebar.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Close drawer when clicking a link or file-item inside the sidebar
    if (sidebar) {
        sidebar.querySelectorAll('a, button, .file-item').forEach(element => {
            // Skip the close button itself to avoid redundant calls, though harmless
            if (element.id === 'sidebar-close') return;
            element.addEventListener('click', () => {
                closeSidebar();
            });
        });
    }

    // Helper: Update Status UI
    function setStatus(type, title, message) {
        statusCard.className = `status-card ${type}`;
        statusDesc.textContent = message;
        statusTitle.textContent = title;

        let iconHtml = '';
        if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-spinner fa-spin"></i>';
            excelViewer.style.display = 'none';
            searchInput.disabled = true;
        } else if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check"></i>';
            excelViewer.style.display = 'flex';
            searchInput.disabled = false;
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
            excelViewer.style.display = 'none';
            searchInput.disabled = true;
        }
        statusCard.querySelector('.status-icon').innerHTML = iconHtml;
    }

    // Process and Load Excel Workbook
    function loadWorkbook(workbook, sourceName) {
        currentWorkbook = workbook;
        
        // Clear previous viewer state
        sheetTabsContainer.innerHTML = '';
        tableContainer.innerHTML = '';
        searchInput.value = '';

        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
            setStatus('error', 'Sikertelen betöltés', 'Ez az Excel fájl nem tartalmaz munkalapokat.');
            return;
        }

        // Generate sheet selector tabs
        sheetNames.forEach((sheetName, index) => {
            const tabBtn = document.createElement('button');
            tabBtn.className = `sheet-tab ${index === 0 ? 'active' : ''}`;
            tabBtn.textContent = sheetName;
            tabBtn.addEventListener('click', () => {
                // Switch sheet
                document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
                tabBtn.classList.add('active');
                renderSheet(sheetName);
            });
            sheetTabsContainer.appendChild(tabBtn);
        });

        // Load the first sheet by default
        renderSheet(sheetNames[0]);
        setStatus('success', 'Fájl sikeresen betöltve', `Jelenleg megtekintve: ${sourceName}`);
    }

    // Render individual sheet as HTML table
    function renderSheet(sheetName) {
        const worksheet = currentWorkbook.Sheets[sheetName];
        
        // Convert sheet to HTML table using SheetJS utility
        let htmlTable = XLSX.utils.sheet_to_html(worksheet, { id: 'excel-data-table', editable: false });
        
        // Insert into container
        tableContainer.innerHTML = htmlTable;

        // Customise the table (e.g. clean up empty labels or format layout)
        const table = tableContainer.querySelector('table');
        if (table) {
            table.setAttribute('border', '0');
            
            // If the first row contains table headers, we make sure they use <th>
            const firstRow = table.querySelector('tr');
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                cells.forEach(cell => {
                    const th = document.createElement('th');
                    th.innerHTML = cell.innerHTML;
                    // Copy colspan or rowspan if present
                    if (cell.getAttribute('colspan')) th.setAttribute('colspan', cell.getAttribute('colspan'));
                    if (cell.getAttribute('rowspan')) th.setAttribute('rowspan', cell.getAttribute('rowspan'));
                    cell.replaceWith(th);
                });
            }
        }

        // Reset search value on sheet change
        searchInput.value = '';
    }

    // Fetch the Excel file from local path / GitHub repo
    function fetchExcelFile() {
        setStatus('info', 'Fájl betöltése folyamatban...', `Kapcsolódás a '${fileUrl}' fájlhoz a tárhelyről...`);

        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP hiba! státusz: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(data => {
                const arr = new Uint8Array(data);
                const workbook = XLSX.read(arr, { type: 'array' });
                loadWorkbook(workbook, 'statgyak.xlsx');
            })
            .catch(error => {
                console.error('Error fetching file:', error);
                setStatus(
                    'error', 
                    'A statgyak.xlsx nem tölthető be automatikusan', 
                    `A fájl nem található a megadott útvonalon (${fileUrl}). Kérlek ellenőrizd, hogy a fájl a helyén van-e a repóban! Addig is, próbáld ki a betöltést a jobb oldali gombbal.`
                );
            });
    }

    // ==========================================
    // 5. SEARCH & FILTERING IN TABLE
    // ==========================================
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const table = tableContainer.querySelector('table');
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        
        // Loop through all table rows, skip the header row (index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td, th');
            let rowContainsQuery = false;

            cells.forEach(cell => {
                if (cell.textContent.toLowerCase().includes(query)) {
                    rowContainsQuery = true;
                }
            });

            if (rowContainsQuery || query === '') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });

    // ==========================================
    // 6. FILE UPLOADER HANDLER (FALLBACK)
    // ==========================================
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('info', 'Helyi fájl feldolgozása...', `A(z) ${file.name} fájl beolvasása...`);

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                loadWorkbook(workbook, file.name);
            } catch (err) {
                console.error(err);
                setStatus('error', 'Sikertelen fájl feldolgozás', 'Nem sikerült beolvasni a fájlt. Ellenőrizd, hogy valóban érvényes Excel (.xlsx) formátum-e.');
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Initialise fetch
    fetchExcelFile();

});
