document.addEventListener('DOMContentLoaded', () => {
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
        let h = Math.floor(seconds[i] / 3600);
        let m = Math.floor((seconds[i] % 3600) / 60);
        let s = seconds[i] % 60;
        document.getElementById(`timer${i+1}`).textContent = h > 0 ? 
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

        if(active[i]) {
            tableDiv.classList.add('active');
            btn.textContent = 'Стоп';
            startTimer(i);
        }

        btn.addEventListener('click', () => {
            if(!active[i]) {
                active[i] = true;
                btn.textContent = 'Стоп';
                tableDiv.classList.add('active');
                billDiv.textContent = "Игра идет..."; 
                startTimer(i);
            } else {
                clearInterval(intervals[i]);
                active[i] = false;
                btn.textContent = 'Старт';
                tableDiv.classList.remove('active');
                
                let total = (prices[i] * (seconds[i]/3600));
                total = Math.round(total * 100) / 100;
                
                // СРАЗУ ПОКАЗЫВАЕМ СУММУ НА КАРТОЧКЕ
                billDiv.textContent = `К оплате: ${total.toFixed(2)} сом.`;

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
        });
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        const totalDisp = document.getElementById('todayTotal');
        list.innerHTML = history.map(item => 
            `<li>[${item.timeLabel}] Стол ${item.table} (${item.type}): ${Math.floor(item.time/60)}м = <b>${item.total} сом.</b></li>`
        ).join('');
        let daySum = history.reduce((sum, item) => sum + parseFloat(item.total), 0);
        totalDisp.textContent = `За сегодня: ${daySum.toFixed(2)} сом.`;
    }

    document.getElementById('calendarBtn').onclick = () => {
        const calList = document.getElementById('calendarList');
        calList.innerHTML = Object.keys(calendarHistory).map(date => 
            `<li style="padding:5px 0; border-bottom:1px solid #eee;">${date}: <b>${calendarHistory[date].toFixed(2)} сом.</b></li>`
        ).join('') || 'История пуста';
        document.getElementById('calendarModal').style.display = 'block';
    };

    document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarModal').style.display = 'none';
    document.getElementById('endDayBtn').onclick = () => document.getElementById('endDayModal').style.display = 'block';
    document.getElementById('closeModal').onclick = () => document.getElementById('endDayModal').style.display = 'none';
    document.getElementById('saveTotal').onclick = () => {
        history = []; save(); renderHistory();
        document.getElementById('endDayModal').style.display = 'none';
    };

    renderHistory();
});


