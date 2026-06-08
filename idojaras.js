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
    // 3. WEATHER CODES TRANSLATIONS & ICONS
    // ==========================================
    const weatherCodes = {
        0: { desc: 'Tiszta égbolt', icon: 'fa-sun', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        1: { desc: 'Túlnyomóan tiszta', icon: 'fa-sun', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        2: { desc: 'Közepesen felhős', icon: 'fa-cloud-sun', bg: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
        3: { desc: 'Borult', icon: 'fa-cloud', bg: 'linear-gradient(135deg, #9ca3af, #4b5563)' },
        45: { desc: 'Ködös', icon: 'fa-smog', bg: 'linear-gradient(135deg, #9ca3af, #6b7280)' },
        48: { desc: 'Zúzmarás köd', icon: 'fa-smog', bg: 'linear-gradient(135deg, #9ca3af, #6b7280)' },
        51: { desc: 'Enyhe szitálás', icon: 'fa-cloud-rain', bg: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
        53: { desc: 'Mérsékelt szitálás', icon: 'fa-cloud-rain', bg: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
        55: { desc: 'Sűrű szitálás', icon: 'fa-cloud-showers-heavy', bg: 'linear-gradient(135deg, #3b82f6, #1e3a8a)' },
        56: { desc: 'Enyhe ónos szitálás', icon: 'fa-cloud-meatball', bg: 'linear-gradient(135deg, #93c5fd, #1e3a8a)' },
        57: { desc: 'Sűrű ónos szitálás', icon: 'fa-cloud-meatball', bg: 'linear-gradient(135deg, #93c5fd, #1e3a8a)' },
        61: { desc: 'Enyhe eső', icon: 'fa-cloud-rain', bg: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
        63: { desc: 'Mérsékelt eső', icon: 'fa-cloud-rain', bg: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
        65: { desc: 'Heves eső', icon: 'fa-cloud-showers-heavy', bg: 'linear-gradient(135deg, #3b82f6, #1e3a8a)' },
        66: { desc: 'Enyhe ónos eső', icon: 'fa-cloud-showers-water', bg: 'linear-gradient(135deg, #93c5fd, #1e3a8a)' },
        67: { desc: 'Heves ónos eső', icon: 'fa-cloud-showers-water', bg: 'linear-gradient(135deg, #93c5fd, #1e3a8a)' },
        71: { desc: 'Enyhe havazás', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' },
        73: { desc: 'Mérsékelt havazás', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' },
        75: { desc: 'Erős havazás', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #cbd5e1, #64748b)' },
        77: { desc: 'Hódara', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #cbd5e1, #64748b)' },
        80: { desc: 'Enyhe záporeső', icon: 'fa-cloud-showers-heavy', bg: 'linear-gradient(135deg, #60a5fa, #1d4ed8)' },
        81: { desc: 'Záporeső', icon: 'fa-cloud-showers-heavy', bg: 'linear-gradient(135deg, #3b82f6, #1e3a8a)' },
        82: { desc: 'Heves záporeső', icon: 'fa-cloud-showers-heavy', bg: 'linear-gradient(135deg, #2563eb, #1e3a8a)' },
        85: { desc: 'Enyhe hózápor', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' },
        86: { desc: 'Erős hózápor', icon: 'fa-snowflake', bg: 'linear-gradient(135deg, #cbd5e1, #64748b)' },
        95: { desc: 'Zivatar', icon: 'fa-cloud-bolt', bg: 'linear-gradient(135deg, #4b5563, #111827)' },
        96: { desc: 'Zivatar jégesővel', icon: 'fa-cloud-bolt', bg: 'linear-gradient(135deg, #4b5563, #111827)' },
        99: { desc: 'Heves zivatar jégesővel', icon: 'fa-cloud-bolt', bg: 'linear-gradient(135deg, #374151, #030712)' }
    };

    function getWeatherInfo(code) {
        return weatherCodes[code] || { desc: 'Ismeretlen', icon: 'fa-circle-question', bg: 'linear-gradient(135deg, #6b7280, #374151)' };
    }

    // Days in Hungarian
    const daysHu = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    function getDayLabel(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return 'Ma';
        }
        return daysHu[d.getDay()];
    }

    // ==========================================
    // 4. WEATHER RENDER & LOGIC
    // ==========================================
    const defaultCoords = { lat: 47.4979, lon: 19.0402, name: 'Budapest' }; // Budapest defaults

    // UI elements
    const weatherCity = document.getElementById('weather-city');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherHero = document.getElementById('weather-hero');
    const weatherHeroIcon = document.getElementById('weather-hero-icon');
    
    const weatherFeel = document.getElementById('weather-feel');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherWind = document.getElementById('weather-wind');
    const weatherPressure = document.getElementById('weather-pressure');
    
    const forecastList = document.getElementById('forecast-list');
    const radarIframe = document.getElementById('radar-iframe');
    
    const weatherSearch = document.getElementById('weather-search');
    const weatherSearchResults = document.getElementById('weather-search-results');

    // Fetch Weather Data from API
    async function fetchWeather(lat, lon, cityName) {
        try {
            // Update radar iframe src
            if (radarIframe) {
                radarIframe.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=true`;
            }

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('API hiba');
            const data = await response.json();

            // Render Current Weather
            const current = data.current;
            const weatherInfo = getWeatherInfo(current.weather_code);

            if (weatherCity) weatherCity.textContent = cityName;
            if (weatherDesc) weatherDesc.textContent = weatherInfo.desc;
            if (weatherTemp) weatherTemp.innerHTML = `${Math.round(current.temperature_2m)}<span class="current-temp-unit">°C</span>`;
            if (weatherHero) weatherHero.style.background = weatherInfo.bg;
            
            if (weatherHeroIcon) {
                // Remove old classes and add new
                weatherHeroIcon.className = `fa-solid ${weatherInfo.icon} current-weather-hero-icon`;
            }

            if (weatherFeel) weatherFeel.textContent = `${Math.round(current.apparent_temperature)} °C`;
            if (weatherHumidity) weatherHumidity.textContent = `${current.relative_humidity_2m} %`;
            if (weatherWind) weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
            if (weatherPressure) weatherPressure.textContent = `${Math.round(current.pressure_msl)} hPa`;

            // Render Forecast
            if (forecastList && data.daily) {
                forecastList.innerHTML = '';
                const daily = data.daily;
                
                // Show 5 days forecast
                for (let i = 0; i < 5; i++) {
                    const time = daily.time[i];
                    const wCode = daily.weather_code[i];
                    const tempMax = Math.round(daily.temperature_2m_max[i]);
                    const tempMin = Math.round(daily.temperature_2m_min[i]);
                    const rainProb = daily.precipitation_probability_max[i];
                    
                    const wInfo = getWeatherInfo(wCode);
                    const dayLabel = getDayLabel(time);

                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    
                    forecastItem.innerHTML = `
                        <div class="forecast-day">${dayLabel}</div>
                        <div class="forecast-weather">
                            <i class="fa-solid ${wInfo.icon} forecast-icon" title="${wInfo.desc}"></i>
                            ${rainProb > 20 ? `<span class="forecast-rain-prob"><i class="fa-solid fa-droplet"></i> ${rainProb}%</span>` : ''}
                        </div>
                        <div class="forecast-temps">
                            <span class="forecast-temp-max">${tempMax}°</span>
                            <span class="forecast-temp-min">${tempMin}°</span>
                        </div>
                    `;
                    forecastList.appendChild(forecastItem);
                }
            }

        } catch (error) {
            console.error('Weather fetch error:', error);
            if (weatherDesc) weatherDesc.textContent = 'Hiba történt a letöltés során';
        }
    }

    // ==========================================
    // 5. SEARCH AUTOCOMPLETE LOGIC
    // ==========================================
    let searchTimeout = null;

    if (weatherSearch) {
        weatherSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (searchTimeout) clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                if (weatherSearchResults) weatherSearchResults.style.display = 'none';
                return;
            }

            // Debounce API requests
            searchTimeout = setTimeout(async () => {
                try {
                    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=hu&format=json`;
                    const res = await fetch(geocodeUrl);
                    if (!res.ok) throw new Error('Geocoding error');
                    const data = await res.json();

                    if (data.results && data.results.length > 0) {
                        renderSearchResults(data.results);
                    } else {
                        if (weatherSearchResults) {
                            weatherSearchResults.innerHTML = '<div class="weather-search-result-item" style="color: var(--text-muted); cursor: default;">Nincs találat</div>';
                            weatherSearchResults.style.display = 'block';
                        }
                    }
                } catch (err) {
                    console.error('Geocoding search failed:', err);
                }
            }, 300);
        });

        // Close search results when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (e.target !== weatherSearch && weatherSearchResults) {
                weatherSearchResults.style.display = 'none';
            }
        });
    }

    function renderSearchResults(results) {
        if (!weatherSearchResults) return;

        weatherSearchResults.innerHTML = '';
        results.forEach(city => {
            const item = document.createElement('div');
            item.className = 'weather-search-result-item';
            
            // Build nice label (City, State/Country)
            const region = city.admin1 ? `, ${city.admin1}` : '';
            const country = city.country ? ` (${city.country})` : '';
            item.textContent = `${city.name}${region}${country}`;
            
            item.addEventListener('click', () => {
                // Update active location
                fetchWeather(city.latitude, city.longitude, city.name);
                if (weatherSearch) weatherSearch.value = city.name;
                weatherSearchResults.style.display = 'none';
            });

            weatherSearchResults.appendChild(item);
        });

        weatherSearchResults.style.display = 'block';
    }

    // ==========================================
    // 6. INITIALIZATION & GEOLOCATION
    // ==========================================
    function initialize() {
        // Try getting user geolocation, fallback to default
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    fetchWeather(lat, lon, 'Jelenlegi Helyzet');
                },
                (error) => {
                    console.warn('Geolocation error or denied. Using Budapest as default.');
                    fetchWeather(defaultCoords.lat, defaultCoords.lon, defaultCoords.name);
                },
                { timeout: 5000 }
            );
        } else {
            fetchWeather(defaultCoords.lat, defaultCoords.lon, defaultCoords.name);
        }
    }

    initialize();

});
