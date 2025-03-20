
let timer;
let seconds = 0;
let minutes = 0;
let hours = 0;
let isRunning = false;
let timerStartTime;


document.addEventListener("DOMContentLoaded", function () {
    loadTimerState();
    updateScreen();
});


function loadTimerState() {
    const savedState = JSON.parse(localStorage.getItem('timerState')) || {};
    isRunning = savedState.isRunning || false;
    timerStartTime = savedState.startTime;

    if (isRunning && timerStartTime) {
        const timePassed = Math.floor((Date.now() - timerStartTime) / 1000);
        updateTimeVariables(timePassed);
        startCounting();
    }
    
    updateStats();
}


function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerStartTime = Date.now() - (hours * 3600 + minutes * 60 + seconds) * 1000;
        startCounting();
        saveTimerState();
    }
}


function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
    timerStartTime = null;
    saveTimerState();
    
    updateStats();
}


function resetTimer() {

    const todayTotal = getTodayTotal();
    

    isRunning = false;
    clearInterval(timer);
    timerStartTime = null;
    seconds = 0;
    minutes = 0;
    hours = 0;
    
    saveTimerState();
    updateScreen();
    

    saveTodayTotal(todayTotal);
}


function startCounting() {
    timer = setInterval(updateTime, 1000);
}


function updateTime() {
    const timePassed = Math.floor((Date.now() - timerStartTime) / 1000);
    updateTimeVariables(timePassed);
    

    const todayTotal = getTodayTotal();
    saveTodayTotal(todayTotal + 1);
    
    updateScreen();
    updateStats();
}


function updateTimeVariables(totalSeconds) {
    hours = Math.floor(totalSeconds / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
    seconds = totalSeconds % 60;
}


function saveTimerState() {
    const state = {
        isRunning: isRunning,
        startTime: timerStartTime,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    localStorage.setItem('timerState', JSON.stringify(state));
}


function getTodayTotal() {
    const today = new Date().toISOString().split('T')[0];
    const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
    return studyData[today] || 0;
}


function saveTodayTotal(totalSeconds) {
    const today = new Date().toISOString().split('T')[0];
    let studyData = JSON.parse(localStorage.getItem('studyData')) || {};
    studyData[today] = totalSeconds;
    localStorage.setItem('studyData', JSON.stringify(studyData));
    localStorage.setItem('lastUpdate', Date.now().toString());
}


function updateScreen() {
    if (document.getElementById("hours")) {

        document.getElementById("hours").textContent = padNumber(hours);
        document.getElementById("minutes").textContent = padNumber(minutes);
        document.getElementById("seconds").textContent = padNumber(seconds);

        const todayTotal = getTodayTotal();
        const totalHours = Math.floor(todayTotal / 3600);
        const totalMinutes = Math.floor((todayTotal % 3600) / 60);
        const totalSeconds = todayTotal % 60;

        document.getElementById("todayStatus").textContent = 
            `Today's total study time: ${totalHours}h ${totalMinutes}m ${totalSeconds}s`;
        
        updateStats();
    }
}

function padNumber(num) {
    return String(num).padStart(2, "0");
}
function updateStats() {
    if (document.getElementById('weeklyStats')) {
        showWeeklyStats();
    }
    if (document.getElementById('monthlyStats')) {
        showMonthlyStats();
    }
}
function showWeeklyStats() {
    const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
    let weekTotal = 0;
    const weekList = document.getElementById('weeklyList');
    weekList.innerHTML = '';

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const dayTime = studyData[dateString] || 0;
        weekTotal += dayTime;

        const dayElement = document.createElement('li');
        dayElement.textContent = `${currentDate.toLocaleDateString('en-US', { weekday: 'long' })}: ${formatTime(dayTime)}`;
        weekList.appendChild(dayElement);
    }

    document.getElementById('weeklyTotal').textContent = 
        `Total Study Time This Week: ${formatTime(weekTotal)}`;
}
function showMonthlyStats() {
    const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
    let monthTotal = 0;
    const monthList = document.getElementById('monthlyList');
    monthList.innerHTML = '';

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let weekTotal = 0;
    let weekNumber = 1;
    let weekStart = new Date(monthStart);

    for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];
        const dayTime = studyData[dateString] || 0;
        monthTotal += dayTime;
        weekTotal += dayTime;

        if (date.getDay() === 6 || date.getTime() === monthEnd.getTime()) {
            const weekElement = document.createElement('li');
            weekElement.textContent = `Week ${weekNumber} (${weekStart.getDate()}-${date.getDate()}): ${formatTime(weekTotal)}`;
            monthList.appendChild(weekElement);
            weekTotal = 0;
            weekNumber++;
            weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() + 1);
        }
    }

    document.getElementById('monthlyTotal').textContent = 
        `Total Study Time This Month: ${formatTime(monthTotal)}`;
}
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
window.addEventListener('storage', (event) => {
    if (event.key === 'lastUpdate' || event.key === 'studyData') {
        updateStats();
    }
});
