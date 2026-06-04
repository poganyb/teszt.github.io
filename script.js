document.addEventListener('DOMContentLoaded', () => {

    const statusCard = document.getElementById('status-card');
    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-desc');
    const statusIcon = document.getElementById('status-icon');
    const excelViewer = document.getElementById('excel-viewer');
    const sheetTabsContainer = document.getElementById('sheet-tabs');
    const tableContainer = document.getElementById('table-container');
    const searchInput = document.getElementById('table-search');
    const fileUpload = document.getElementById('file-upload');
    const fileTreeContainer = document.getElementById('file-tree-container');
    
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

    // Fallback tree structure for offline/local view
    const fallbackTree = [
        {
            name: 'penzugyek',
            type: 'dir',
            path: 'egyetem/penzugyek',
            children: [
                {
                    name: 'bemutato1.pptx',
                    type: 'file',
                    path: 'egyetem/penzugyek/bemutato1.pptx'
                },
                {
                    name: 'prezentacio2.ppt',
                    type: 'file',
                    path: 'egyetem/penzugyek/prezentacio2.ppt'
                }
            ]
        },
        {
            name: 'prog',
            type: 'dir',
            path: 'egyetem/prog',
            children: [
                {
                    name: 'futtat.py',
                    type: 'file',
                    path: 'egyetem/prog/futtat.py'
                },
                {
                    name: 'dokumentum.docx',
                    type: 'file',
                    path: 'egyetem/prog/dokumentum.docx'
                }
            ]
        },
        {
            name: 'statisztika',
            type: 'dir',
            path: 'egyetem/statisztika',
            children: [
                {
                    name: 'statgyak.xlsx',
                    type: 'file',
                    path: 'egyetem/statisztika/statgyak.xlsx'
                },
                {
                    name: 'statmegoldo.xlsx',
                    type: 'file',
                    path: 'egyetem/statisztika/statmegoldo.xlsx'
                },
                {
                    name: 'statzhmegoldo.xlsx',
                    type: 'file',
                    path: 'egyetem/statisztika/statzhmegoldo.xlsx'
                }
            ]
        }
    ];

    const repoOwner = 'poganyb';
    const repoName = 'teszt.github.io';
    const baseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/egyetem`;

    // Check if an item contains the active child file path
    function hasActiveChild(item, activePath) {
        if (item.type === 'file') {
            return item.path === activePath;
        }
        if (item.type === 'dir' && item.children) {
            return item.children.some(child => hasActiveChild(child, activePath));
        }
        return false;
    }

    // Helper: Find first Excel file in tree
    function findFirstExcelFile(items) {
        for (const item of items) {
            if (item.type === 'file') {
                const ext = item.name.split('.').pop().toLowerCase();
                if (ext === 'xlsx' || ext === 'xls') {
                    return item;
                }
            } else if (item.type === 'dir' && item.children) {
                const found = findFirstExcelFile(item.children);
                if (found) return found;
            }
        }
        return null;
    }

    // Load File (checks file extension and routes to appropriate viewer)
    function loadFile(path, name) {
        const ext = name.split('.').pop().toLowerCase();
        
        // Select viewers
        const codeViewer = document.getElementById('code-viewer');
        const downloadViewer = document.getElementById('download-viewer');
        
        // Hide all viewers initially
        excelViewer.style.display = 'none';
        if (codeViewer) codeViewer.style.display = 'none';
        if (downloadViewer) downloadViewer.style.display = 'none';
        
        if (ext === 'xlsx' || ext === 'xls') {
            setStatus('info', 'Excel fájl betöltése folyamatban...', `Kapcsolódás a '${path}' fájlhoz a tárhelyről...`);
            
            fetch(path)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP hiba! státusz: ${response.status}`);
                    return response.arrayBuffer();
                })
                .then(data => {
                    const arr = new Uint8Array(data);
                    const workbook = XLSX.read(arr, { type: 'array' });
                    loadWorkbook(workbook, name);
                })
                .catch(error => {
                    console.error('Error fetching file:', error);
                    setStatus(
                        'error', 
                        'A fájl nem tölthető be automatikusan', 
                        `A(z) ${name} fájl nem érhető el. Próbáld meg betölteni a Másik fájl betöltése gombbal.`
                    );
                });
        } else if (['py', 'cpp', 'c', 'java', 'js', 'html', 'css', 'json', 'txt', 'cs', 'h', 'sh', 'xml'].includes(ext)) {
            setStatus('info', 'Forráskód betöltése...', `Beolvasás folyamatban: ${name}...`);
            
            fetch(path)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP hiba! státusz: ${response.status}`);
                    return response.text();
                })
                .then(text => {
                    if (codeViewer) {
                        const codeTitle = document.getElementById('code-file-title');
                        const codeContainer = document.getElementById('code-container');
                        
                        if (codeTitle) codeTitle.textContent = name;
                        if (codeContainer) codeContainer.textContent = text;
                        
                        codeViewer.style.display = 'flex';
                        setStatus('success', 'Fájl sikeresen betöltve', `Jelenleg megtekintve: ${name}`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching file:', error);
                    setStatus('error', 'Sikertelen megnyitás', `Nem sikerült beolvasni a(z) ${name} fájl tartalmát.`);
                });
        } else {
            // Binary formats (ZIP, PDF, Word doc, docx, etc.) -> Show Download Card
            setStatus('info', 'Fájl megnyitása...', `A(z) ${name} közvetlenül nem jeleníthető meg.`);
            
            if (downloadViewer) {
                const cardIcon = document.getElementById('download-card-icon');
                const cardTitle = document.getElementById('download-card-title');
                const cardDesc = document.getElementById('download-card-desc');
                const cardButton = document.getElementById('download-card-button');
                
                // Set appropriate icon class
                let iconClass = 'fa-regular fa-file';
                let iconColorClass = 'generic-icon';
                
                if (ext === 'pdf') {
                    iconClass = 'fa-regular fa-file-pdf';
                    iconColorClass = 'pdf-icon';
                } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
                    iconClass = 'fa-regular fa-file-zipper';
                    iconColorClass = 'zip-icon';
                } else if (ext === 'docx' || ext === 'doc') {
                    iconClass = 'fa-regular fa-file-word';
                    iconColorClass = 'word-icon';
                } else if (ext === 'pptx' || ext === 'ppt') {
                    iconClass = 'fa-regular fa-file-powerpoint';
                    iconColorClass = 'ppt-icon';
                }
                
                if (cardIcon) cardIcon.className = `${iconClass} ${iconColorClass}`;
                if (cardTitle) cardTitle.textContent = name;
                if (cardDesc) cardDesc.textContent = `A(z) .${ext.toUpperCase()} fájlformátum közvetlenül nem jeleníthető meg a böngészőben.`;
                if (cardButton) {
                    cardButton.href = path;
                    cardButton.setAttribute('download', name);
                }
                
                downloadViewer.style.display = 'flex';
                setStatus('success', 'Fájl letöltésre kész', `Fájl elérése: ${name}`);
            }
        }
    }

    // Fetch folder content recursively from GitHub Contents API
    async function fetchGitHubDirectory(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const data = await response.json();
        
        // Filter out readmes, keep everything else
        const filtered = data.filter(item => {
            if (item.name.toLowerCase().includes('readme')) return false;
            return true;
        });
        
        const items = [];
        for (const item of filtered) {
            const treeItem = {
                name: item.name,
                path: item.path,
                type: item.type === 'dir' ? 'dir' : 'file',
                children: []
            };
            
            if (item.type === 'dir' && item.url) {
                try {
                    treeItem.children = await fetchGitHubDirectory(item.url);
                } catch (e) {
                    console.error(`Subfolder ${item.name} fetch failed:`, e);
                }
            }
            items.push(treeItem);
        }
        return items;
    }

    // Render tree into container
    function renderFileTree(items, container, level = 0, activePath = '') {
        const ul = document.createElement('ul');
        ul.className = level === 0 ? 'file-list' : 'file-list submenu';
        
        items.forEach(item => {
            const li = document.createElement('li');
            
            if (item.type === 'dir') {
                li.className = 'folder-item';
                
                const folderHeader = document.createElement('div');
                folderHeader.className = 'folder-header';
                
                const shouldExpand = hasActiveChild(item, activePath);
                
                folderHeader.innerHTML = `
                    <i class="${shouldExpand ? 'fa-solid fa-folder-open' : 'fa-solid fa-folder'} folder-icon"></i>
                    <span class="folder-name">${item.name}</span>
                    <i class="fa-solid fa-chevron-right folder-chevron" style="transform: ${shouldExpand ? 'rotate(90deg)' : 'rotate(0deg)'}"></i>
                `;
                
                const submenuContainer = document.createElement('div');
                submenuContainer.className = shouldExpand ? 'submenu-container' : 'submenu-container collapsed';
                
                if (item.children && item.children.length > 0) {
                    renderFileTree(item.children, submenuContainer, level + 1, activePath);
                } else {
                    submenuContainer.innerHTML = '<div class="empty-folder">Üres mappa</div>';
                }
                
                folderHeader.addEventListener('click', () => {
                    const isCollapsed = submenuContainer.classList.contains('collapsed');
                    if (isCollapsed) {
                        submenuContainer.classList.remove('collapsed');
                        folderHeader.querySelector('.folder-icon').className = 'fa-solid fa-folder-open folder-icon';
                        folderHeader.querySelector('.folder-chevron').style.transform = 'rotate(90deg)';
                    } else {
                        submenuContainer.classList.add('collapsed');
                        folderHeader.querySelector('.folder-icon').className = 'fa-solid fa-folder folder-icon';
                        folderHeader.querySelector('.folder-chevron').style.transform = 'rotate(0deg)';
                    }
                });
                
                li.appendChild(folderHeader);
                li.appendChild(submenuContainer);
            } else {
                li.className = 'file-item';
                if (item.path === activePath) {
                    li.classList.add('active');
                }
                li.dataset.path = item.path;
                
                // Determine icon based on file extension
                let iconClass = 'fa-regular fa-file';
                let iconColorClass = 'generic-icon';
                const ext = item.name.split('.').pop().toLowerCase();
                
                if (ext === 'xlsx' || ext === 'xls') {
                    iconClass = 'fa-regular fa-file-excel';
                    iconColorClass = 'excel-icon';
                } else if (['py', 'cpp', 'c', 'java', 'js', 'html', 'css', 'json', 'txt', 'cs', 'h', 'sh', 'xml'].includes(ext)) {
                    iconClass = 'fa-regular fa-file-code';
                    iconColorClass = 'code-icon';
                } else if (ext === 'pdf') {
                    iconClass = 'fa-regular fa-file-pdf';
                    iconColorClass = 'pdf-icon';
                } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
                    iconClass = 'fa-regular fa-file-zipper';
                    iconColorClass = 'zip-icon';
                } else if (ext === 'docx' || ext === 'doc') {
                    iconClass = 'fa-regular fa-file-word';
                    iconColorClass = 'word-icon';
                } else if (ext === 'pptx' || ext === 'ppt') {
                    iconClass = 'fa-regular fa-file-powerpoint';
                    iconColorClass = 'ppt-icon';
                }
                
                li.innerHTML = `
                    <div class="file-info-group">
                        <i class="${iconClass} ${iconColorClass}"></i>
                        <div class="file-details">
                            <span class="file-name">${item.name}</span>
                            <span class="file-path">${item.path}</span>
                        </div>
                    </div>
                    <a href="${item.path}" download class="btn-download-file" title="Letöltés">
                        <i class="fa-solid fa-download"></i>
                    </a>
                `;
                
                li.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-download-file')) return;
                    
                    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    
                    loadFile(item.path, item.name);
                    closeSidebar();
                });
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    // Initialize Folder Navigation
    async function initFolderNavigation() {
        setStatus('info', 'Fájllista betöltése...', 'Kapcsolódás a tárhelyhez...');
        let treeData = null;
        
        try {
            treeData = await fetchGitHubDirectory(baseApiUrl);
        } catch (e) {
            console.warn("GitHub API error, using offline fallback tree:", e);
            treeData = fallbackTree;
        }

        // Render file tree
        fileTreeContainer.innerHTML = '';
        const defaultFile = findFirstExcelFile(treeData);
        const defaultPath = defaultFile ? defaultFile.path : '';
        
        renderFileTree(treeData, fileTreeContainer, 0, defaultPath);

        if (defaultFile) {
            loadFile(defaultFile.path, defaultFile.name);
        } else {
            setStatus('error', 'Nincsenek elérhető fájlok', 'Nem találtunk megjeleníthető fájlt a tárhelyen.');
        }
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
    initFolderNavigation();

});
