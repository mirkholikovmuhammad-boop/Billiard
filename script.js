document.addEventListener('DOMContentLoaded', () => {
    // Загрузка данных
    let seconds = JSON.parse(localStorage.getItem('seconds')) || [0,0,0,0];
    let active = JSON.parse(localStorage.getItem('active')) || [false,false,false,false];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let calendarHistory = JSON.parse(localStorage.getItem('calendarHistory')) || {};
    let intervals = [null,null,null,null];
    
    // Цены: Стол 1-2 (Майда) = 20с, Стол 3-4 (Калон) = 30с
    const prices = [20, 20, 30, 30];

    const save = () => {
        localStorage.setItem('seconds', JSON.stringify(seconds));
        localStorage.setItem('active', JSON.stringify(active));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('calendarHistory', JSON.stringify(calendarHistory));
    };

    const updateUI = (i) => {
        let hrs = Math.floor(seconds[i] / 3600);
        let mins = Math.floor((seconds[i] % 3600) / 60);
        let secs = seconds[i] % 60;
        document.getElementById(`timer${i+1}`).textContent = 
            hrs > 0 ? `${hrs}ч ${mins}м` : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = (i) => {
        if (intervals[i]) clearInterval(intervals[i]);
        intervals[i] = setInterval(() => {
            seconds[i]++;
            updateUI(i);
            if(seconds[i] % 10 === 0) save(); // Автосохранение каждые 10 секунд
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
                // Нажатие на СТАРТ
                active[i] = true;
                this.textContent = 'Стоп';
                document.getElementById(`table${i+1}`).classList.add('active');
                startTimer(i);
            } else {
                // Нажатие на СТОП
                clearInterval(intervals[i]);
                active[i] = false;
                this.textContent = 'Старт';
                document.getElementById(`table${i+1}`).classList.remove('active');
                
                // РАСЧЕТ ЦЕНЫ: (Цена за час / 3600 сек) * время в сек
                let currentPrice = prices[i];
                let total = Math.round((currentPrice * (seconds[i] / 3600)) * 100) / 100;
                
                // Минимальная сумма 1 сомони, если играли больше 10 секунд
                if (seconds[i] > 10 && total < 1) total = 1.00;

                if (seconds[i] > 10) { // Не записывать в историю, если нажали случайно (меньше 10 сек)
                    history.push({
                        table: i + 1, 
                        type: i < 2 ? "Майда" : "Калон",
                        time: seconds[i], 
                        total: total
                    });
                    
                    let today = new Date().toISOString().split('T')[0];
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
        
        history.forEach((item, index) => {
            dayTotal += item.total;
            let li = document.createElement('li');
            let m = Math.floor(item.time / 60);
            li.textContent = `Стол ${item.table} (${item.type}): ${m} мин = ${item.total.toFixed(2)} сом.`;
            list.appendChild(li);
        });
        
        document.getElementById('todayTotal').textContent = `За сегодня: ${dayTotal.toFixed(2)} сомони`;
    }

    // Кнопка очистки дня
    document.getElementById('saveTotal').addEventListener('click', () => {
        if(confirm("Вы уверены, что хотите закончить день и очистить список?")) {
            history = [];
            save();
            renderHistory();
            document.getElementById('endDayModal').style.display = 'none';
        }
    });

    renderHistory();
});
});
