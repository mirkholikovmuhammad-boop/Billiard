document.addEventListener('DOMContentLoaded', () => {
    console.log("Приложение запущено!"); // Проверка в консоли

    let seconds = JSON.parse(localStorage.getItem('seconds')) || [0,0,0,0];
    let active = JSON.parse(localStorage.getItem('active')) || [false,false,false,false];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let calendarHistory = JSON.parse(localStorage.getItem('calendarHistory')) || {};
    let intervals = [null,null,null,null];
    const prices = [20, 20, 30, 30];

    const save = () => {
        localStorage.setItem('seconds', JSON.stringify(seconds));
        localStorage.setItem('active', JSON.stringify(active));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('calendarHistory', JSON.stringify(calendarHistory));
    };

    const updateUI = (i) => {
        const timerEl = document.getElementById(`timer${i+1}`);
        if(!timerEl) return;
        let h = Math.floor(seconds[i] / 3600);
        let m = Math.floor((seconds[i] % 3600) / 60);
        let s = seconds[i] % 60;
        timerEl.textContent = h > 0 ? 
            `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : 
            `${m}:${s.toString().padStart(2,'0')}`;
    };

    const startTimer = (i) => {
        if(intervals[i]) clearInterval(intervals[i]);
        intervals[i] = setInterval(() => {
            seconds[i]++;
            updateUI(i);
            if(seconds[i] % 5 === 0) save();
        }, 1000);
    };

    for(let i=0; i<4; i++) {
        updateUI(i);
        const btn = document.getElementById(`btn${i+1}`);
        const tableDiv = document.getElementById(`table${i+1}`);
        const billDiv = document.getElementById(`bill${i+1}`);

        if(!btn) continue; // Защита от ошибок

        if(active[i]) {
            tableDiv.classList.add('active');
            btn.textContent = 'Стоп';
            startTimer(i);
        }

        btn.onclick = () => { // Используем onclick для надежности
            if(!active[i]) {
                active[i] = true;
                btn.textContent = 'Стоп';
                tableDiv.classList.add('active');
                if(billDiv) billDiv.textContent = "Игра идет...";
                startTimer(i);
            } else {
                clearInterval(intervals[i]);
                active[i] = false;
                btn.textContent = 'Старт';
                tableDiv.classList.remove('active');
                
                let total = (prices[i] * (seconds[i]/3600));
                total = Math.round(total * 100) / 100;
                
                if(billDiv) billDiv.textContent = `К оплате: ${total.toFixed(2)} сом.`;

                if(seconds[i] > 2) {
                    const now = new Date();
                    history.unshift({
                        table: i+1,
                        type: i<2 ? 'Майда' : 'Калон',
                        time: seconds[i],
                        total: total.toFixed(2),
                        timeLabel: now.getHours() + ":" + now.getMinutes().toString().padStart(2,'0')
                    });
                    let dateKey = now.toLocaleDateString();
                    calendarHistory[dateKey] = Math.round(((calendarHistory[dateKey] || 0) + total) * 100) / 100;
                }
                seconds[i] = 0;
                updateUI(i);
                renderHistory();
            }
            save();
        };
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        const totalDisp = document.getElementById('todayTotal');
        if(!list || !totalDisp) return;

        list.innerHTML = history.map(item => 
            `<li>[${item.timeLabel}] Стол ${item.table} (${item.type}): ${Math.floor(item.time/60)}м = <b>${item.total} сом.</b></li>`
        ).join('');

        let daySum = history.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        totalDisp.textContent = `За сегодня: ${daySum.toFixed(2)} сом.`;
    }

    // Календарь и модалки
    const calBtn = document.getElementById('calendarBtn');
    if(calBtn) calBtn.onclick = () => {
        const calList = document.getElementById('calendarList');
        if(!calList) return;
        calList.innerHTML = Object.keys(calendarHistory).map(date => 
            `<li style="padding:5px 0; border-bottom:1px solid #eee;">${date}: <b>${calendarHistory[date].toFixed(2)} сом.</b></li>`
        ).join('') || 'История пуста';
        document.getElementById('calendarModal').style.display = 'block';
    };

    if(document.getElementById('closeCalendar')) document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarModal').style.display = 'none';
    if(document.getElementById('endDayBtn')) document.getElementById('endDayBtn').onclick = () => document.getElementById('endDayModal').style.display = 'block';
    if(document.getElementById('closeModal')) document.getElementById('closeModal').onclick = () => document.getElementById('endDayModal').style.display = 'none';
    
    if(document.getElementById('saveTotal')) document.getElementById('saveTotal').onclick = () => {
        history = []; save(); renderHistory();
        document.getElementById('endDayModal').style.display = 'none';
    };

    renderHistory();
});
