document.addEventListener('DOMContentLoaded', () => {
    let startTimes = JSON.parse(localStorage.getItem('startTimes')) || [null, null, null, null];
    let active = JSON.parse(localStorage.getItem('active')) || [false, false, false, false];
    let allGames = JSON.parse(localStorage.getItem('allGames')) || [];
    
    let intervals = [null, null, null, null];
    const prices = [20, 30, 30, 20]; // 1-М, 2-К, 3-К, 4-М

    const save = () => {
        localStorage.setItem('startTimes', JSON.stringify(startTimes));
        localStorage.setItem('active', JSON.stringify(active));
        localStorage.setItem('allGames', JSON.stringify(allGames));
    };

    const updateUI = (i) => {
        const timerEl = document.getElementById(`timer${i+1}`);
        if (!timerEl || !active[i]) return;
        const diffInSeconds = Math.floor((Date.now() - startTimes[i]) / 1000);
        let h = Math.floor(diffInSeconds / 3600);
        let m = Math.floor((diffInSeconds % 3600) / 60);
        let s = diffInSeconds % 60;
        timerEl.textContent = h > 0 ? 
            `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : 
            `${m}:${s.toString().padStart(2,'0')}`;
    };

    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`btn${i+1}`);
        if (active[i]) {
            document.getElementById(`table${i+1}`).classList.add('active');
            btn.textContent = 'Стоп';
            intervals[i] = setInterval(() => updateUI(i), 1000);
        }

        btn.onclick = () => {
            if (!active[i]) {
                active[i] = true;
                startTimes[i] = Date.now();
                btn.textContent = 'Стоп';
                document.getElementById(`table${i+1}`).classList.add('active');
                intervals[i] = setInterval(() => updateUI(i), 1000);
            } else {
                clearInterval(intervals[i]);
                const totalSeconds = Math.floor((Date.now() - startTimes[i]) / 1000);
                active[i] = false;
                btn.textContent = 'Старт';
                document.getElementById(`table${i+1}`).classList.remove('active');
                
                let finalTotal = Math.round(prices[i] * (totalSeconds / 3600));
                document.getElementById(`bill${i+1}`).textContent = `К оплате: ${finalTotal} сом.`;

                if (totalSeconds > 10) {
                    allGames.push({
                        total: finalTotal,
                        timestamp: Date.now(),
                        dateStr: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
                    });
                }
                document.getElementById(`timer${i+1}`).textContent = "0:00";
                startTimes[i] = null;
                renderTodayList();
            }
            save();
        };
    }

    // Список игр внизу (только за сегодня)
    function renderTodayList() {
        const list = document.getElementById('historyList');
        const today = new Date().toLocaleDateString('en-CA');
        const todayGames = allGames.filter(g => g.dateStr === today);
        
        list.innerHTML = todayGames.slice().reverse().map(g => {
            const time = new Date(g.timestamp);
            return `<li>[${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}] Заработано: <b>${g.total} сом.</b></li>`;
        }).join('') || '<li>Сегодня игр еще не было</li>';

        let sum = todayGames.reduce((s, g) => s + g.total, 0);
        document.getElementById('todayTotal').textContent = `За сегодня: ${sum} сом.`;
    }

    // Календарь / Статистика
    const calculateStats = () => {
        const period = document.getElementById('statsPeriod').value;
        const picker = document.getElementById('datePicker');
        const now = new Date();
        let total = 0;

        const filtered = allGames.filter(game => {
            const gameDate = new Date(game.timestamp);
            const diffDays = (now - gameDate) / (1000 * 60 * 60 * 24);

            if (period === 'today') return gameDate.toDateString() === now.toDateString();
            if (period === 'yesterday') {
                const yest = new Date(); yest.setDate(now.getDate() - 1);
                return gameDate.toDateString() === yest.toDateString();
            }
            if (period === 'week') return diffDays <= 7;
            if (period === 'month') return diffDays <= 30;
            if (period === 'custom') return game.dateStr === picker.value;
            return false;
        });

        total = filtered.reduce((s, g) => s + g.total, 0);
        document.getElementById('bigTotal').textContent = `${total} сом.`;
    };

    document.getElementById('calendarBtn').onclick = () => {
        document.getElementById('calendarModal').style.display = 'block';
        calculateStats();
    };

    document.getElementById('statsPeriod').onchange = (e) => {
        document.getElementById('customDateContainer').style.display = (e.target.value === 'custom') ? 'block' : 'none';
        calculateStats();
    };

    document.getElementById('datePicker').onchange = calculateStats;
    document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarModal').style.display = 'none';
    
    // Сброс (очистка всей базы)
    document.getElementById('endDayBtn').onclick = () => document.getElementById('endDayModal').style.display = 'block';
    document.getElementById('closeModal').onclick = () => document.getElementById('endDayModal').style.display = 'none';
    document.getElementById('saveTotal').onclick = () => {
        allGames = []; save(); renderTodayList();
        document.getElementById('endDayModal').style.display = 'none';
    };

    renderTodayList();
});
