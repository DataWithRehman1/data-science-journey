// ===========================
// ELITE GPA/CGPA SYNC - JavaScript
// Developer: Ali Zain (SU72-BSAIM-F24-004)
// ===========================

// GRADING SYSTEM - Strictly Implemented
const GRADING_SCALE = [
    { min: 85, max: 100, grade: 'A', points: 4.00 },
    { min: 80, max: 84, grade: 'A-', points: 3.70 },
    { min: 75, max: 79, grade: 'B+', points: 3.30 },
    { min: 70, max: 74, grade: 'B', points: 3.00 },
    { min: 65, max: 69, grade: 'B-', points: 2.70 },
    { min: 60, max: 64, grade: 'C+', points: 2.30 },
    { min: 55, max: 59, grade: 'C', points: 2.00 },
    { min: 50, max: 54, grade: 'D', points: 1.00 },
    { min: 0, max: 49, grade: 'F', points: 0.00 }
];

let mode = 'sgpa';
let subjectCounter = 0;
let semesterCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    if (document.getElementById('subjectsTableBody').children.length === 0) {
        for (let i = 0; i < 3; i++) {
            addSubject();
        }
    }
});

function toggleMode() {
    const toggle = document.getElementById('modeToggle');
    const label = document.getElementById('modeLabel');
    const sgpaView = document.getElementById('sgpaView');
    const cgpaView = document.getElementById('cgpaView');
    toggle.classList.toggle('active');
    if (mode === 'sgpa') {
        mode = 'cgpa';
        label.textContent = 'Detailed Full CGPA History';
        sgpaView.classList.add('hidden');
        cgpaView.classList.remove('hidden');
        if (document.getElementById('semestersContainer').children.length === 0) {
            addSemester();
        }
    } else {
        mode = 'sgpa';
        label.textContent = 'Quick Semester GPA';
        sgpaView.classList.remove('hidden');
        cgpaView.classList.add('hidden');
    }
}

function addSubject() {
    subjectCounter++;
    const tableBody = document.getElementById('subjectsTableBody');
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-white/5 transition fade-in';
    row.id = `subject-${subjectCounter}`;
    row.innerHTML = `<td class="p-3"><input type="text" placeholder="e.g., Data Structures" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 transition" onchange="saveToLocalStorage()"></td><td class="p-3"><input type="number" min="0" max="100" placeholder="0-100" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 transition" oninput="calculateGrade(this, ${subjectCounter})" onchange="saveToLocalStorage()"></td><td class="p-3"><input type="number" min="1" max="6" placeholder="1-6" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 transition" oninput="calculateSGPA()" onchange="saveToLocalStorage()"></td><td class="p-3"><span id="grade-${subjectCounter}" class="font-bold text-cyan-400">-</span></td><td class="p-3"><span id="points-${subjectCounter}" class="font-bold text-violet-400">-</span></td><td class="p-3 no-print"><button onclick="removeSubject(${subjectCounter})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition"><i class="fas fa-times"></i></button></td>`;
    tableBody.appendChild(row);
}

function removeSubject(id) {
    const row = document.getElementById(`subject-${id}`);
    if (row) {
        row.remove();
        calculateSGPA();
        saveToLocalStorage();
    }
}

function calculateGrade(input, id) {
    const marks = parseFloat(input.value);
    const gradeSpan = document.getElementById(`grade-${id}`);
    const pointsSpan = document.getElementById(`points-${id}`);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        gradeSpan.textContent = '-';
        pointsSpan.textContent = '-';
        calculateSGPA();
        return;
    }
    const gradeInfo = GRADING_SCALE.find(scale => marks >= scale.min && marks <= scale.max);
    if (gradeInfo) {
        gradeSpan.textContent = gradeInfo.grade;
        pointsSpan.textContent = gradeInfo.points.toFixed(2);
        if (gradeInfo.points >= 3.70) {
            gradeSpan.className = 'font-bold text-green-400';
        } else if (gradeInfo.points >= 3.00) {
            gradeSpan.className = 'font-bold text-cyan-400';
        } else if (gradeInfo.points >= 2.00) {
            gradeSpan.className = 'font-bold text-yellow-400';
        } else {
            gradeSpan.className = 'font-bold text-red-400';
        }
    }
    calculateSGPA();
}

function calculateSGPA() {
    const tableBody = document.getElementById('subjectsTableBody');
    const rows = tableBody.querySelectorAll('tr');
    let totalQualityPoints = 0;
    let totalCredits = 0;
    rows.forEach(row => {
        const creditsInput = row.querySelector('input[type="number"][min="1"]');
        const pointsSpan = row.querySelector('span[id^="points-"]');
        const credits = parseFloat(creditsInput?.value) || 0;
        const points = parseFloat(pointsSpan?.textContent) || 0;
        if (credits > 0 && points >= 0) {
            totalQualityPoints += points * credits;
            totalCredits += credits;
        }
    });
    const sgpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('sgpaResult').textContent = sgpa;
    document.getElementById('gaugeValue').textContent = sgpa;
    updateGauge(parseFloat(sgpa));
    saveToLocalStorage();
}

function updateGauge(gpa) {
    const gaugeBar = document.getElementById('gaugeBar');
    const percentage = (gpa / 4.0) * 100;
    const rotation = -90 + (percentage * 1.8);
    gaugeBar.style.transform = `rotate(${rotation}deg)`;
}

function cloneLastRow() {
    const tableBody = document.getElementById('subjectsTableBody');
    const rows = tableBody.querySelectorAll('tr');
    if (rows.length === 0) {
        addSubject();
        return;
    }
    const lastRow = rows[rows.length - 1];
    const inputs = lastRow.querySelectorAll('input');
    addSubject();
    const newRow = tableBody.lastElementChild;
    const newInputs = newRow.querySelectorAll('input');
    newInputs[0].value = inputs[0].value + ' (Copy)';
    newInputs[1].value = inputs[1].value;
    newInputs[2].value = inputs[2].value;
    const rowId = parseInt(newRow.id.split('-')[1]);
    calculateGrade(newInputs[1], rowId);
}

function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        if (mode === 'sgpa') {
            document.getElementById('subjectsTableBody').innerHTML = '';
            document.getElementById('totalCredits').textContent = '0';
            document.getElementById('sgpaResult').textContent = '0.00';
            document.getElementById('gaugeValue').textContent = '0.00';
            updateGauge(0);
            addSubject();
        } else {
            document.getElementById('semestersContainer').innerHTML = '';
            document.getElementById('totalSemesters').textContent = '0';
            document.getElementById('cgpaTotalCredits').textContent = '0';
            document.getElementById('cgpaResult').textContent = '0.00';
            semesterCounter = 0;
            addSemester();
        }
        localStorage.clear();
    }
}

function addSemester() {
    semesterCounter++;
    const container = document.getElementById('semestersContainer');
    const semesterDiv = document.createElement('div');
    semesterDiv.className = 'glass-card rounded-xl p-6 mb-6 fade-in';
    semesterDiv.id = `semester-${semesterCounter}`;
    semesterDiv.innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold text-white"><i class="fas fa-book-open mr-2"></i>Semester ${semesterCounter}</h3><button onclick="removeSemester(${semesterCounter})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition no-print"><i class="fas fa-trash mr-2"></i>Remove</button></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div><label class="text-gray-400 text-sm">Semester GPA</label><input type="number" step="0.01" min="0" max="4" placeholder="0.00 - 4.00" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-cyan-500 transition" oninput="calculateCGPA()" onchange="saveToLocalStorage()"></div><div><label class="text-gray-400 text-sm">Credit Hours</label><input type="number" min="1" max="30" placeholder="Total credits" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-cyan-500 transition" oninput="calculateCGPA()" onchange="saveToLocalStorage()"></div><div><label class="text-gray-400 text-sm">Semester Name</label><input type="text" placeholder="e.g., Fall 2025" class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-cyan-500 transition" onchange="saveToLocalStorage()"></div></div><div class="text-right text-gray-400 text-sm">Quality Points: <span class="text-cyan-400 font-bold" id="qp-${semesterCounter}">0.00</span></div>`;
    container.appendChild(semesterDiv);
    calculateCGPA();
}

function removeSemester(id) {
    const semesterDiv = document.getElementById(`semester-${id}`);
    if (semesterDiv) {
        semesterDiv.remove();
        calculateCGPA();
        saveToLocalStorage();
    }
}

function calculateCGPA() {
    const container = document.getElementById('semestersContainer');
    const semesters = container.querySelectorAll('[id^="semester-"]');
    let totalQualityPoints = 0;
    let totalCredits = 0;
    let semesterCount = 0;
    semesters.forEach(semester => {
        const gpaInput = semester.querySelector('input[type="number"][step="0.01"]');
        const creditsInput = semester.querySelector('input[type="number"][min="1"]');
        const qpSpan = semester.querySelector('span[id^="qp-"]');
        const gpa = parseFloat(gpaInput?.value) || 0;
        const credits = parseFloat(creditsInput?.value) || 0;
        if (gpa > 0 && credits > 0) {
            const qualityPoints = gpa * credits;
            totalQualityPoints += qualityPoints;
            totalCredits += credits;
            semesterCount++;
            if (qpSpan) {
                qpSpan.textContent = qualityPoints.toFixed(2);
            }
        }
    });
    const cgpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('totalSemesters').textContent = semesterCount;
    document.getElementById('cgpaTotalCredits').textContent = totalCredits;
    document.getElementById('cgpaResult').textContent = cgpa;
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const data = {
        mode: mode,
        sgpaData: getSGPAData(),
        cgpaData: getCGPAData()
    };
    localStorage.setItem('eliteGPAData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('eliteGPAData');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (data.mode === 'cgpa') {
            toggleMode();
        }
        if (data.sgpaData && data.sgpaData.length > 0) {
            document.getElementById('subjectsTableBody').innerHTML = '';
            data.sgpaData.forEach(subject => {
                addSubject();
                const lastRow = document.getElementById('subjectsTableBody').lastElementChild;
                const inputs = lastRow.querySelectorAll('input');
                inputs[0].value = subject.name;
                inputs[1].value = subject.marks;
                inputs[2].value = subject.credits;
                const rowId = parseInt(lastRow.id.split('-')[1]);
                calculateGrade(inputs[1], rowId);
            });
        }
        if (data.cgpaData && data.cgpaData.length > 0) {
            document.getElementById('semestersContainer').innerHTML = '';
            semesterCounter = 0;
            data.cgpaData.forEach(sem => {
                addSemester();
                const lastSem = document.getElementById('semestersContainer').lastElementChild;
                const inputs = lastSem.querySelectorAll('input');
                inputs[0].value = sem.gpa;
                inputs[1].value = sem.credits;
                inputs[2].value = sem.name;
            });
            calculateCGPA();
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

function getSGPAData() {
    const tableBody = document.getElementById('subjectsTableBody');
    const rows = tableBody.querySelectorAll('tr');
    const data = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        data.push({
            name: inputs[0].value,
            marks: inputs[1].value,
            credits: inputs[2].value
        });
    });
    return data;
}

function getCGPAData() {
    const container = document.getElementById('semestersContainer');
    const semesters = container.querySelectorAll('[id^="semester-"]');
    const data = [];
    semesters.forEach(semester => {
        const inputs = semester.querySelectorAll('input');
        data.push({
            gpa: inputs[0].value,
            credits: inputs[1].value,
            name: inputs[2].value
        });
    });
    return data;
}

function saveRecords() {
    alert('✅ Records saved locally!\n\n🔧 To enable cloud sync:\n1. Set up Firebase or Supabase\n2. Add your API keys\n3. Uncomment cloud save code\n\nData is backed up in browser storage.');
}

function downloadPDF() {
    window.print();
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveRecords();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        downloadPDF();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (mode === 'sgpa') {
            addSubject();
        } else {
            addSemester();
        }
    }
});

setInterval(saveToLocalStorage, 30000);
