document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LIVE CLOCK IN HEADER
    // ==========================================
    const headerClock = document.getElementById('header-clock');
    if (headerClock) {
        function updateClock() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            headerClock.textContent = `${year}.${month}.${day}. ${hours}:${minutes}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    // ==========================================
    // 2. MOBILE DRAWER NAVIGATION
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // ==========================================
    // 3. CALENDAR GENERATION LOGIC
    // ==========================================
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');

    // Modal elements
    const notesModal = document.getElementById('notes-modal');
    const notesDateDisplay = document.getElementById('notes-date-display');
    const notesTextarea = document.getElementById('notes-textarea');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelNote = document.getElementById('btn-cancel-note');
    const btnSaveNote = document.getElementById('btn-save-note');

    const monthsHu = [
        'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
        'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];

    let viewDate = new Date(); // Date state of active month
    let selectedDateStr = ''; // Stores clicked date string in YYYY-MM-DD format

    // Render calendar grid
    function renderCalendar() {
        if (!calendarGrid || !calendarMonthYear) return;

        calendarGrid.innerHTML = '';
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Hungarian Title header
        calendarMonthYear.textContent = `${monthsHu[month]} ${year}`;

        // Get details of active month
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const totalDays = lastDayOfMonth.getDate();

        // Day of week index (0 = Sunday, 1 = Monday, etc.)
        let startDayOfWeek = firstDayOfMonth.getDay();
        
        // Adjust to make Monday index 0, and Sunday index 6 (European standards)
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        // Details of previous month (for padding)
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

        // 1. Render preceding month padding boxes
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const prevDayNum = lastDayOfPrevMonth - i;
            const padCell = createDayCell(year, month - 1, prevDayNum, true);
            calendarGrid.appendChild(padCell);
        }

        // 2. Render active month days
        const today = new Date();
        for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
            const isToday = today.getFullYear() === year && 
                            today.getMonth() === month && 
                            today.getDate() === dayNum;
                            
            const dayCell = createDayCell(year, month, dayNum, false, isToday);
            calendarGrid.appendChild(dayCell);
        }

        // 3. Render subsequent month padding boxes to complete the 7x6 (42) or 7x5 grid
        const totalRendered = startDayOfWeek + totalDays;
        const totalRequired = totalRendered > 35 ? 42 : 35;
        const paddingRequired = totalRequired - totalRendered;

        for (let nextDayNum = 1; nextDayNum <= paddingRequired; nextDayNum++) {
            const padCell = createDayCell(year, month + 1, nextDayNum, true);
            calendarGrid.appendChild(padCell);
        }
    }

    // Helper: Create day cell element
    function createDayCell(year, month, day, isOtherMonth, isToday = false) {
        // Handle overflow of months (e.g. prev month of January is December of prev year)
        const realDate = new Date(year, month, day);
        const yStr = realDate.getFullYear();
        const mStr = String(realDate.getMonth() + 1).padStart(2, '0');
        const dStr = String(realDate.getDate()).padStart(2, '0');
        const dateKey = `portal_notes_${yStr}-${mStr}-${dStr}`;

        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        if (isOtherMonth) cell.classList.add('other-month');
        if (isToday) cell.classList.add('current-day');

        // Number wrapper
        const numSpan = document.createElement('span');
        numSpan.className = 'calendar-day-number';
        numSpan.textContent = realDate.getDate();
        cell.appendChild(numSpan);

        // Load daily note indicator
        const noteVal = localStorage.getItem(dateKey);
        if (noteVal) {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'calendar-notes-indicator';
            
            const badge = document.createElement('span');
            badge.className = 'note-badge';
            badge.textContent = noteVal; // Show note text snippet
            badge.title = noteVal;
            
            indicatorDiv.appendChild(badge);
            cell.appendChild(indicatorDiv);
        }

        // Event listener to open note modal editor
        cell.addEventListener('click', () => {
            selectedDateStr = `${yStr}-${mStr}-${dStr}`;
            openNoteEditor(realDate, noteVal || '');
        });

        return cell;
    }

    // ==========================================
    // 4. NOTES EDITOR DIALOG/MODAL ACTIONS
    // ==========================================
    function openNoteEditor(dateObj, noteText) {
        if (!notesModal || !notesDateDisplay || !notesTextarea) return;

        // Display nicely formatted Hungarian date
        const formattedDate = `${dateObj.getFullYear()}. ${monthsHu[dateObj.getMonth()]} ${dateObj.getDate()}.`;
        notesDateDisplay.textContent = formattedDate;

        // Load note text
        notesTextarea.value = noteText;

        // Open modal overlay
        notesModal.classList.add('active');
        notesTextarea.focus();
    }

    function closeModal() {
        if (notesModal) {
            notesModal.classList.remove('active');
        }
    }

    // Save Daily Note
    function saveNote() {
        if (!selectedDateStr) return;
        const noteKey = `portal_notes_${selectedDateStr}`;
        const noteText = notesTextarea.value.trim();

        if (noteText) {
            localStorage.setItem(noteKey, noteText);
        } else {
            localStorage.removeItem(noteKey); // Remove if cleared
        }

        closeModal();
        renderCalendar(); // Re-render to show/update note badge
    }

    // Bind navigation actions
    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Bind modal actions
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelNote) btnCancelNote.addEventListener('click', closeModal);
    if (btnSaveNote) btnSaveNote.addEventListener('click', saveNote);

    // Close modal when clicking on dark backdrop
    if (notesModal) {
        notesModal.addEventListener('click', (e) => {
            if (e.target === notesModal) {
                closeModal();
            }
        });
    }

    // Initialize calendar
    renderCalendar();

});
