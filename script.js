// Splash Screen
window.addEventListener("load", () => {
    setTimeout(() => {
      const splash = document.getElementById("splash");
      if (splash) splash.style.display = "none";
    }, 2000);
  });
  
  // Funções de Autenticação
  function attemptLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-password').value;
    
    if (user && pass) {
      showLoading();
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      alert('Preencha usuário e senha');
    }
  }
  
  function savePassword() {
    const email = document.getElementById('reset-email').value;
    const newPass = document.getElementById('new-password').value;
    
    if (email && newPass) {
      alert('Senha alterada com sucesso!');
      window.location.href = "index.html";
    }
  }
  
  function createAccount() {
    const email = document.getElementById('register-email').value;
    const pass = document.getElementById('register-password').value;
    
    if (email && pass) {
      alert('Conta criada com sucesso!');
      window.location.href = "index.html";
    }
  }
  
  // Menu do Usuário
  document.getElementById('userAvatar')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('userDropdown').classList.toggle('show');
  });
  
  window.addEventListener('click', function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown?.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  });
  
  // Acessibilidade
  document.getElementById('increaseFont')?.addEventListener('click', () => {
    document.documentElement.style.fontSize = 'larger';
  });
  
  document.getElementById('decreaseFont')?.addEventListener('click', () => {
    document.documentElement.style.fontSize = 'smaller';
  });
  
  document.getElementById('highContrast')?.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
  });
  
  // Utilitários
  function showLoading() {
    const btn = document.querySelector('.auth-form button');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
      btn.disabled = true;
    }
  }
  
  function logout() {
    if (confirm('Deseja sair?')) {
      window.location.href = "index.html";
    }
  }

  // Funções para a Agenda
function renderCalendar(month, year) {
    const calendarDays = document.querySelector('.calendar-days');
    const calendarMonth = document.querySelector('.calendar-month');
    
    const date = new Date(year, month, 1);
    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    calendarMonth.textContent = `${months[month]} ${year}`;
    
    let daysHtml = '';
    
    // Dias do mês anterior
    for (let i = firstDay; i > 0; i--) {
        daysHtml += `<div class="calendar-day other-month">${daysInPrevMonth - i + 1}</div>`;
    }
    
    // Dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        daysHtml += `<div class="calendar-day ${isToday ? 'today' : ''}" onclick="selectDay(this, ${i}, ${month}, ${year})">${i}</div>`;
    }
    
    // Dias do próximo mês
    const daysLeft = 42 - (firstDay + daysInMonth);
    for (let i = 1; i <= daysLeft; i++) {
        daysHtml += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    calendarDays.innerHTML = daysHtml;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
}

function selectDay(element, day, month, year) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    element.classList.add('selected');
    
    const selectedDate = new Date(year, month, day);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    document.querySelector('.current-date').textContent = selectedDate.toLocaleDateString('pt-BR', options);
}

function openTaskForm() {
    document.getElementById('taskModal').style.display = 'block';
}

function closeTaskForm() {
    document.getElementById('taskModal').style.display = 'none';
}

function deleteTask(button) {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
        button.parentElement.remove();
    }
}

document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const time = document.getElementById('taskTime').value;
    const title = document.getElementById('taskTitle').value;
    const discipline = document.getElementById('taskDiscipline').value;
    
    const taskHtml = `
        <div class="task-item">
            <div class="task-time">${time}</div>
            <div class="task-content">
                <div class="task-title">${title}</div>
                <div class="task-discipline">${discipline}</div>
            </div>
            <button class="task-delete" onclick="deleteTask(this)"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    document.querySelector('.tasks-list').insertAdjacentHTML('beforeend', taskHtml);
    closeTaskForm();
    this.reset();
});

// Inicialização
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);
    document.querySelector('.current-date').textContent = new Date().toLocaleDateString('pt-BR');
});

// Variável global para controlar o semestre atual
let currentSemester = '1';

// Dados iniciais do boletim
let gradesData = {
    "1": [
        { discipline: "Algoritmo e Técnicas de Programação", n1: 10, n2: 10, n3: 10 },
        { discipline: "Lógica Matemática", n1: 4, n2: 3, n3: 10 },
        { discipline: "Inglês Instrumental", n1: 10, n2: 10, n3: 10 },
        { discipline: "Matemática Aplicada", n1: 4, n2: 4, n3: 4 }
    ],
    "2": []
};

// Funções auxiliares
function calculateAverage(n1, n2, n3) {
    return ((n1 + n2 + n3) / 3).toFixed(1);
}

function getSituation(average) {
    return average >= 6 ? "Aprovado" : "Reprovado";
}

// Renderiza a tabela de notas
function renderGradesTable() {
    const tableBody = document.getElementById('gradesTableBody');
    tableBody.innerHTML = '';
    
    gradesData[currentSemester].forEach((grade, index) => {
        const average = calculateAverage(grade.n1, grade.n2, grade.n3);
        const situation = getSituation(average);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${grade.discipline}</td>
            <td>${grade.n1}</td>
            <td>${grade.n2}</td>
            <td>${grade.n3}</td>
            <td>${average}</td>
            <td class="situation ${situation.toLowerCase()}">${situation}</td>
            <td class="grade-actions">
                <button class="edit-grade" onclick="editGrade(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-grade" onclick="deleteGrade(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Abre o modal para adicionar/editar
function openGradeForm(index = null) {
    const modal = document.getElementById('gradeModal');
    const form = document.getElementById('gradeForm');
    
    if (index !== null) {
        document.getElementById('modalTitle').textContent = 'Editar Nota';
        document.getElementById('editIndex').value = index;
        
        const grade = gradesData[currentSemester][index];
        document.getElementById('gradeDiscipline').value = grade.discipline;
        document.getElementById('gradeN1').value = grade.n1;
        document.getElementById('gradeN2').value = grade.n2;
        document.getElementById('gradeN3').value = grade.n3;
    } else {
        document.getElementById('modalTitle').textContent = 'Adicionar Nota';
        document.getElementById('editIndex').value = '';
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Fecha o modal
function closeGradeForm() {
    document.getElementById('gradeModal').style.display = 'none';
}

// Deleta uma nota
function deleteGrade(index) {
    if (confirm('Deseja realmente excluir estas notas?')) {
        gradesData[currentSemester].splice(index, 1);
        renderGradesTable();
    }
}

// Edita uma nota
function editGrade(index) {
    openGradeForm(index);
}

// Muda o semestre
function changeSemester() {
    currentSemester = document.getElementById('semesterSelect').value;
    renderGradesTable();
}

// Submit do formulário
document.getElementById('gradeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = document.getElementById('editIndex').value;
    const discipline = document.getElementById('gradeDiscipline').value;
    const n1 = parseFloat(document.getElementById('gradeN1').value);
    const n2 = parseFloat(document.getElementById('gradeN2').value);
    const n3 = parseFloat(document.getElementById('gradeN3').value);
    
    const grade = { discipline, n1, n2, n3 };
    
    if (index === '') {
        gradesData[currentSemester].push(grade);
    } else {
        gradesData[currentSemester][index] = grade;
    }
    
    renderGradesTable();
    closeGradeForm();
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderGradesTable();
});