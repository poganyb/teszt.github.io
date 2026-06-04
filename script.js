document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. COUNTDOWN TIMER
    // ==========================================
    // Opening Match Date: June 11, 2026 (EST/Mexico City time - set target to mid-day GMT)
    const targetDate = new Date('June 11, 2026 12:00:00 GMT-0500').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            // World Cup has started!
            document.querySelector('.timer').innerHTML = '<div class="timer-segment" style="width: 100%;"><span class="timer-val" style="font-size: 2.2rem; width: 100%;">TOURNAMENT UNDERWAY!</span></div>';
            return;
        }

        // Time calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format single digits with leading zero
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Run countdown once immediately and set interval
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ==========================================
    // 2. HOST CITIES FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cityCards = document.querySelectorAll('.city-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            cityCards.forEach(card => {
                const country = card.getAttribute('data-country');
                
                // Hide with transition
                if (filterValue === 'all' || country === filterValue) {
                    card.style.display = 'block';
                    // Trigger reflow for transition
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    // Delay display:none to let transition finish
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    // ==========================================
    // 3. INTERACTIVE FUN FACTS FLIP
    // ==========================================
    const factCards = document.querySelectorAll('.fact-card');

    factCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle flipped state
            card.classList.toggle('flipped');
        });
    });


    // ==========================================
    // 4. MOBILE NAVIGATION MENU
    // ==========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Toggle menu
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinksContainer.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

});
