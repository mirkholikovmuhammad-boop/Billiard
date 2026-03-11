document.addEventListener('DOMContentLoaded', () => {
    let seconds = JSON.parse(localStorage.getItem('seconds')) || [0,0,0,0];
    let active = JSON.parse(localStorage.getItem('active')) || [false,false,false,false];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let calendarHistory = JSON.parse(localStorage.getItem('calendarHistory')) || {};
    let intervals = [null,null,null,null];
    const prices = [20, 20, 30, 30]; // Стоимость часа

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
        let timeStr = h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
        document.getElementById(`timer${i+1}`).textContent = timeStr;
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
        if(active[i]) {
            document.getElementById(`table${i+1}`).classList.add('active');
            document.getElementById(`btn${i+1}`).textContent = 'Стоп';
            startTimer(i);
        }

        document.getElementById(`btn${i+1}`).addEventListener('click', function() {
            if(!active[i]) {
                active[i] = true;
                this.textContent = 'Стоп';
                document.getElementById(`table${i+1}`).classList.add('active');
                startTimer(i);
            } else {
                clearInterval(intervals[i]);
                active[i] = false;
                this.textContent = 'Старт';
                document.getElementById(`table${i+1}`).classList.remove('active');
                
                // Точный расчет до копеек
                let total = (prices[i] * (seconds[i]/3600));
                total = Math.round(total * 100) / 100;

                if(seconds[i] > 2) { // Если играли больше 2 секунд
                    history.unshift({ // Добавляем в начало списка
                        table: i+1, 
                        type: i<2?'Майда':'Калон', 
                        time: seconds[i], 
                        total: total.toFixed(2),
                        timestamp: new Date().toLocaleTimeString()
                    });
                    
                    let today = new Date().toLocaleDateString();
                    calendarHistory[today] = Math.round(((calendarHistory[today] || 0) + total) * 100) / 100;
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
        list.innerHTML = '';
        let dayTotal = 0;
        history.forEach(item => {
            dayTotal += parseFloat(item.total);
            let li = document.createElement('li');
            li.textContent = `[${item.timestamp}] Стол ${item.table}: ${Math.floor(item.time/60)}м ${item.time%60}с = ${item.total} сом.`;
            list.prepend(li); // Самые новые внизу, или используй appendChild
        });
        // Чтобы новые были сверху:
        list.innerHTML = history.map(item => `<li>[${item.timestamp}] Стол ${item.table}: ${Math.floor(item.time/60)}м ${item.time%60}с = ${item.total} сом.</li>`).join('');
        document.getElementById('todayTotal').textContent = `За сегодня: ${dayTotal.toFixed(2)} сом.`;
    }

    // Календарь
    document.getElementById('calendarBtn').onclick = () => {
        const calList = document.getElementById('calendarList');
        calList.innerHTML = Object.keys(calendarHistory).length ? '' : 'История пуста';
        for(let date in calendarHistory) {
            calList.innerHTML += `<li><strong>${date}:</strong> ${calendarHistory[date].toFixed(2)} сом.</li>`;
        }
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

    renderHistory();
});

