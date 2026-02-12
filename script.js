document.addEventListener('DOMContentLoaded', function() {

let seconds = [0,0,0,0];
let intervals = [null,null,null,null];
const prices = [20,20,30,30];
let history = [];
let calendarHistory = {};

function round2(num){ return Math.round(num*100)/100; }

function calcPrice(sec, tableIndex){
    let minutes = Math.floor(sec/60);
    let total = 0;
    if(minutes <=5) total = 1.7;
    else if(minutes <=10) total = 3;
    else if(minutes <=15) total = 5;
    else total = prices[tableIndex]*(sec/3600);
    return round2(total);
}

function updateTimer(index){
    seconds[index]++;
    let hrs = Math.floor(seconds[index]/3600);
    let mins = Math.floor((seconds[index]%3600)/60);
    let secs = seconds[index]%60;
    let text = hrs>0 ? `${hrs}ч ${mins}мин` : `${mins}:${secs.toString().padStart(2,'0')}`;
    document.getElementById(`timer${index+1}`).textContent = text;
}

function addHistory(table,durationSec,total){
    history.push({table,durationSec,total});
    renderHistory();
    updateTodayTotal();
    let today = new Date().toISOString().split('T')[0];
    if(!calendarHistory[today]) calendarHistory[today]=0;
    calendarHistory[today] = round2(calendarHistory[today]+total);
}

function renderHistory(){
    let list = document.getElementById('historyList');
    list.innerHTML='';
    history.forEach(item=>{
        let hrs = Math.floor(item.durationSec/3600);
        let mins = Math.floor((item.durationSec%3600)/60);
        let timeText = '';
        if(hrs>0) timeText+=`${hrs}ч `;
        if(mins>0) timeText+=`${mins}мин`;
        let li = document.createElement('li');
        li.textContent = `Стол ${item.table}: ${timeText} = ${item.total} сомони`;
        list.appendChild(li);
    });
}

function updateTodayTotal(){
    let total = history.reduce((sum,item)=>sum+item.total,0);
    document.getElementById('todayTotal').textContent = `За сегодня: ${round2(total)} сомони`;
}

for(let i=0;i<4;i++){
    let tableDiv=document.getElementById(`table${i+1}`);
    let btn=document.getElementById(`btn${i+1}`);
    btn.addEventListener('click',()=>{
        if(btn.textContent==='Старт'){
            btn.textContent='Стоп';
            tableDiv.classList.add('active');
            clearInterval(intervals[i]);
            intervals[i]=setInterval(()=>updateTimer(i),1000);
        } else {
            clearInterval(intervals[i]);
            tableDiv.classList.remove('active');
            let total=calcPrice(seconds[i],i);
            document.getElementById(`price${i+1}`).textContent=`${total} сомони`;
            addHistory(i+1,seconds[i],total);
            seconds[i]=0;
            document.getElementById(`timer${i+1}`).textContent='0:00';
            btn.textContent='Старт';
        }
    });
}

document.getElementById('endDay').addEventListener('click',()=>{
    let totalDay = history.reduce((sum,item)=>sum+item.total,0);
    document.getElementById('totalDay').textContent=round2(totalDay)+" сомони";
    document.getElementById('editTotal').value=round2(totalDay);
    document.getElementById('endDayModal').style.display='block';
});

document.getElementById('saveTotal').addEventListener('click',()=>{
    let edited=parseFloat(document.getElementById('editTotal').value);
    if(!isNaN(edited)){
        document.getElementById('totalDay').textContent=round2(edited)+" сомони";
        history=[]; seconds=[0,0,0,0];
        for(let i=0;i<4;i++){
            clearInterval(intervals[i]);
            intervals[i]=null;
            document.getElementById(`timer${i+1}`).textContent='0:00';
            document.getElementById(`price${i+1}`).textContent='0.00 сомони';
            document.getElementById(`btn${i+1}`).textContent='Старт';
            document.getElementById(`table${i+1}`).classList.remove('active');
        }
        updateTodayTotal();
        document.getElementById('endDayModal').style.display='none';
    }
});

let calendarIndex=0;
document.getElementById('calendarBtn').addEventListener('click',()=>{
    document.getElementById('calendarModal').style.display='block';
    renderCalendar();
});
document.getElementById('closeCalendar').addEventListener('click',()=>{
    document.getElementById('calendarModal').style.display='none';
});
document.getElementById('prevDay').addEventListener('click',()=>{
    calendarIndex++;
    renderCalendar();
});
document.getElementById('nextDay').addEventListener('click',()=>{
    calendarIndex=Math.max(0,calendarIndex-1);
    renderCalendar();
});

function renderCalendar(){
    let date=new Date();
    date.setDate(date.getDate()-calendarIndex);
    let dateStr=date.toLocaleDateString();
    document.getElementById('calendarDate').textContent=dateStr;
    let total=calendarHistory[date.toISOString().split('T')[0]]||0;
    document.getElementById('calendarTotal').textContent=round2(total)+" сомони";
}

});
