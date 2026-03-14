document.addEventListener('DOMContentLoaded', () => {
    let startTimes = JSON.parse(localStorage.getItem('startTimes')) || [null, null, null, null];
    let active = JSON.parse(localStorage.getItem('active')) || [false, false, false, false];
    let allGames = JSON.parse(localStorage.getItem('allGames')) || [];
    let calendarHistory = JSON.parse(localStorage.getItem('calendarHistory')) || {};
    
    let intervals = [null, null, null, null];
    const prices = [20, 30, 30, 20]; // 1-Майда, 2-Калон, 3-Калон, 4-Майда

    const save = () => {
        localStorage.setItem('startTimes', JSON.stringify(startTimes));
        localStorage.setItem('active', JSON.stringify(active));
        localStorage.setItem('allGames', JSON.stringify(allGames));
        localStorage.setItem('calendarHistory', JSON.stringify(calendarHistory));
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
                
                // Математическое округление
                let finalTotal = Math.round(prices[i] * (totalSeconds / 3600));
                document.getElementById(`bill${i+1}`).textContent = `К оплате: ${finalTotal} сом.`;

                if (totalSeconds > 10) {
                    const now = new Date();
                    const gameData = {
                        table: i + 1,
                        type: (i === 0 || i === 3) ? 'Майда' : 'Калон',
                        total: finalTotal,
                        timestamp: Date.now(),
                        timeStr: now.getHours() + ":" + now.getMinutes().toString().padStart(2,'0')
                    };
                    allGames.unshift(gameData);
                    
                    let dateKey = now.toLocaleDateString();
                    calendarHistory[dateKey] = (calendarHistory[dateKey] || 0) + finalTotal;
                }
                document.getElementById(`timer${i+1}`).textContent = "0:00";
                startTimes[i] = null;
                renderHistory();
            }
            save();
        };
    }

    function renderHistory() {
        const filter = document.getElementById('historyFilter').value;
        const list = document.getElementById('historyList');
        const totalDisp = document.getElementById('todayTotal');
        const now = new Date();
        
        const filtered = allGames.filter(game => {
            const gameDate = new Date(game.timestamp);
            const diffDays = (now - gameDate) / (1000 * 60 * 60 * 24);
            if (filter === 'today') return gameDate.toDateString() === now.toDateString();
            if (filter === 'yesterday') {
                const yest = new Date(); yest.setDate(now.getDate() - 1);
                return gameDate.toDateString() === yest.toDateString();
            }
            if (filter === 'week') return diffDays <= 7;
            if (filter === 'month') return diffDays <= 30;
            return true;
        });

        list.innerHTML = filtered.map(g => 
            `<li>[${g.timeStr}] Стол ${g.table} (${g.type}): <b>${g.total} сом.</b></li>`
        ).join('') || '<li>История пуста</li>';

        let sum = filtered.reduce((s, g) => s + g.total, 0);
        totalDisp.textContent = `Итого: ${sum} сом.`;
    }

    document.getElementById('historyFilter').onchange = renderHistory;
    
    // Модалки
    document.getElementById('calendarBtn').onclick = () => {
        const calList = document.getElementById('calendarList');
        calList.innerHTML = Object.keys(calendarHistory).reverse().map(date => 
            `<li style="padding:8px 0; border-bottom:1px solid #eee;">${date}: <b>${calendarHistory[date]} сом.</b></li>`
        ).join('') || 'Пусто';
        document.getElementById('calendarModal').style.display = 'block';
    };

    document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarModal').style.display = 'none';
    document.getElementById('endDayBtn').onclick = () => document.getElementById('endDayModal').style.display = 'block';
    document.getElementById('closeModal').onclick = () => document.getElementById('endDayModal').style.display = 'none';
    document.getElementById('saveTotal').onclick = () => {
        allGames = []; save(); renderHistory();
        document.getElementById('endDayModal').style.display = 'none';
    };

    renderHistory();
});
