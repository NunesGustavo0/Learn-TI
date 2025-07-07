// public/js/boletim.js

let allDisciplines = []; // Para armazenar as disciplinas
let currentUserId = null; // Para armazenar o ID do usuário logado

document.addEventListener('DOMContentLoaded', function() {
    // Popula as disciplinas para o modal lendo diretamente do HTML incorporado
    const disciplinesDataElement = document.getElementById('disciplines-data');
    if (disciplinesDataElement) {
        try {
            allDisciplines = JSON.parse(disciplinesDataElement.textContent);
            populateDisciplineSelect();
        } catch (e) {
            console.error('Erro ao parsear dados de disciplinas do HTML:', e);
            showNotification('error', 'Erro', 'Não foi possível carregar as disciplinas para o formulário.');
        }
    } else {
        console.error('Elemento #disciplines-data não encontrado no HTML.');
        showNotification('error', 'Erro', 'Dados de disciplinas não disponíveis.');
    }

    // Lê o ID do usuário do HTML incorporado
    const userDataElement = document.getElementById('user-data');
    if (userDataElement) {
        try {
            currentUserId = parseInt(userDataElement.textContent);
            if (isNaN(currentUserId)) {
                console.error('ID de usuário inválido lido do HTML.');
                showNotification('error', 'Erro', 'Dados de usuário inválidos.');
                currentUserId = null; // Garante que seja null se for NaN
            }
        } catch (e) {
            console.error('Erro ao parsear dados de usuário do HTML:', e);
            showNotification('error', 'Erro', 'Não foi possível carregar os dados do usuário.');
            currentUserId = null;
        }
    } else {
        console.error('Elemento #user-data não encontrado no HTML.');
        showNotification('error', 'Erro', 'Dados de usuário não disponíveis.');
    }

    document.getElementById('gradeYear').value = new Date().getFullYear();

    fetchGrades();

    const semesterFilter = document.getElementById('semesterFilter');
    if (semesterFilter) {
        semesterFilter.addEventListener('change', function() {
            console.log('Filtro de semestre alterado para:', this.value); // Debug
            fetchGrades();
        });
    }

    const gradeForm = document.getElementById('gradeForm');
    if (gradeForm) {
        gradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveGrade();
        });
    }

    // Listener de evento para o botão de confirmação de exclusão
    const confirmDeleteGradeBtn = document.getElementById('confirmDeleteGradeBtn');
    if (confirmDeleteGradeBtn) {
        confirmDeleteGradeBtn.addEventListener('click', function() {
            const gradeIdToDelete = confirmDeleteGradeBtn.dataset.gradeId;
            if (gradeIdToDelete) {
                deleteGradeConfirmed(gradeIdToDelete);
            }
            closeConfirmDeleteModal();
        });
    }
});

function showNotification(type, title, message) {
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <strong class="notification-title">${title}</strong>
            <p class="notification-message">${message}</p>
            <button class="notification-close" onclick="closeNotification()">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

function openGradeModal(grade = null) {
    const modal = document.getElementById('gradeModal');
    const form = document.getElementById('gradeForm');
    const modalTitle = document.getElementById('modalTitle');
    const gradeIdInput = document.getElementById('gradeId');
    const disciplineSelect = document.getElementById('disciplineSelect');
    const gradeYearInput = document.getElementById('gradeYear');
    const gradeSemesterSelect = document.getElementById('gradeSemester');
    const gradeN1Input = document.getElementById('gradeN1');
    const gradeN2Input = document.getElementById('gradeN2');
    const gradeN3Input = document.getElementById('gradeN3');

    form.reset(); // Clear previous form data

    if (grade) {
        // Edit mode
        modalTitle.textContent = 'Editar Nota';
        gradeIdInput.value = grade.bocodigo;
        disciplineSelect.value = grade.disccodigo;
        disciplineSelect.disabled = true;
        gradeYearInput.value = grade.boano;
        gradeYearInput.disabled = true; 
        gradeSemesterSelect.value = grade.bosemestre;
        gradeSemesterSelect.disabled = true;

        gradeN1Input.value = grade.n1 !== null ? parseFloat(grade.n1).toFixed(2) : '';
        gradeN2Input.value = grade.n2 !== null ? parseFloat(grade.n2).toFixed(2) : '';
        gradeN3Input.value = grade.n3 !== null ? parseFloat(grade.n3).toFixed(2) : '';
    } else {
        // Add mode
        modalTitle.textContent = 'Adicionar Nova Nota';
        gradeIdInput.value = '';
        disciplineSelect.disabled = false;
        gradeYearInput.disabled = false;
        gradeSemesterSelect.disabled = false;
        gradeYearInput.value = new Date().getFullYear(); 
    }
    modal.style.display = 'flex';
}

function closeGradeModal() {
    const modal = document.getElementById('gradeModal');
    modal.style.display = 'none';
    document.getElementById('gradeForm').reset();
    document.getElementById('disciplineSelect').disabled = false;
    document.getElementById('gradeYear').disabled = false;
    document.getElementById('gradeSemester').disabled = false;
}

function openConfirmDeleteModal(gradeId) {
    const modal = document.getElementById('confirmDeleteModal');
    document.getElementById('confirmDeleteGradeBtn').dataset.gradeId = gradeId;
    modal.style.display = 'flex';
}

function closeConfirmDeleteModal() {
    const modal = document.getElementById('confirmDeleteModal');
    modal.style.display = 'none';
    document.getElementById('confirmDeleteGradeBtn').dataset.gradeId = '';
}

// --- API INTERACTION FUNCTIONS ---

function populateDisciplineSelect() {
    const disciplineSelect = document.getElementById('disciplineSelect');
    disciplineSelect.innerHTML = '<option value="">Selecione uma Disciplina</option>';
    allDisciplines.forEach(disc => {
        const option = document.createElement('option');
        option.value = disc.disccodigo;
        option.textContent = disc.discnome;
        disciplineSelect.appendChild(option);
    });
}

async function fetchGrades() {
    const gradesTableBody = document.querySelector('#gradesTable tbody');
    const noGradesMessage = document.getElementById('noGradesMessage');
    
    Array.from(gradesTableBody.children).forEach(row => {
        if (row.id !== 'noGradesMessage') {
            row.remove();
        }
    });

    if (!currentUserId) {
        showNotification('error', 'Erro', 'ID do usuário não disponível para carregar notas.');
        noGradesMessage.style.display = 'table-row';
        return;
    }

    const semesterFilter = document.getElementById('semesterFilter');
    const semesterYear = semesterFilter ? semesterFilter.value : 'all';
    
    console.log('Buscando notas para o semestre:', semesterYear); // Debug
    
    let url = `/api/grades?usucodigo=${currentUserId}`;
    if (semesterYear && semesterYear !== 'all') {
        url += `&semesterYear=${semesterYear}`;
    }
    
    console.log('URL da requisição:', url); // Debug

    try {
        const response = await fetch(url);
        const grades = await response.json();

        console.log('Resposta da API:', grades); // Debug

        if (response.ok) {
            if (grades.length === 0) {
                noGradesMessage.style.display = 'table-row';
            } else {
                noGradesMessage.style.display = 'none';
                grades.forEach(grade => {
                    const row = gradesTableBody.insertRow();

                    // Calculate average and situation
                    const n1 = parseFloat(grade.n1) || 0;
                    const n2 = parseFloat(grade.n2) || 0;
                    const n3 = parseFloat(grade.n3) || 0;

                    let average = null;
                    let situation = '';

                    const validGrades = [n1, n2, n3].filter(n => n !== null && !isNaN(n));
                    if (validGrades.length > 0) {
                        average = validGrades.reduce((sum, current) => sum + current, 0) / validGrades.length;
                        average = average.toFixed(2);

                        if (average >= 7) {
                            situation = '<span class="situation aprovado">Aprovado</span>';
                        } else if (average >= 5) {
                            situation = '<span class="situation recuperacao">Recuperação</span>';
                        } else {
                            situation = '<span class="situation reprovado">Reprovado</span>';
                        }
                    } else {
                        average = 'N/A';
                        situation = 'Pendente';
                    }

                    row.innerHTML = `
                        <td>${grade.Disciplina ? grade.Disciplina.discnome : grade.bonome}</td>
                        <td>${grade.boano}</td>
                        <td>${grade.bosemestre}º</td>
                        <td>${grade.n1 !== null ? parseFloat(grade.n1).toFixed(2) : '-'}</td>
                        <td>${grade.n2 !== null ? parseFloat(grade.n2).toFixed(2) : '-'}</td>
                        <td>${grade.n3 !== null ? parseFloat(grade.n3).toFixed(2) : '-'}</td>
                        <td>${average}</td>
                        <td>${situation}</td>
                        <td class="action-buttons">
                            <button class="edit-btn" onclick="openGradeModal(${JSON.stringify(grade).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="openConfirmDeleteModal(${grade.bocodigo})"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                });
            }
        } else {
            showNotification('error', 'Erro', grades.message || 'Erro ao carregar notas.');
        }
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        showNotification('error', 'Erro', 'Ocorreu um erro ao carregar as notas.');
    }
}

async function saveGrade() {
    const gradeId = document.getElementById('gradeId').value;
    const disciplineSelect = document.getElementById('disciplineSelect');
    const disccodigo = disciplineSelect.value;
    const boano = document.getElementById('gradeYear').value;
    const bosemestre = document.getElementById('gradeSemester').value;
    const n1 = document.getElementById('gradeN1').value;
    const n2 = document.getElementById('gradeN2').value;
    const n3 = document.getElementById('gradeN3').value;

    if (!disccodigo || !boano || !bosemestre) {
        showNotification('error', 'Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const gradeData = {
        disccodigo: parseInt(disccodigo),
        boano: parseInt(boano),
        bosemestre: parseInt(bosemestre),
        n1: n1 !== '' ? parseFloat(n1) : null,
        n2: n2 !== '' ? parseFloat(n2) : null,
        n3: n3 !== '' ? parseFloat(n3) : null
    };

    let response;
    try {
        if (gradeId) {
            response = await fetch(`/api/grades/${gradeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData)
            });
        } else {
            response = await fetch('/api/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData)
            });
        }

        const result = await response.json();

        if (response.ok) {
            showNotification('success', 'Sucesso!', result.message);
            closeGradeModal();
            fetchGrades(); 
        } else {
            showNotification('error', 'Erro', result.message || 'Erro ao salvar nota.');
        }
    } catch (error) {
        console.error('Erro ao salvar nota:', error);
        showNotification('error', 'Erro', 'Ocorreu um erro ao salvar a nota.');
    }
}

async function deleteGradeConfirmed(gradeId) {
    try {
        const response = await fetch(`/api/grades/${gradeId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('info', 'Nota Excluída', result.message);
            fetchGrades(); // Re-fetch to update the table
        } else {
            showNotification('error', 'Erro', result.message || 'Erro ao excluir nota.');
        }
    } catch (error) {
        console.error('Erro ao excluir nota:', error);
        showNotification('error', 'Erro', 'Ocorreu um erro ao excluir a nota.');
    }
}