document.addEventListener('DOMContentLoaded', () => {
    let seconds = JSON.parse(localStorage.getItem('seconds')) || [0,0,0,0];
    let active = JSON.parse(localStorage.getItem('active')) || [false,false,false,false];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let calendarHistory = JSON.parse(localStorage.getItem('calendarHistory')) || {};
    let intervals = [null,null,null,null];
    const prices = [20,20,30,30];

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
        document.getElementById(`timer${i+1}`).textContent = hrs > 0 ? `${hrs}ч ${mins}м` : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = (i) => {
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
                
                let total = seconds[i] <= 300 ? 1.7 : seconds[i] <= 600 ? 3 : seconds[i] <= 900 ? 5 : Math.round((prices[i] * (seconds[i]/3600)) * 100) / 100;
                
                history.push({table: i+1, time: seconds[i], total: total});
                let today = new Date().toISOString().split('T')[0];
                calendarHistory[today] = Math.round(((calendarHistory[today] || 0) + total) * 100) / 100;
                
                seconds[i] = 0;
                updateUI(i);
                renderHistory();
            }
            save();
        });
    }

    const renderHistory = () => {
        const list = document.getElementById('historyList');
        list.innerHTML = '';
        let dayTotal = 0;
        history.forEach(item => {
            dayTotal += item.total;
            let li = document.createElement('li');
            li.textContent = `Стол ${item.table}: ${Math.floor(item.time/60)} мин = ${item.total} сом.`;
            list.appendChild(li);
        });
        document.getElementById('todayTotal').textContent = `За сегодня: ${dayTotal.toFixed(2)} сом.`;
    };

    document.getElementById('saveTotal').addEventListener('click', () => {
        history = []; save(); renderHistory();
        document.getElementById('endDayModal').style.display = 'none';
    });

    renderHistory();
});