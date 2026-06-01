import { authUsers, getInitialState, tabs, tutorTabs } from './data.js';
import { createId, escapeHtml, formatCurrency, formatDate } from './utils.js';

const VETERINARIANS = [
  'Dra. Ana Martínez',
  'Dr. Carlos López',
  'Dra. Laura Torres',
  'Dr. Felipe Rojas',
  'Dra. Sofía Herrera',
];

export function startApp() {
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('No se encontró el contenedor principal.');
  }

  const state = getInitialState();
  const STORAGE_KEY = 'amigos-peluditos-store';

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      state.tutors = saved.tutors || state.tutors;
      state.pets = saved.pets || state.pets;
      state.inventory = saved.inventory || state.inventory;
      state.appointments = saved.appointments || state.appointments;
      state.medicalRecords = saved.medicalRecords || state.medicalRecords;
    } catch (e) {
      console.warn('No se pudo cargar el store:', e);
    }
  }

  function saveStore() {
    try {
      const snapshot = {
        tutors: state.tutors,
        pets: state.pets,
        inventory: state.inventory,
        appointments: state.appointments,
        medicalRecords: state.medicalRecords,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('No se pudo guardar el store:', e);
    }
  }

  // Cargar datos persistidos si existen
  loadStore();
  const sessionKey = 'amigos-peluditos-session';
  const savedSession = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');

  state.isAuthenticated = Boolean(savedSession);
  state.authError = '';
  state.currentUser = savedSession;

  function setTheme() {
    document.body.dataset.theme = 'light';
  }

  function getCurrentUser() {
    return state.currentUser || null;
  }

  function isAdmin() {
    return getCurrentUser()?.role === 'admin';
  }

  function isTutor() {
    return getCurrentUser()?.role === 'tutor';
  }

  function getAccessibleTabs() {
    return isAdmin() ? tabs : tutorTabs;
  }

  function getCurrentTutorId() {
    return getCurrentUser()?.tutorId || null;
  }

  function getCurrentTutor() {
    const tutorId = getCurrentTutorId();
    return tutorId ? state.tutors.find((tutor) => tutor.id === tutorId) : null;
  }

  function getTutorPets(tutorId = getCurrentTutorId()) {
    if (!tutorId) {
      return [];
    }

    return state.pets.filter((pet) => pet.tutorId === tutorId);
  }

  function renderIcon(name, className = 'icon-badge') {
    const icons = {
      dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z"/></svg>',
      users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9" cy="8" r="3"/><path d="M22 20v-1a3.5 3.5 0 0 0-2.5-3.35"/><path d="M15 5.8a3 3 0 0 1 0 5.9"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
      'calendar-plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M12 13v6M9 16h6"/></svg>',
      file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6M9 9h1"/></svg>',
      box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5-9 4.5z"/><path d="M3 7.5V17.5L12 22l9-4.5V7.5"/><path d="M12 12v10"/></svg>',
      chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-6"/></svg>',
      paw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.2" cy="8" r="1.6"/><circle cx="9" cy="5.8" r="1.6"/><circle cx="15" cy="5.8" r="1.6"/><circle cx="18.8" cy="8" r="1.6"/><path d="M7.6 14.2c0-2.3 1.7-4.2 4.4-4.2s4.4 1.9 4.4 4.2c0 1.5-1.3 3.1-4.4 3.1s-4.4-1.6-4.4-3.1Z"/></svg>',
      default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16"/><path d="M12 4v16"/></svg>',
    };

    return `<span class="${className}">${icons[name] || icons.default}</span>`;
  }

  function getTutorAppointments(tutorId = getCurrentTutorId()) {
    if (!tutorId) {
      return [];
    }

    return state.appointments.filter((appointment) => appointment.tutorId === tutorId);
  }

  function getTutorById(tutorId) {
    return state.tutors.find((tutor) => tutor.id === tutorId);
  }

  function getPetById(petId) {
    return state.pets.find((pet) => pet.id === petId);
  }

  function getStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      totalTutors: state.tutors.length,
      totalPets: state.pets.length,
      totalRecords: state.medicalRecords.length,
      recentRecords: state.medicalRecords.filter((record) => new Date(record.date) >= weekAgo).length,
    };
  }

  function getSpeciesBreakdown() {
    return state.pets.reduce((accumulator, pet) => {
      accumulator[pet.species] = (accumulator[pet.species] || 0) + 1;
      return accumulator;
    }, {});
  }

  function getFilteredTutors() {
    if (!isAdmin()) {
      return [];
    }

    const term = state.searchTerm.trim().toLowerCase();

    if (!term) {
      return state.tutors;
    }

    return state.tutors.filter((tutor) => {
      return (
        tutor.name.toLowerCase().includes(term) ||
        tutor.idNumber.includes(term) ||
        tutor.phone.includes(term)
      );
    });
  }

  function getFilteredPets() {
    if (isTutor()) {
      return getTutorPets();
    }

    const term = state.searchTerm.trim().toLowerCase();

    if (!term) {
      return state.pets;
    }

    return state.pets.filter((pet) => {
      const tutor = getTutorById(pet.tutorId);
      return (
        pet.name.toLowerCase().includes(term) ||
        pet.species.toLowerCase().includes(term) ||
        tutor?.name.toLowerCase().includes(term)
      );
    });
  }

  function getModalContext() {
    if (!state.modal) {
      return {};
    }

    return state.modal.payload || {};
  }

  function render() {
    setTheme();

    const activeElement = document.activeElement;
    const preserveSearchFocus =
      activeElement instanceof HTMLInputElement && activeElement.dataset.action === 'search-patients';
    const searchSelectionStart = preserveSearchFocus ? activeElement.selectionStart : null;
    const searchSelectionEnd = preserveSearchFocus ? activeElement.selectionEnd : null;
    const searchValue = preserveSearchFocus ? activeElement.value : state.searchTerm;

    if (!state.isAuthenticated) {
      root.innerHTML = renderLoginView();
      return;
    }

    root.innerHTML = `
      <div class="shell">
        ${renderHeader()}
        ${renderNav()}
        <main class="content">
          ${renderActiveTab()}
        </main>
        ${renderModal()}
      </div>
    `;

    if (preserveSearchFocus) {
      const searchInput = root.querySelector('[data-action="search-patients"]');

      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus();

        if (typeof searchSelectionStart === 'number' && typeof searchSelectionEnd === 'number') {
          searchInput.setSelectionRange(searchSelectionStart, searchSelectionEnd);
        } else {
          searchInput.value = searchValue;
        }
      }
    }
  }

  function renderLoginView() {
    return `
      <main class="auth-shell">
        <section class="auth-card">
          <div class="auth-brand">
            <img class="auth-brand__logo" src="./img/logo.png" alt="Logo de Amigos Peluditos" />
            <div>
              <p class="eyebrow">Acceso</p>
              <h1>Amigos Peluditos</h1>
              <p>Sistema de gestión veterinaria</p>
            </div>
          </div>

          <div class="auth-copy">
            <h2>Inicia sesión como administrador o tutor.</h2>
            <p>El administrador entra al panel completo; el tutor solo ve sus mascotas, historial y citas.</p>
          </div>

          <form class="auth-form" data-form="login">
            <label class="field">
              <span>Tipo de acceso</span>
              <select class="input" name="role" required>
                <option value="admin">Administrador</option>
                <option value="tutor">Tutor</option>
              </select>
            </label>
            <label class="field">
              <span>Correo electrónico</span>
              <input class="input" name="email" type="email" placeholder="admin@clinic.com" autocomplete="email" required />
            </label>
            <label class="field">
              <span>Contraseña</span>
              <input class="input" name="password" type="password" placeholder="Veterinaria2026" autocomplete="current-password" required />
            </label>
            ${state.authError ? `<p class="auth-error">${escapeHtml(state.authError)}</p>` : ''}
            <button class="btn btn--primary btn--full" type="submit">Ingresar</button>
          </form>

          <div class="auth-hint">
            <p>Demo admin: admin@clinic.com / Veterinaria2026</p>
            <p>Demo tutor: maria@email.com / Maria2026 o carlos@email.com / Carlos2026</p>
          </div>
        </section>
      </main>
    `;
  }

  function renderHeader() {
    const currentUser = getCurrentUser();
    return `
      <header class="topbar">
        <div class="brand">
          <img class="brand__logo" src="./img/logo.png" alt="Logo de Amigos Peluditos" />
          <div>
            <h1>Amigos Peluditos</h1>
            <p>${isAdmin() ? 'Panel de administración' : 'Portal de tutor'}</p>
          </div>
        </div>
        <div class="topbar__actions">
          <div class="topbar__user">
            <span>${escapeHtml(currentUser?.displayName || 'Usuario')}</span>
            <small>${isAdmin() ? 'Administrador' : 'Tutor'}</small>
          </div>
          <button class="btn btn--secondary" type="button" data-action="logout">
            Salir
          </button>
          ${isAdmin() ? '<button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="tutor">Nuevo tutor</button>' : ''}
        </div>
      </header>
    `;
  }

  function renderNav() {
    const visibleTabs = getAccessibleTabs();

    return `
      <nav class="tabs" aria-label="Secciones principales">
        ${visibleTabs
          .map(
            (tab) => `
              <button
                type="button"
                class="tab ${state.activeTab === tab.id ? 'tab--active' : ''}"
                data-action="switch-tab"
                data-tab="${tab.id}"
              >
                ${renderIcon(tab.icon, 'tab__icon')}
                ${tab.label}
              </button>
            `,
          )
          .join('')}
      </nav>
    `;
  }

  function renderActiveTab() {
    if (isTutor()) {
      switch (state.activeTab) {
        case 'my-history':
          return renderTutorHistoryTab();
        case 'request-appointment':
          return renderTutorAppointmentTab();
        case 'my-pets':
        default:
          return renderTutorPetsTab();
      }
    }

    switch (state.activeTab) {
      case 'patients':
        return renderPatientsTab();
      case 'appointments':
        return renderAppointmentsTab();
      case 'history':
        return renderHistoryTab();
      case 'inventory':
        return renderInventoryTab();
      case 'reports':
        return renderReportsTab();
      case 'dashboard':
      default:
        return renderDashboardTab();
    }
  }

  function renderTutorPetsTab() {
    const tutor = getCurrentTutor();
    const pets = getTutorPets();

    return `
      <section class="stack">
        <div class="section-hero">
          <div>
            <p class="eyebrow">Mis mascotas</p>
            <h2>${escapeHtml(tutor?.name || 'Tutor')}</h2>
            <p class="section-hero__copy">Revisa tus mascotas registradas y accede a su historial clínico.</p>
          </div>
          <div class="hero-chip">
            <span>Mascotas registradas</span>
            <strong>${pets.length}</strong>
          </div>
        </div>

        <section class="panel">
          <div class="grid grid--cards">
            ${pets.map((pet) => renderTutorPetCard(pet)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderTutorHistoryTab() {
    const pets = getTutorPets();
    const records = state.medicalRecords.filter((record) => pets.some((pet) => pet.id === record.petId));

    return `
      <section class="stack">
        <div class="section-hero">
          <div>
            <p class="eyebrow">Historial clínico</p>
            <h2>Seguimiento de tus mascotas</h2>
            <p class="section-hero__copy">Consulta sus diagnósticos, tratamientos y próximas visitas.</p>
          </div>
          <div class="hero-chip">
            <span>Registros visibles</span>
            <strong>${records.length}</strong>
          </div>
        </div>

        <section class="panel">
          <div class="grid grid--cards">
            ${records.length ? records.map((record) => renderMedicalRecordCard(record)).join('') : '<div class="empty-state">No hay historial clínico para mostrar.</div>'}
          </div>
        </section>
      </section>
    `;
  }

  function renderTutorAppointmentTab() {
    const pets = getTutorPets();
    const appointments = getTutorAppointments();

    return `
      <section class="stack">
        <div class="section-hero">
          <div>
            <p class="eyebrow">Solicitar cita</p>
            <h2>Agenda una visita para tu mascota</h2>
            <p class="section-hero__copy">El sistema enviará la solicitud para validación del equipo veterinario.</p>
          </div>
          <div class="hero-chip">
            <span>Solicitudes</span>
            <strong>${appointments.length}</strong>
          </div>
        </div>

        <section class="panel panel--split">
          <div>
            <p class="eyebrow">Nueva solicitud</p>
            <h3>Crear cita</h3>
          </div>
          <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="appointment">
            Solicitar cita
          </button>
        </section>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Mis solicitudes</p>
              <h3>Citas registradas</h3>
            </div>
          </div>
          <div class="grid grid--cards">
            ${appointments.length ? appointments.map((appointment) => renderAppointmentCard(appointment)).join('') : '<div class="empty-state">Aún no has solicitado citas.</div>'}
          </div>
        </section>
      </section>
    `;
  }

  function renderDashboardTab() {
    const stats = getStats();
    const recentPets = state.pets.slice(0, 6);

    return `
      <section class="stack">
        <div class="section-hero">
        </div>

        <div class="grid grid--stats">
          ${renderStatCard('Total tutores', stats.totalTutors, 'Clientes registrados')}
          ${renderStatCard('Total mascotas', stats.totalPets, 'Pacientes activos')}
          ${renderStatCard('Consultas totales', stats.totalRecords, 'Historial clínico')}
          ${renderStatCard('Esta semana', stats.recentRecords, 'Actividad reciente')}
        </div>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Recientes</p>
              <h3>Mascotas recientes</h3>
            </div>
          </div>
          <div class="grid grid--cards">
            ${recentPets.map((pet) => renderPetCard(pet, true)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderPatientsTab() {
    const tutors = getFilteredTutors();
    const pets = getFilteredPets();

    return `
      <section class="stack">
        <div class="panel panel--split">
          <div>
            <p class="eyebrow">Pacientes</p>
            <h2>Buscar tutor o mascota.</h2>
          </div>
          <label class="search">
            <span class="search__label">Buscar</span>
            <input
              type="search"
              class="input"
              value="${escapeHtml(state.searchTerm)}"
              placeholder="Tutor, cédula, teléfono o mascota"
              data-action="search-patients"
            />
          </label>
        </div>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Tutores</p>
              <h3>${tutors.length} registrados</h3>
            </div>
          </div>
          <div class="grid grid--cards">
            ${tutors.map((tutor) => renderTutorCard(tutor)).join('')}
          </div>
        </section>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Mascotas</p>
              <h3>${pets.length} resultados</h3>
            </div>
          </div>
          <div class="grid grid--cards">
            ${pets.map((pet) => renderPetCard(pet, false)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderAppointmentsTab() {
    const appointments = [...state.appointments].sort((left, right) => {
      const leftDate = new Date(`${left.date}T${left.time}`);
      const rightDate = new Date(`${right.date}T${right.time}`);
      return leftDate - rightDate;
    });

    return `
      <section class="stack">
        <div class="panel panel--split">
          <div>
            <p class="eyebrow">Agenda</p>
            <h2>Citas programadas y seguimiento de visitas.</h2>
          </div>
          <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="appointment">
            Nueva cita
          </button>
        </div>

        <section class="panel">
          <div class="grid grid--cards">
            ${appointments.map((appointment) => renderAppointmentCard(appointment)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderHistoryTab() {
    const records = [...state.medicalRecords].sort((left, right) => new Date(right.date) - new Date(left.date));

    return `
      <section class="stack">
        <div class="panel panel--split">
          <div>
            <p class="eyebrow">Historia clínica</p>
            <h2>Resumen de consultas, diagnósticos y próximos controles.</h2>
          </div>
          <div class="mini-note">
            ${records.length} registros clínicos
          </div>
        </div>

        <section class="panel">
          <div class="grid grid--cards">
            ${records.map((record) => renderMedicalRecordCard(record)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderInventoryTab() {
    const lowStock = state.inventory.filter((item) => item.quantity <= 8).length;

    return `
      <section class="stack">
        <div class="panel panel--split">
          <div>
            <p class="eyebrow">Inventario</p>
            <h2>Medicamentos, insumos y productos de cuidado.</h2>
          </div>
          <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="inventory">
            Nuevo producto
          </button>
        </div>

        <div class="grid grid--stats">
          ${renderStatCard('Productos', state.inventory.length, 'Artículos activos')}
          ${renderStatCard('Stock bajo', lowStock, 'Requiere reposición')}
          ${renderStatCard('Valor listado', formatCurrency(state.inventory.reduce((sum, item) => sum + item.price * item.quantity, 0)), 'Estimado actual')}
        </div>

        <section class="panel">
          <div class="grid grid--cards">
            ${state.inventory.map((item) => renderInventoryCard(item)).join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderReportsTab() {
    const stats = getStats();
    const speciesBreakdown = Object.entries(getSpeciesBreakdown());
    const pendingAppointments = state.appointments.filter((appointment) => appointment.status !== 'Confirmada').length;

    return `
      <section class="stack">
        <div class="panel panel--split">
          <div>
            <p class="eyebrow">Reportes</p>
            <h2>Lectura rápida de actividad y distribución de pacientes.</h2>
          </div>
          <div class="mini-note">
            ${pendingAppointments} citas pendientes
          </div>
        </div>

        <div class="grid grid--stats">
          ${renderStatCard('Tutores', stats.totalTutors, 'Base de clientes')}
          ${renderStatCard('Mascotas', stats.totalPets, 'Pacientes totales')}
          ${renderStatCard('Consultas', stats.totalRecords, 'Consultas acumuladas')}
          ${renderStatCard('Pendientes', pendingAppointments, 'Citas por confirmar')}
        </div>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Distribución</p>
              <h3>Pacientes por especie</h3>
            </div>
          </div>
          <div class="distribution">
            ${speciesBreakdown
              .map(
                ([species, count]) => `
                  <div class="distribution__row">
                    <div>
                      <strong>${escapeHtml(species)}</strong>
                      <span>${count} pacientes</span>
                    </div>
                    <div class="distribution__bar">
                      <div class="distribution__bar-fill" style="width: ${Math.max(18, count * 28)}%"></div>
                    </div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      </section>
    `;
  }

  function renderStatCard(title, value, description) {
    return `
      <article class="stat">
        <div class="stat__header">
          ${renderIcon(getStatIcon(title), 'stat__icon')}
          <p>${escapeHtml(title)}</p>
        </div>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(description)}</span>
      </article>
    `;
  }

  function getStatIcon(title) {
    if (title.includes('Tutor')) return 'users';
    if (title.includes('Mascota')) return 'paw';
    if (title.includes('Consulta')) return 'file';
    if (title.includes('Stock') || title.includes('Productos')) return 'box';
    if (title.includes('Pend')) return 'calendar';
    return 'chart';
  }

  function renderTutorCard(tutor) {
    const pets = state.pets.filter((pet) => pet.tutorId === tutor.id);

    return `
      <article class="card">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('users', 'card__icon')}
            <div>
              <p class="card__eyebrow">Tutor</p>
              <h4>${escapeHtml(tutor.name)}</h4>
            </div>
          </div>
          <span class="pill">${escapeHtml(tutor.city)}</span>
        </div>
        <div class="card__meta">
          <span>${escapeHtml(tutor.phone)}</span>
          <span>${escapeHtml(tutor.idNumber)}</span>
          <span>${escapeHtml(tutor.email)}</span>
        </div>
        <div class="chip-row">
          ${pets
            .map((pet) => `<span class="chip">${escapeHtml(pet.name)}</span>`)
            .join('') || '<span class="chip chip--muted">Sin mascotas</span>'}
        </div>
        <div class="card__actions">
          <button class="btn btn--secondary" type="button" data-action="open-modal" data-modal-type="pet" data-tutor-id="${escapeHtml(tutor.id)}" data-tutor-name="${escapeHtml(tutor.name)}">
            Nuevo paciente
          </button>
        </div>
      </article>
    `;
  }

  function renderPetCard(pet, compact) {
    const tutor = getTutorById(pet.tutorId);

    return `
      <article class="card ${compact ? 'card--compact' : ''}">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('paw', 'card__icon')}
            <div>
              <p class="card__eyebrow">Mascota</p>
              <h4>${escapeHtml(pet.name)}</h4>
            </div>
          </div>
          <span class="pill">${escapeHtml(pet.species)}</span>
        </div>
        <div class="card__meta">
          <span>Raza: ${escapeHtml(pet.breed)}</span>
          <span>Edad: ${escapeHtml(pet.age)} años</span>
          <span>Peso: ${escapeHtml(pet.weight)} kg</span>
          <span>Color: ${escapeHtml(pet.color)}</span>
          <span>Género: ${escapeHtml(pet.gender)}</span>
          <span>Tutor: ${escapeHtml(tutor?.name || 'Desconocido')}</span>
        </div>
        <div class="card__actions card__actions--wrap">
          <button class="btn btn--secondary" type="button" data-action="open-modal" data-modal-type="history" data-pet-id="${escapeHtml(pet.id)}">
            Ver historial
          </button>
          <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="medical" data-pet-id="${escapeHtml(pet.id)}" data-pet-name="${escapeHtml(pet.name)}">
            Nueva consulta
          </button>
        </div>
      </article>
    `;
  }

  function renderTutorPetCard(pet) {
    return `
      <article class="card">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('paw', 'card__icon')}
            <div>
              <p class="card__eyebrow">Mascota</p>
              <h4>${escapeHtml(pet.name)}</h4>
            </div>
          </div>
          <span class="pill">${escapeHtml(pet.species)}</span>
        </div>
        <div class="card__meta">
          <span>Raza: ${escapeHtml(pet.breed)}</span>
          <span>Edad: ${escapeHtml(pet.age)} años</span>
          <span>Peso: ${escapeHtml(pet.weight)} kg</span>
        </div>
        <div class="card__actions card__actions--wrap">
          <button class="btn btn--secondary" type="button" data-action="open-modal" data-modal-type="history" data-pet-id="${escapeHtml(pet.id)}" data-pet-name="${escapeHtml(pet.name)}">
            Ver historial
          </button>
          <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="appointment" data-pet-id="${escapeHtml(pet.id)}" data-pet-name="${escapeHtml(pet.name)}">
            Solicitar cita
          </button>
        </div>
      </article>
    `;
  }

  function renderAppointmentCard(appointment) {
    return `
      <article class="card">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('calendar', 'card__icon')}
            <div>
              <p class="card__eyebrow">Cita</p>
              <h4>${escapeHtml(appointment.petName)}</h4>
            </div>
          </div>
          <span class="pill ${appointment.status === 'Confirmada' ? 'pill--success' : 'pill--warning'}">
            ${escapeHtml(appointment.status)}
          </span>
        </div>
        <div class="card__meta">
          <span>${formatDate(appointment.date)} · ${escapeHtml(appointment.time)}</span>
          <span>${escapeHtml(appointment.reason)}</span>
          <span>${escapeHtml(appointment.veterinarian)}</span>
        </div>
      </article>
    `;
  }

  function renderMedicalRecordCard(record) {
    const pet = getPetById(record.petId);

    return `
      <article class="card">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('file', 'card__icon')}
            <div>
              <p class="card__eyebrow">${escapeHtml(record.type)}</p>
              <h4>${escapeHtml(pet?.name || 'Mascota no encontrada')}</h4>
            </div>
          </div>
          <span class="pill">${formatDate(record.date)}</span>
        </div>
        <div class="card__meta">
          <span>Diagnóstico: ${escapeHtml(record.diagnosis)}</span>
          <span>Tratamiento: ${escapeHtml(record.treatment)}</span>
          <span>Próxima visita: ${formatDate(record.nextVisit)}</span>
          <span>Veterinario: ${escapeHtml(record.veterinarian)}</span>
        </div>
      </article>
    `;
  }

  function renderInventoryCard(item) {
    return `
      <article class="card">
        <div class="card__header">
          <div class="card__title">
            ${renderIcon('box', 'card__icon')}
            <div>
              <p class="card__eyebrow">Inventario</p>
              <h4>${escapeHtml(item.name)}</h4>
            </div>
          </div>
          <span class="pill ${item.quantity <= 8 ? 'pill--warning' : 'pill--success'}">
            ${escapeHtml(item.status)}
          </span>
        </div>
        <div class="card__meta">
          <span>Categoría: ${escapeHtml(item.category)}</span>
          <span>Cantidad: ${escapeHtml(item.quantity)}</span>
          <span>Precio: ${formatCurrency(item.price)}</span>
        </div>
      </article>
    `;
  }

  function renderModal() {
    if (!state.modal) {
      return '';
    }

    const context = getModalContext();

    if (state.modal.type === 'history') {
      const pet = getPetById(context.petId);
      const records = state.medicalRecords.filter((record) => record.petId === context.petId);

      return `
        <div class="modal-overlay" data-action="close-modal">
          <section class="modal modal--wide" data-modal-panel>
            <div class="modal__header">
              <div>
                <p class="eyebrow">Historial</p>
                <h3>${escapeHtml(pet?.name || context.petName || 'Mascota')}</h3>
              </div>
              <button class="icon-button" type="button" data-action="close-modal">×</button>
            </div>
            <div class="stack stack--compact">
              ${
                records.length
                  ? records
                      .map(
                        (record) => `
                          <article class="timeline-item">
                            <div class="timeline-item__head">
                              <strong>${escapeHtml(record.type)}</strong>
                              <span>${formatDate(record.date)}</span>
                            </div>
                            <p>${escapeHtml(record.diagnosis)}</p>
                            <small>${escapeHtml(record.treatment)} · ${escapeHtml(record.veterinarian)}</small>
                          </article>
                        `,
                      )
                      .join('')
                  : '<div class="empty-state">No hay registros clínicos para esta mascota.</div>'
              }
            </div>
            <div class="modal__actions">
              <button class="btn btn--secondary" type="button" data-action="close-modal">Cerrar</button>
              <button class="btn btn--primary" type="button" data-action="open-modal" data-modal-type="medical" data-pet-id="${escapeHtml(context.petId)}" data-pet-name="${escapeHtml(pet?.name || context.petName || '')}">
                Nueva consulta
              </button>
            </div>
          </section>
        </div>
      `;
    }

    const formMap = {
      tutor: {
        title: 'Nuevo tutor',
        submit: 'Guardar tutor',
        fields: `
          <div class="form-grid">
            ${renderInputField('Nombre completo', 'name', 'text', '', 'María González')}
            ${renderInputField('Correo electrónico', 'email', 'email', '', 'maria@email.com')}
            ${renderInputField('Teléfono', 'phone', 'tel', '', '+57 300 123 4567')}
            ${renderInputField('Ciudad', 'city', 'text', '', 'Bogotá')}
            ${renderInputField('Cédula', 'idNumber', 'text', '', '123456789')}
            ${renderInputField('Dirección', 'address', 'text', '', 'Calle 45 #23-12', true, true)}
          </div>
        `,
      },
      pet: {
        title: 'Nuevo paciente',
        submit: 'Guardar mascota',
        fields: `
          <div class="modal-context">Tutor seleccionado: <strong>${escapeHtml(context.tutorName || '')}</strong></div>
          <div class="form-grid">
            ${renderInputField('Nombre', 'name', 'text', '', 'Max')}
            ${renderInputField('Especie', 'species', 'text', '', 'Perro')}
            ${renderInputField('Raza', 'breed', 'text', '', 'Labrador')}
            ${renderInputField('Edad', 'age', 'number', '', '3')}
            ${renderInputField('Peso', 'weight', 'number', '', '12.5', false, false, '0.1')}
            ${renderInputField('Color', 'color', 'text', '', 'Dorado')}
            ${renderSelectField('Género', 'gender', ['Macho', 'Hembra'])}
          </div>
        `,
      },
      medical: {
        title: 'Nueva consulta',
        submit: 'Guardar consulta',
        fields: `
          <div class="modal-context">Paciente seleccionado: <strong>${escapeHtml(context.petName || '')}</strong></div>
          <div class="form-grid">
            ${renderInputField('Fecha', 'date', 'date', '', '', true)}
            ${renderInputField('Tipo', 'type', 'text', '', 'Consulta general')}
            ${renderInputField('Peso', 'weight', 'number', '', '12.5', false, false, '0.1')}
            ${renderInputField('Temperatura', 'temperature', 'number', '', '38.2', false, false, '0.1')}
            ${renderInputField('Veterinario', 'veterinarian', 'text', '', 'Dra. Ana Martínez')}
            ${renderInputField('Próxima visita', 'nextVisit', 'date', '', '')}
            ${renderTextareaField('Diagnóstico', 'diagnosis', 'Paciente estable y sin signos de alarma.')}
            ${renderTextareaField('Tratamiento', 'treatment', 'Tratamiento según evaluación clínica.')}
            ${renderTextareaField('Observaciones', 'observations', 'Observación adicional del caso.')}
          </div>
        `,
      },
      appointment: {
        title: 'Nueva cita',
        submit: 'Guardar cita',
        fields: renderModalAppointmentFields(context),
      },
      inventory: {
        title: 'Nuevo producto',
        submit: 'Guardar producto',
        fields: `
          <div class="form-grid">
            ${renderInputField('Nombre', 'name', 'text', '', 'Suero fisiológico')}
            ${renderSelectField('Categoría', 'category', ['Medicamentos', 'Insumos', 'Cuidado'])}
            ${renderInputField('Cantidad', 'quantity', 'number', '', '12')}
            ${renderInputField('Precio unitario', 'price', 'number', '', '35000')}
            ${renderSelectField('Estado', 'status', ['Disponible', 'Stock bajo'])}
          </div>
        `,
      },
    };

    const modalConfig = formMap[state.modal.type];

    if (!modalConfig) {
      return '';
    }

    return `
      <div class="modal-overlay" data-action="close-modal">
        <section class="modal" data-modal-panel>
          <div class="modal__header">
            <div>
              <p class="eyebrow">Formulario</p>
              <h3>${escapeHtml(modalConfig.title)}</h3>
            </div>
            <button class="icon-button" type="button" data-action="close-modal">×</button>
          </div>
          <form class="modal-form" data-form="${state.modal.type}">
            ${modalConfig.fields}
            <div class="modal__actions">
              <button class="btn btn--secondary" type="button" data-action="close-modal">Cancelar</button>
              <button class="btn btn--primary" type="submit">${escapeHtml(modalConfig.submit)}</button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  function renderInputField(label, name, type, value, placeholder, required = true, textarea = false, step) {
    const requiredAttr = required ? 'required' : '';
    const stepAttr = step ? `step="${escapeHtml(step)}"` : '';

    return `
      <label class="field">
        <span>${escapeHtml(label)}</span>
        <input
          class="input"
          name="${escapeHtml(name)}"
          type="${escapeHtml(type)}"
          value="${escapeHtml(value)}"
          placeholder="${escapeHtml(placeholder)}"
          ${requiredAttr}
          ${stepAttr}
        />
      </label>
    `;
  }

  function renderTextareaField(label, name, placeholder) {
    return `
      <label class="field field--full">
        <span>${escapeHtml(label)}</span>
        <textarea class="textarea" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" required></textarea>
      </label>
    `;
  }

  function renderSelectField(label, name, options) {
    return `
      <label class="field">
        <span>${escapeHtml(label)}</span>
        <select class="input" name="${escapeHtml(name)}" required>
          ${options
            .map((option) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const selectedAttr = typeof option === 'object' && option.selected ? ' selected' : '';
              return `<option value="${escapeHtml(optionValue)}"${selectedAttr}>${escapeHtml(optionLabel)}</option>`;
            })
            .join('')}
        </select>
      </label>
    `;
  }

  function openModal(type, payload = {}) {
    state.modal = { type, payload };
    render();
  }

  function closeModal() {
    state.modal = null;
    render();
  }

  function switchTab(tab) {
    state.activeTab = tab;
    render();
  }

  function handleFormSubmit(form) {
    const formType = form.dataset.form;

    if (formType === 'login') {
      const values = Object.fromEntries(new FormData(form).entries());

      const user = authUsers.find((candidate) => {
        return candidate.role === values.role && candidate.email === values.email && candidate.password === values.password;
      });

      if (!user) {
        state.authError = 'Credenciales incorrectas.';
        render();
        return;
      }

      state.isAuthenticated = true;
      state.authError = '';
      state.currentUser = {
        role: user.role,
        email: user.email,
        displayName: user.displayName,
        tutorId: user.tutorId || null,
      };
      state.activeTab = user.role === 'admin' ? 'dashboard' : 'my-pets';
      sessionStorage.setItem(sessionKey, JSON.stringify(state.currentUser));
      render();
      return;
    }

    const values = Object.fromEntries(new FormData(form).entries());

    if (formType === 'tutor') {
      state.tutors.push({
        id: createId('tutor'),
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        idNumber: values.idNumber,
      });
      saveStore();
    }

    if (formType === 'pet' && state.modal?.payload?.tutorId) {
      state.pets.push({
        id: createId('pet'),
        name: values.name,
        species: values.species,
        breed: values.breed,
        age: Number(values.age),
        weight: Number(values.weight),
        color: values.color,
        gender: values.gender,
        tutorId: state.modal.payload.tutorId,
      });
      saveStore();
    }

    if (formType === 'medical' && state.modal?.payload?.petId) {
      state.medicalRecords.push({
        id: createId('record'),
        petId: state.modal.payload.petId,
        date: values.date,
        type: values.type,
        diagnosis: values.diagnosis,
        treatment: values.treatment,
        observations: values.observations,
        nextVisit: values.nextVisit,
        weight: Number(values.weight),
        temperature: Number(values.temperature),
        veterinarian: values.veterinarian,
      });
      saveStore();
    }

    if (formType === 'appointment') {
      const pet = isTutor()
        ? state.pets.find((petItem) => petItem.id === values.petId && petItem.tutorId === getCurrentTutorId())
        : state.pets.find((petItem) => petItem.id === values.petId);

      if (!pet) {
        return;
      }

      if (isTutor()) {
        state.appointments.push({
          id: createId('appointment'),
          tutorId: getCurrentTutorId(),
          petId: pet.id,
          petName: pet.name,
          date: values.date,
          time: values.time,
          reason: values.reason,
          veterinarian: values.veterinarian,
          status: 'Solicitud enviada',
        });
        saveStore();
        closeModal();
        return;
      }

      state.appointments.push({
        id: createId('appointment'),
        petId: pet.id,
        petName: pet.name,
        date: values.date,
        time: values.time,
        reason: values.reason,
        veterinarian: values.veterinarian,
        status: values.status,
      });
      saveStore();
    }

    if (formType === 'inventory') {
      state.inventory.push({
        id: createId('inventory'),
        name: values.name,
        category: values.category,
        quantity: Number(values.quantity),
        price: Number(values.price),
        status: values.status,
      });
      saveStore();
    }

    closeModal();
  }

  root.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;

    // Close modal only when clicking directly on the overlay or on an element
    // explicitly marked with data-action="close-modal" (e.g. the close button).
    if (action === 'close-modal') {
      // If the element with the action is the overlay, ensure the click
      // target is the overlay itself (not a child inside the modal panel).
      if (actionEl.classList && actionEl.classList.contains('modal-overlay') && event.target !== actionEl) {
        return;
      }
      closeModal();
      return;
    }

    if (action === 'logout') {
      state.isAuthenticated = false;
      state.authError = '';
      state.currentUser = null;
      sessionStorage.removeItem(sessionKey);
      render();
      return;
    }

    if (action === 'switch-tab') {
      switchTab(actionEl.dataset.tab || 'dashboard');
      return;
    }

    if (action === 'open-modal') {
      const payload = { ...actionEl.dataset };
      delete payload.action;
      delete payload.modalType;
      openModal(actionEl.dataset.modalType || 'tutor', payload);
      return;
    }
  });

  root.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.dataset.action === 'search-patients') {
      state.searchTerm = target.value;
      render();
    }
  });

  root.addEventListener('submit', (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement) || !form.dataset.form) {
      return;
    }

    event.preventDefault();
    handleFormSubmit(form);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.modal) {
      closeModal();
    }
  });

  function renderModalAppointmentFields(context) {
    const pets = isTutor() ? getTutorPets() : state.pets;
    const petOptions = pets.map((pet) => ({
      value: pet.id,
      label: isTutor() ? pet.name : `${pet.name} · ${pet.species}`,
      selected: context.petId === pet.id,
    }));
    const veterinarianOptions = VETERINARIANS.map((veterinarian, index) => ({
      value: veterinarian,
      label: veterinarian,
      selected: context.veterinarian ? context.veterinarian === veterinarian : index === 0,
    }));

    if (!petOptions.length) {
      return '<div class="empty-state">No hay mascotas registradas para agendar una cita.</div>';
    }

    return `
      <div class="modal-context">Selecciona una mascota registrada para agendar la cita.</div>
      <div class="form-grid">
        ${renderSelectField('Mascota', 'petId', petOptions)}
        ${renderInputField('Fecha', 'date', 'date', '', '', true)}
        ${renderInputField('Hora', 'time', 'time', '', '', true)}
        ${renderInputField('Motivo', 'reason', 'text', '', 'Control general')}
        ${renderSelectField('Veterinario', 'veterinarian', veterinarianOptions)}
        ${isTutor() ? '' : renderSelectField('Estado', 'status', ['Confirmada', 'Pendiente'])}
      </div>
    `;
  }

  render();
}
