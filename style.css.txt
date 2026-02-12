body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

header #todayTotal {
    font-weight: bold;
    font-size: 1.2em;
}

button {
    padding: 12px 20px;
    font-size: 1em;
    border-radius: 5px;
    border: none;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #45a049;
}

main {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.container-top,
.container-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.table {
    background-color: #fff;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    text-align: center;
    transition: background-color 0.3s;
}

.table.active {
    background-color: #b3ffb3;
}

.timer {
    font-size: 2em;
    margin: 10px 0;
}

.price {
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.2em;
}

#history {
    background-color: #fff;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

ul {
    padding-left: 20px;
}

li {
    margin-bottom: 5px;
}

.modal {
    display: none;
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border-radius: 10px;
    width: 320px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.calendar-content {
    width: 250px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}