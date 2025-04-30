document.addEventListener('DOMContentLoaded', () => {
  const taskNameInput = document.getElementById('taskName');
  const taskDateInput = document.getElementById('taskDate');
  const taskTimeInput = document.getElementById('taskTime');
  const addTaskButton = document.getElementById('addTask');
  const taskList = document.getElementById('taskList');


  const checkInputs = () => {
    const taskName = taskNameInput.value.trim();
    addTaskButton.disabled = !taskName;
  };

  const restrictInputLength = (inputField, maxLength) => {
    inputField.addEventListener('input', () => {
      if (inputField.value.length > maxLength) {
        inputField.value = inputField.value.substring(0, maxLength);
      }
    });
  };

  const loadTasks = () => {
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      taskList.innerHTML = ''; 

      tasks.forEach((task, index) => {
        const taskDate = task.date ? formatDate(task.date) : "";
        const taskTime = task.time ? formatTime(task.time) : "";

        let taskDisplay = taskDate;
        if (taskDate && taskTime) {
          taskDisplay += ` ${taskTime}`;
        } else if (!taskDate && taskTime) {
          taskDisplay = taskTime;
        }

        const li = document.createElement('li');
        li.innerHTML = `
          <span class="task-name">${task.name}</span>
          <span class="task-date-time">${taskDisplay}</span>
          <button class="remove" data-index="${index}" aria-label="Remove task ${task.name}">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        taskList.appendChild(li);
      });

      document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', (e) => {
          const taskIndex = e.target.dataset.index;
          removeTask(taskIndex);
        });
      });
    });
  };

  const addTask = () => {
    const taskName = taskNameInput.value.trim();
    let taskDate = taskDateInput.value.trim();
    let taskTime = taskTimeInput.value.trim();

    if (!taskName) {
      alert("Please enter a task name.");
      return;
    }

    if (!taskDate) taskDate = null;
    if (!taskTime) taskTime = null;

    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.push({ name: taskName, date: taskDate, time: taskTime });
      chrome.storage.local.set({ tasks }, () => {
        loadTasks(); 
      });
    });

    taskNameInput.value = '';
    taskDateInput.value = '';
    taskTimeInput.value = '';
    checkInputs();
  };

  const removeTask = (index) => {
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.splice(index, 1); 
      chrome.storage.local.set({ tasks }, () => {
        loadTasks(); 
      });
    });
  };

  addTaskButton.addEventListener('click', addTask);

  [taskNameInput, taskDateInput, taskTimeInput].forEach(input => {
    input.addEventListener('input', checkInputs);
  });

  restrictInputLength(taskNameInput, 100); 
  restrictInputLength(taskDateInput, 10);  
  restrictInputLength(taskTimeInput, 5);    

  loadTasks();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));

    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0); 

    const options = { hour: '2-digit', minute: '2-digit' };
    return time.toLocaleTimeString(undefined, options);
  };
});
