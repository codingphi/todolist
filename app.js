let tasks = [];
let congratulationShown = false;  // متغیر برای کنترل نمایش پیام تبریک

const taskInput = document.getElementById('taskinput');
const taskList = document.querySelector('.task-list');
const numbers = document.getElementById('numbers');
const progress = document.getElementById('progress');
const form = document.querySelector('form');

// وقتی صفحه کامل لود شد، استاتوس رو آپدیت کن
window.addEventListener('DOMContentLoaded', () => {
    updateStats();
});

// Add task with "+" button
document.getElementById('newtask').addEventListener('click', function (e) {
    e.preventDefault();
    addTask();
});

// Add task with Enter key
taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
});

function addTask() {
    const text = taskInput.value.trim();

    if (!text) return;  // اگر ورودی خالی بود کاری نکن

    if (tasks.length >= 35) {
        alert("You Can Only Add 35 Tasks A Day!");
        return;
    }

    tasks.push({ text, completed: false });
    congratulationShown = false;  // اضافه شدن تسک جدید => پیام تبریک مجدداً فعال شود
    taskInput.value = '';
    updateTaskList();
}

function updateTaskList() {
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = "task-item-box";

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}; color: ${task.completed ? '#888' : 'inherit'};">
                    ${task.text}
                </span>
            </div>
            <div class="task-actions">
                <i class="fa-solid fa-pen-nib edit-btn" data-index="${index}"></i>
                <i class="fa-solid fa-trash-can delete-btn" data-index="${index}"></i>
            </div>
        `;

        // Toggle checkbox
        li.querySelector('input').addEventListener('change', e => {
            toggleTask(e.target.dataset.index);
        });

        // Delete button
        li.querySelector('.delete-btn').addEventListener('click', e => {
            deleteTask(e.target.dataset.index);
        });

        // Edit button
        li.querySelector('.edit-btn').addEventListener('click', e => {
            editTask(e.target.dataset.index);
        });

        taskList.appendChild(li);
    });

    updateStats();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    congratulationShown = false;  // تغییر وضعیت تسک => پیام تبریک مجدداً فعال شود
    updateTaskList();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    updateTaskList();
}

function editTask(index) {
    const newText = prompt("Edit your task:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText.trim();
        updateTaskList();
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    if (total === 0) {
        numbers.innerText = `0 / 0`;
        progress.style.width = `0%`;
        numbers.style.backgroundColor = "#6d588b"; // رنگ حالت پیش‌فرض
        return;
    }

    numbers.innerText = `${completed} / ${total}`;

    const percent = (completed / total) * 100;
    progress.style.width = `${percent}%`;

    numbers.style.backgroundColor =
        percent === 100
            ? "#6d588b"
            : percent >= 50
                ? "765690"
                : "#765690";

    // پیام تبریک وقتی همه تسک‌ها انجام شده
    if (completed === total && total !== 0 && !congratulationShown) {
        congratulationShown = true; // پیام فقط یک بار نمایش داده شود
        setTimeout(() => {
            alert("Good Job Love! Take a Rest & Don't Forget, Phi loves You :)");
        }, 300);
    }
}
