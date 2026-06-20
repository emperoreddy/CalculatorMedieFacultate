'use strict';

/* =====================================================
   State
   ===================================================== */
let subjects = [];          // [{ id, name, grade, credits }]
let sortDescending = false;
let toastTimer = null;

const STORAGE_KEY = 'cmf_subjects';

/* =====================================================
   DOM References
   ===================================================== */
const nameInput     = document.getElementById('subject-name');
const gradeInput    = document.getElementById('subject-grade');
const creditsInput  = document.getElementById('subject-credits');
const addBtn        = document.getElementById('add-btn');
const formError     = document.getElementById('form-error');

const avgDisplay    = document.getElementById('avg-display');
const avgBadge      = document.getElementById('avg-badge');
const countDisplay  = document.getElementById('subject-count');
const creditsTotal  = document.getElementById('total-credits');

const gradeBarWrap  = document.getElementById('grade-bar-wrapper');
const gradeBarFill  = document.getElementById('grade-bar-fill');

const subjectList   = document.getElementById('subject-list');
const emptyState    = document.getElementById('empty-state');
const subjectsHdr   = document.getElementById('subjects-header');

const breakdownEl   = document.getElementById('breakdown');
const breakdownList = document.getElementById('breakdown-list');

const actionBar     = document.getElementById('action-bar');
const sortBtn       = document.getElementById('sort-btn');
const clearBtn      = document.getElementById('clear-btn');
const exportBtn     = document.getElementById('export-btn');
const printBtn      = document.getElementById('print-btn');

const toast         = document.getElementById('toast');

const modalOverlay  = document.getElementById('modal-overlay');
const modalTitle    = document.getElementById('modal-title');
const modalMsg      = document.getElementById('modal-message');
const modalCancel   = document.getElementById('modal-cancel');
const modalConfirm  = document.getElementById('modal-confirm');

/* =====================================================
   Storage
   ===================================================== */
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects)); } catch (_) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) subjects = JSON.parse(raw);
  } catch (_) { subjects = []; }
}

/* =====================================================
   Calculations
   ===================================================== */
function calcAverage() {
  if (!subjects.length) return null;
  const weightedSum = subjects.reduce((s, sub) => s + sub.grade * sub.credits, 0);
  const totalCred   = subjects.reduce((s, sub) => s + sub.credits, 0);
  return totalCred === 0 ? null : weightedSum / totalCred;
}

/* =====================================================
   Rendering
   ===================================================== */
function gradeDotClass(grade) {
  if (grade >= 8.5) return 'high';
  if (grade >= 5)   return 'mid';
  return 'low';
}

function gradeBarColor(grade) {
  if (grade >= 8.5) return 'var(--success)';
  if (grade >= 5)   return 'var(--warning)';
  return 'var(--danger)';
}

function renderDashboard() {
  const avg = calcAverage();
  const total = subjects.reduce((s, sub) => s + sub.credits, 0);

  countDisplay.textContent = subjects.length;
  creditsTotal.textContent = total;

  if (avg === null) {
    avgDisplay.textContent = '—';
    avgBadge.textContent = '';
    avgBadge.className = 'stat-badge';
    gradeBarWrap.style.display = 'none';
    return;
  }

  avgDisplay.textContent = avg.toFixed(2);

  gradeBarWrap.style.display = 'block';
  const pct = ((avg - 1) / 9) * 100;
  gradeBarFill.style.width = pct.toFixed(1) + '%';
  gradeBarFill.style.background = gradeBarColor(avg);

  if (avg >= 5) {
    avgBadge.textContent = avg >= 8.5 ? 'Excelent ✓' : 'Promovat ✓';
    avgBadge.className = avg >= 8.5 ? 'stat-badge pass' : 'stat-badge warn';
  } else {
    avgBadge.textContent = 'Nepromovat ✗';
    avgBadge.className = 'stat-badge fail';
  }
}

function renderList() {
  const hasItems = subjects.length > 0;
  emptyState.style.display      = hasItems ? 'none' : 'block';
  subjectsHdr.style.display     = hasItems ? 'flex' : 'none';
  actionBar.style.display       = hasItems ? 'flex' : 'none';
  breakdownEl.style.display     = hasItems ? 'block' : 'none';

  // Subject rows
  subjectList.innerHTML = '';
  subjects.forEach(sub => {
    const li = document.createElement('li');
    li.className = 'subject-item';
    li.dataset.id = sub.id;
    li.innerHTML = `
      <div class="grade-dot ${gradeDotClass(sub.grade)}">${sub.grade % 1 === 0 ? sub.grade : sub.grade.toFixed(2)}</div>
      <div class="subject-info">
        <div class="subject-name">${escHtml(sub.name)}</div>
        <div class="subject-credits">${sub.credits} credit${sub.credits === 1 ? '' : 'e'}</div>
      </div>
      <button class="btn-icon subject-edit-btn" title="Editează" data-action="edit" data-id="${sub.id}" aria-label="Editează ${escHtml(sub.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn-icon btn-delete" title="Șterge" data-action="delete" data-id="${sub.id}" aria-label="Șterge ${escHtml(sub.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    subjectList.appendChild(li);
  });

  renderBreakdown();
}

function renderBreakdown() {
  if (!subjects.length) return;
  const total = subjects.reduce((s, sub) => s + sub.credits, 0);
  breakdownList.innerHTML = '';
  subjects.forEach(sub => {
    const pct = total > 0 ? (sub.credits / total * 100).toFixed(1) : 0;
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <div class="breakdown-name" title="${escHtml(sub.name)}">${escHtml(sub.name)}</div>
      <div class="breakdown-bar-track">
        <div class="breakdown-bar-fill" style="width:${pct}%;background:${gradeBarColor(sub.grade)}"></div>
      </div>
      <div class="breakdown-pct">${pct}%</div>`;
    breakdownList.appendChild(div);
  });
}

function render() {
  renderDashboard();
  renderList();
}

/* =====================================================
   Validation
   ===================================================== */
function setError(msg) {
  formError.textContent = msg;
}

function validate() {
  setError('');
  const name    = nameInput.value.trim();
  const grade   = parseFloat(gradeInput.value);
  const credits = parseInt(creditsInput.value, 10);

  nameInput.classList.remove('error');
  gradeInput.classList.remove('error');
  creditsInput.classList.remove('error');

  let ok = true;

  if (!name) {
    nameInput.classList.add('error');
    setError('Introduceți denumirea materiei.');
    ok = false;
  } else if (isNaN(grade) || grade < 1 || grade > 10) {
    gradeInput.classList.add('error');
    setError('Nota trebuie să fie un număr între 1 și 10.');
    ok = false;
  } else if (isNaN(credits) || credits < 1 || credits > 30) {
    creditsInput.classList.add('error');
    setError('Creditele trebuie să fie un număr întreg între 1 și 30.');
    ok = false;
  }

  return ok ? { name, grade, credits } : null;
}

/* =====================================================
   Add / Edit / Delete
   ===================================================== */
function addSubject() {
  const data = validate();
  if (!data) return;

  subjects.push({ id: Date.now(), ...data });
  save();
  render();
  showToast(`"${data.name}" adăugat!`);

  nameInput.value = '';
  gradeInput.value = '';
  creditsInput.value = '';
  nameInput.focus();
}

function deleteSubject(id) {
  const sub = subjects.find(s => s.id === id);
  if (!sub) return;
  const li = subjectList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      subjects = subjects.filter(s => s.id !== id);
      save();
      render();
    }, { once: true });
  } else {
    subjects = subjects.filter(s => s.id !== id);
    save();
    render();
  }
  showToast(`"${sub.name}" șters.`);
}

function startEdit(id) {
  const sub = subjects.find(s => s.id === id);
  if (!sub) return;

  const li = subjectList.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  li.innerHTML = `
    <div class="edit-row">
      <input type="text" class="edit-name" value="${escHtml(sub.name)}" maxlength="60" />
      <input type="number" class="edit-grade" value="${sub.grade}" min="1" max="10" step="0.01" placeholder="Notă" />
      <input type="number" class="edit-credits" value="${sub.credits}" min="1" max="30" step="1" placeholder="Credite" />
      <button class="btn btn-add" data-action="save-edit" data-id="${id}">Salvează</button>
      <button class="btn btn-ghost" data-action="cancel-edit" data-id="${id}">Anulează</button>
    </div>`;

  li.querySelector('.edit-name').focus();
}

function saveEdit(id) {
  const li = subjectList.querySelector(`[data-id="${id}"]`);
  if (!li) return;

  const nameVal    = li.querySelector('.edit-name').value.trim();
  const gradeVal   = parseFloat(li.querySelector('.edit-grade').value);
  const creditsVal = parseInt(li.querySelector('.edit-credits').value, 10);

  if (!nameVal || isNaN(gradeVal) || gradeVal < 1 || gradeVal > 10 ||
      isNaN(creditsVal) || creditsVal < 1 || creditsVal > 30) {
    showToast('Date invalide. Verificați valorile introduse.');
    return;
  }

  const idx = subjects.findIndex(s => s.id === id);
  if (idx !== -1) {
    subjects[idx] = { id, name: nameVal, grade: gradeVal, credits: creditsVal };
    save();
    render();
    showToast('Materie actualizată!');
  }
}

function sortSubjects() {
  sortDescending = !sortDescending;
  subjects.sort((a, b) => sortDescending ? b.grade - a.grade : a.grade - b.grade);
  save();
  render();
  showToast(`Sortat ${sortDescending ? 'descrescător' : 'crescător'} după notă.`);
}

/* =====================================================
   Modal Confirm
   ===================================================== */
function confirmAction(message, onConfirm) {
  modalMsg.textContent = message;
  modalOverlay.style.display = 'flex';

  const cleanup = () => { modalOverlay.style.display = 'none'; };
  modalConfirm.onclick = () => { cleanup(); onConfirm(); };
  modalCancel.onclick  = cleanup;
  modalOverlay.onclick = (e) => { if (e.target === modalOverlay) cleanup(); };
}

/* =====================================================
   Export
   ===================================================== */
function exportText() {
  const avg = calcAverage();
  const lines = [
    '========================================',
    '   CALCULATOR MEDIE FACULTATE',
    '========================================',
    '',
    'MATERII:',
    '--------',
    ...subjects.map((s, i) =>
      `${i + 1}. ${s.name.padEnd(35)} Notă: ${String(s.grade).padStart(5)}  Credite: ${s.credits}`
    ),
    '',
    '--------',
    `Total credite: ${subjects.reduce((a, s) => a + s.credits, 0)}`,
    `Număr materii: ${subjects.length}`,
    avg !== null ? `MEDIA PONDERATĂ: ${avg.toFixed(2)}` : 'MEDIA: N/A',
    avg !== null ? (avg >= 5 ? 'STATUS: PROMOVAT ✓' : 'STATUS: NEPROMOVAT ✗') : '',
    '',
    `Generat: ${new Date().toLocaleDateString('ro-RO', { dateStyle: 'long' })}`,
    '========================================'
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'medie_facultate.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Fișier exportat!');
}

/* =====================================================
   Toast
   ===================================================== */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* =====================================================
   Utilities
   ===================================================== */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =====================================================
   Event Listeners
   ===================================================== */
addBtn.addEventListener('click', addSubject);

[nameInput, gradeInput, creditsInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') addSubject();
  });
  el.addEventListener('input', () => {
    setError('');
    el.classList.remove('error');
  });
});

// Delegate list actions
subjectList.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id     = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'delete')      deleteSubject(id);
  else if (action === 'edit')   startEdit(id);
  else if (action === 'save-edit')   saveEdit(id);
  else if (action === 'cancel-edit') render();
});

subjectList.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const btn = e.target.closest('[data-action]');
    if (btn) btn.click();
  }
});

sortBtn.addEventListener('click', sortSubjects);

clearBtn.addEventListener('click', () => {
  confirmAction(`Ești sigur că vrei să ștergi toate cele ${subjects.length} materii?`, () => {
    subjects = [];
    save();
    render();
    showToast('Toate materiile au fost șterse.');
  });
});

exportBtn.addEventListener('click', exportText);

printBtn.addEventListener('click', () => window.print());

/* =====================================================
   Keyboard shortcuts
   ===================================================== */
document.addEventListener('keydown', e => {
  // Escape closes modal
  if (e.key === 'Escape') {
    if (modalOverlay.style.display !== 'none') {
      modalOverlay.style.display = 'none';
    }
  }
});

/* =====================================================
   Init
   ===================================================== */
load();
render();
nameInput.focus();
