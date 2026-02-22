import './style.css';
import { getGroups, addGroup, updateGroup, removeGroup, getDialsByGroup, addDial, removeDial, updateDial, saveDials, importNativeBookmarksBulk, importHtmlBookmarks, getAllDials } from './api';
import type { Dial, Group } from './api';

let activeGroupId: string | null = null;
let editingDialId: string | null = null;
let editingGroupId: string | null = null;
let dragStartIndex: number | null = null;

// DOM Elements
const grid = document.getElementById('dial-grid') as HTMLElement;
const groupsContainer = document.getElementById('groups-container') as HTMLElement;

// Context Menu Elements (V19)
const customContextMenu = document.getElementById('custom-context-menu') as HTMLElement;
const ctxSortNameAsc = document.getElementById('ctx-sort-name-asc') as HTMLElement;
const ctxSortNameDesc = document.getElementById('ctx-sort-name-desc') as HTMLElement;
const ctxSortDateAsc = document.getElementById('ctx-sort-date-asc') as HTMLElement;
const ctxSortDateDesc = document.getElementById('ctx-sort-date-desc') as HTMLElement;

// Dials Modals
const modal = document.getElementById('modal') as HTMLElement;
const modalTitle = document.getElementById('modal-title') as HTMLElement;
const addBtn = document.getElementById('add-btn') as HTMLElement;
const closeBtn = document.getElementById('close-modal') as HTMLElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLElement;
const form = document.getElementById('dial-form') as HTMLFormElement;
const titleInput = document.getElementById('dial-title') as HTMLInputElement;
const urlInput = document.getElementById('dial-url') as HTMLInputElement;

// Group Modals
const groupModal = document.getElementById('group-modal') as HTMLElement;
const groupModalTitle = document.getElementById('group-modal-title') as HTMLElement;
const scrollUpBtn = document.getElementById('scroll-up-btn') as HTMLButtonElement;
const scrollDownBtn = document.getElementById('scroll-down-btn') as HTMLButtonElement;
const addGroupBtn = document.getElementById('add-group-btn') as HTMLButtonElement;
const closeGroupBtn = document.getElementById('close-group-modal') as HTMLElement;
const cancelGroupBtn = document.getElementById('cancel-group-btn') as HTMLElement;
const groupForm = document.getElementById('group-form') as HTMLFormElement;
const groupTitleInput = document.getElementById('group-title') as HTMLInputElement;

// Advanced Group Modal (Fase V14)
const advGroupModal = document.getElementById('advanced-group-modal') as HTMLElement;
const advGroupModalTitle = document.getElementById('advanced-group-modal-title') as HTMLElement;
const advGroupTitleInput = document.getElementById('adv-group-title-input') as HTMLInputElement;
const closeAdvGroupModalBtn = document.getElementById('close-advanced-group-modal') as HTMLElement;
const saveAdvGroupBtn = document.getElementById('adv-group-save-btn') as HTMLElement;
const discardAdvGroupBtn = document.getElementById('adv-group-discard-btn') as HTMLElement;
const advSidebarBtns = document.querySelectorAll('.adv-sidebar-btn');
const advTabContents = document.querySelectorAll('.adv-tab-content');

// Live preview controls
const advGroupColsVal = document.getElementById('adv-group-cols-val') as HTMLSpanElement;
const advGroupColsUp = document.getElementById('adv-group-cols-up') as HTMLButtonElement;
const advGroupColsDown = document.getElementById('adv-group-cols-down') as HTMLButtonElement;
const advGroupRowsVal = document.getElementById('adv-group-rows-val') as HTMLSpanElement;
const advGroupRowsUp = document.getElementById('adv-group-rows-up') as HTMLButtonElement;
const advGroupRowsDown = document.getElementById('adv-group-rows-down') as HTMLButtonElement;
const advLayoutDynamic = document.getElementById('adv-layout-dynamic') as HTMLInputElement;
const advLayoutList = document.getElementById('adv-layout-list') as HTMLInputElement;
const advLayoutGrid = document.getElementById('adv-layout-grid') as HTMLInputElement;

const advDynWUp = document.getElementById('adv-dyn-w-up') as HTMLButtonElement;
const advDynWDown = document.getElementById('adv-dyn-w-down') as HTMLButtonElement;
const advDynWVal = document.getElementById('adv-dyn-w-val') as HTMLInputElement;

const advDynHUp = document.getElementById('adv-dyn-h-up') as HTMLButtonElement;
const advDynHDown = document.getElementById('adv-dyn-h-down') as HTMLButtonElement;
const advDynHVal = document.getElementById('adv-dyn-h-val') as HTMLInputElement;

const addGroupTabBtn = document.getElementById('add-group-tab-btn') as HTMLButtonElement | null;
if (addGroupTabBtn) {
  addGroupTabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editingGroupId = null;
    groupModalTitle.textContent = 'Añadir Nuevo Grupo';
    groupTitleInput.value = '';
    groupModal.classList.remove('hidden');
    setTimeout(() => groupTitleInput.focus(), 50);
  });
}

const advListWUp = document.getElementById('adv-list-w-up') as HTMLButtonElement;
const advListWDown = document.getElementById('adv-list-w-down') as HTMLButtonElement;
const advListWVal = document.getElementById('adv-list-w-val') as HTMLInputElement;

const advListDirH = document.getElementById('adv-list-dir-h') as HTMLInputElement;
const advListDirV = document.getElementById('adv-list-dir-v') as HTMLInputElement;

const advGridFill = document.getElementById('adv-grid-fill') as HTMLInputElement;
const advGridCenter = document.getElementById('adv-grid-center') as HTMLInputElement;

const advGridAwUp = document.getElementById('adv-grid-aw-up') as HTMLButtonElement;
const advGridAwDown = document.getElementById('adv-grid-aw-down') as HTMLButtonElement;
const advGridAwVal = document.getElementById('adv-grid-aw-val') as HTMLInputElement;

const advGridAhUp = document.getElementById('adv-grid-ah-up') as HTMLButtonElement;
const advGridAhDown = document.getElementById('adv-grid-ah-down') as HTMLButtonElement;
const advGridAhVal = document.getElementById('adv-grid-ah-val') as HTMLInputElement;

// Advanced Modal - Apariencia
const advIconChoices = document.querySelectorAll('.adv-icon-choice');
const advTextColorEnable = document.getElementById('adv-text-color-enable') as HTMLInputElement;
const advTextColorHex = document.getElementById('adv-text-color-hex') as HTMLElement;
const advTextColorPicker = document.getElementById('adv-text-color-picker') as HTMLInputElement;

// Advanced Modal - Fondo
const advBgRadios = document.querySelectorAll('input[name="bg"]') as NodeListOf<HTMLInputElement>;
const advBgSolidBody = document.getElementById('adv-bg-solid-body') as HTMLElement;
const advBgSolidColor = document.getElementById('adv-bg-solid-color') as HTMLInputElement;
const advBgSolidHex = document.getElementById('adv-bg-solid-hex') as HTMLElement;

const advBgGradientBody = document.getElementById('adv-bg-gradient-body') as HTMLElement;
const advBgGradRadios = document.querySelectorAll('input[name="grad"]') as NodeListOf<HTMLInputElement>;
const advBgGradColor1 = document.getElementById('adv-bg-grad-color1') as HTMLInputElement;
const advBgGradHex1 = document.getElementById('adv-bg-grad-hex1') as HTMLElement;
const advBgGradColor2 = document.getElementById('adv-bg-grad-color2') as HTMLInputElement;
const advBgGradHex2 = document.getElementById('adv-bg-grad-hex2') as HTMLElement;


// Advanced Modal - Diapositivas
const advGapEnable = document.getElementById('adv-gap-enable') as HTMLInputElement;
const advGapRange = document.getElementById('adv-gap-range') as HTMLInputElement;
const advGapVal = document.getElementById('adv-gap-val') as HTMLElement;
const advOpenWindow = document.getElementById('adv-open-window') as HTMLInputElement;
const advOpenTab = document.getElementById('adv-open-tab') as HTMLInputElement;

// Advanced Modal - Configuración
const advSetDefault = document.getElementById('adv-set-default') as HTMLInputElement;
const advIsLocked = document.getElementById('adv-is-locked') as HTMLInputElement;
const advPasswordContainer = document.getElementById('adv-password-container') as HTMLElement;
const advGroupPassword = document.getElementById('adv-group-password') as HTMLInputElement;

// Advanced Modal Drag Logic
const advModalContent = document.getElementById('advanced-modal-content') as HTMLElement;
const advModalDragHandle = document.getElementById('advanced-modal-drag-handle') as HTMLElement;
let isDraggingAdvModal = false;
let advModalStartX = 0, advModalStartY = 0;
let advModalPosX = 0, advModalPosY = 0;

if (advModalDragHandle && advModalContent) {
  advModalDragHandle.addEventListener('mousedown', (e) => {
    isDraggingAdvModal = true;
    advModalDragHandle.style.cursor = 'grabbing';
    advModalStartX = e.clientX - advModalPosX;
    advModalStartY = e.clientY - advModalPosY;
    document.addEventListener('mousemove', onAdvModalDrag);
    document.addEventListener('mouseup', stopAdvModalDrag);
  });
}

function onAdvModalDrag(e: MouseEvent) {
  if (!isDraggingAdvModal) return;
  advModalPosX = e.clientX - advModalStartX;
  advModalPosY = e.clientY - advModalStartY;
  advModalContent.style.transform = `translate(${advModalPosX}px, ${advModalPosY}px)`;
}

function stopAdvModalDrag() {
  isDraggingAdvModal = false;
  if (advModalDragHandle) advModalDragHandle.style.cursor = 'grab';
  document.removeEventListener('mousemove', onAdvModalDrag);
  document.removeEventListener('mouseup', stopAdvModalDrag);
}

// Stats Modal
const statsModal = document.getElementById('stats-modal') as HTMLElement;
const closeStatsModalBtn = document.getElementById('close-stats-modal') as HTMLElement;
const statsTotalGroups = document.getElementById('stats-total-groups') as HTMLElement;
const statsTotalDials = document.getElementById('stats-total-dials') as HTMLElement;
const statsAvgDials = document.getElementById('stats-avg-dials') as HTMLElement;

// Errors Modal
const errorsModal = document.getElementById('errors-modal') as HTMLElement;
const closeErrorsModalBtn = document.getElementById('close-errors-modal') as HTMLElement;
const errorsLogArea = document.getElementById('errors-log-area') as HTMLTextAreaElement;
const clearErrorsBtn = document.getElementById('clear-errors-btn') as HTMLElement;

// Search Modal
const searchModal = document.getElementById('search-modal') as HTMLElement;
const closeSearchModalBtn = document.getElementById('close-search-modal') as HTMLElement;
const searchDialInput = document.getElementById('search-dial-input') as HTMLInputElement;
const searchResultsContainer = document.getElementById('search-results-container') as HTMLElement;

// Share Modal Advanced
const shareBottomBar = document.getElementById('share-bottom-bar') as HTMLElement;
const shareBottomSelectAllBtn = document.getElementById('share-bottom-select-all-btn') as HTMLElement;
const shareBottomCount = document.getElementById('share-bottom-count') as HTMLElement;
const shareBottomCancelBtn = document.getElementById('share-bottom-cancel-btn') as HTMLElement;
const shareBottomUpBtn = document.getElementById('share-bottom-up-btn') as HTMLElement;

const shareModalAdvanced = document.getElementById('share-modal-advanced') as HTMLElement;
const closeAdvancedShareModalBtn = document.getElementById('close-advanced-share-modal') as HTMLElement;
const btnBackToSelection = document.getElementById('btn-back-to-selection') as HTMLElement;
const shareModalCountText = document.getElementById('share-modal-count-text') as HTMLElement;
const shareModalSubtitleText = document.getElementById('share-modal-subtitle-text') as HTMLElement;
const shareSelectedList = document.getElementById('share-selected-list') as HTMLElement;
const shareTitleInput = document.getElementById('share-title-input') as HTMLInputElement;
const shareAdvancedCopyBtn = document.getElementById('share-advanced-copy-btn') as HTMLElement;
const shareAdvancedExportBtn = document.getElementById('share-advanced-export-btn') as HTMLElement;

// Share State
let isShareSelectionMode = false;
let shareSelectedDials = new Set<string>();

// Settings & Dropdown
const settingsSidebar = document.getElementById('settings-sidebar') as HTMLElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLElement;
const dropdownMenu = document.getElementById('dropdown-menu') as HTMLElement;
const closeSettingsBtn = document.getElementById('close-settings') as HTMLElement;
const toggleEditModeBtn = document.getElementById('toggle-edit-mode') as HTMLButtonElement;

// Import actions
const importNativeSidebarBtn = document.getElementById('settings-import-native-btn') as HTMLElement;
const importHtmlSidebarBtn = document.getElementById('settings-import-html-btn') as HTMLElement;
const importHtmlSidebarInput = document.getElementById('settings-import-html-input') as HTMLInputElement;

// Onboarding
const onboardingModal = document.getElementById('onboarding-modal') as HTMLElement;
const onboardingNativeBtn = document.getElementById('onboarding-native-btn') as HTMLElement;
const onboardingHtmlBtn = document.getElementById('onboarding-html-btn') as HTMLElement;
const onboardingHtmlInput = document.getElementById('onboarding-html-input') as HTMLInputElement;
const skipOnboardingBtn = document.getElementById('skip-onboarding-btn') as HTMLElement;

const gradients = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
];

function getGradientIndex(url: string) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) { hash = url.charCodeAt(i) + ((hash << 5) - hash); }
  return Math.abs(hash) % gradients.length;
}

function getFallbackText(title: string, url: string) {
  if (title) return title.charAt(0).toUpperCase();
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '').charAt(0).toUpperCase();
  } catch { return '?'; }
}

async function init() {
  const groups = await getGroups();

  // Vamos a usar una heuristica para ver si es la primera vez
  // Si solo hay 1 grupo y está vacio de marcadores...
  const dialsEnInicio = await getDialsByGroup(groups[0]?.id || '');

  if (groups.length === 1 && groups[0].title === 'Inicio' && dialsEnInicio.length === 0) {
    onboardingModal.classList.remove('hidden');
  }

  if (groups.length > 0) {
    const defaultGroup = groups.find(g => g.isDefault);
    if (defaultGroup) {
      activeGroupId = defaultGroup.id;
    } else {
      activeGroupId = groups[0].id;
    }
  }
  await renderGroups();
  if (activeGroupId) await renderDials();
}

// GROUPS RENDER LOGIC
function checkScrollButtons() {
  if (!scrollUpBtn || !scrollDownBtn || !groupsContainer) return;

  // Si hay overflow VERTICAL
  if (groupsContainer.scrollHeight > groupsContainer.clientHeight) {
    // Mostrar botones de navegación
    if (groupsContainer.scrollTop > 0) {
      scrollUpBtn.classList.remove('hidden');
    } else {
      scrollUpBtn.classList.add('hidden');
    }

    if (Math.ceil(groupsContainer.scrollTop + groupsContainer.clientHeight) >= groupsContainer.scrollHeight) {
      scrollDownBtn.classList.add('hidden');
    } else {
      scrollDownBtn.classList.remove('hidden');
    }
  } else {
    // Si todo cabe, ocultarlos
    scrollUpBtn.classList.add('hidden');
    scrollDownBtn.classList.add('hidden');
  }
}

async function renderGroups() {
  const groups = await getGroups();
  groupsContainer.innerHTML = '';

  if (groups.length > 0 && !activeGroupId) {
    activeGroupId = groups[0].id;
  }

  for (const group of groups) {
    const tab = document.createElement('div');
    const groupDials = await getDialsByGroup(group.id);
    let isFullySelected = false;

    if (isShareSelectionMode && groupDials.length > 0) {
      isFullySelected = groupDials.every(d => shareSelectedDials.has(d.id));
    }

    tab.className = `group-tab ${group.id === activeGroupId ? 'active' : ''} ${isFullySelected ? 'is-share-selected' : ''}`;

    // CSS in-line para color de texto si existe
    const textColorStyle = group.textColor ? `style="color: ${group.textColor} !important;"` : '';
    let iconHtml = group.groupIcon ? `<span style="margin-right: 6px; font-size: 1.1rem; line-height: 1;">${group.groupIcon}</span>` : '';

    // Iconos de Estado Visual (Locked y Default)
    if (group.isLocked) {
      iconHtml += `<svg style="margin-right: 4px; width: 14px; height: 14px; opacity: 0.7;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    }
    if (group.isDefault) {
      iconHtml += `<svg style="margin-right: 4px; width: 14px; height: 14px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }

    // UI del Tab
    tab.innerHTML = `
      <div class="group-share-check">
         <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="3" style="width:10px; height:10px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <span class="group-icon-container">${iconHtml}</span>
      <span class="group-title" ${textColorStyle}>${group.title.replace(/^[📁📂]\s*/, '').trim() || group.title}</span>
      <div class="group-tab-actions">
        <button class="btn-icon-small edit-group-btn" data-id="${group.id}" title="Editar Grupo">✏️</button>
        ${groups.length > 1 ? `<button class="btn-icon-small delete-group-btn" data-id="${group.id}" title="Eliminar Grupo">✖</button>` : ''}
      </div>
    `;

    // Click on tab to switch active group
    tab.addEventListener('click', async (e) => {
      // Toggle en Modo Compartir
      if (isShareSelectionMode) {
        e.preventDefault();
        e.stopPropagation();

        const allSelected = groupDials.length > 0 && groupDials.every(d => shareSelectedDials.has(d.id));

        if (allSelected) {
          groupDials.forEach(d => shareSelectedDials.delete(d.id));
          tab.classList.remove('is-share-selected');
        } else {
          groupDials.forEach(d => shareSelectedDials.add(d.id));
          tab.classList.add('is-share-selected');
        }

        updateShareBottomBar();
        if (activeGroupId === group.id) renderDials();
        return;
      }

      if ((e.target as HTMLElement).closest('.group-tab-actions')) return;

      if (group.isLocked && activeGroupId !== group.id) {
        const password = prompt('Este grupo está bloqueado. Introduce la contraseña para acceder:');
        const correctPassword = group.password || '0000';
        if (password !== correctPassword) {
          return;
        }
      }

      activeGroupId = group.id;
      await renderGroups();
      await renderDials();
    });

    const editBtn = tab.querySelector('.edit-group-btn');
    editBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (group.isLocked) {
        const password = prompt('Introduce la contraseña para editar este grupo bloqueado:');
        const correctPassword = group.password || '0000';
        if (password !== correctPassword) return;
      }
      openAdvancedGroupModal(group);
    });

    const delBtn = tab.querySelector('.delete-group-btn');
    delBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (group.isLocked) {
        const password = prompt('Introduce la contraseña para eliminar este grupo bloqueado:');
        const correctPassword = group.password || '0000';
        if (password !== correctPassword) return;
      }
      if (groups.length === 1) {
        alert('No puedes eliminar el único grupo que existe.');
        return;
      }
      if (confirm(`¿Estás seguro de eliminar el grupo "${group.title}" y todos sus marcadores?`)) {
        await removeGroup(group.id);
        if (activeGroupId === group.id) activeGroupId = null; // Reset if deleted
        await renderGroups();
        if (activeGroupId) await renderDials();
        else { grid.innerHTML = ''; }
      }
    });

    groupsContainer.appendChild(tab);
  }

  setTimeout(checkScrollButtons, 50);
}

// Timestamp global que se inyecta para forzar refresh de los marcadores "todos"
let globalFaviconCacheTimestamp: string = '';

async function renderDials() {
  if (!activeGroupId) return;
  const dials = await getDialsByGroup(activeGroupId);
  grid.innerHTML = '';

  const groups = await getGroups();
  const currentGroup = groups.find(g => g.id === activeGroupId);
  if (currentGroup) {
    grid.classList.remove('layout-list');
    if (currentGroup.layoutType === 'dynamic') {
      const w = currentGroup.dynamicWidth || 240;
      const h = currentGroup.dynamicHeight || 180;
      grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${w}px, 1fr))`;
      grid.style.setProperty('--dial-height', `${h}px`);
      grid.style.setProperty('--dial-aspect-ratio', 'auto');
    } else if (currentGroup.layoutType === 'list') {
      grid.classList.add('layout-list');
      if (currentGroup.listDirection === 'horizontal') {
        const w = currentGroup.listWidth || 240;
        grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${w}px, 1fr))`;
        grid.style.maxWidth = 'none';
      } else {
        grid.style.gridTemplateColumns = `1fr`;
        grid.style.maxWidth = `${currentGroup.listWidth || 800}px`;
      }
      grid.style.margin = '0 auto';
      grid.style.setProperty('--dial-height', 'auto');
      grid.style.setProperty('--dial-aspect-ratio', 'auto');
    } else {
      // grid o no layoutType
      grid.style.margin = '0';
      grid.style.maxWidth = 'none';
      const cols = currentGroup.columns || 4;
      grid.style.gridTemplateColumns = `repeat(${cols}, minmax(10px, 1fr))`;

      const aw = currentGroup.gridAspectWidth || 16;
      const ah = currentGroup.gridAspectHeight || 12;
      grid.style.setProperty('--dial-height', 'auto');
      grid.style.setProperty('--dial-aspect-ratio', `${aw} / ${ah}`);
    }
  }

  dials.forEach((dial, index) => {
    const card = document.createElement('div');
    const isSelected = shareSelectedDials.has(dial.id);
    card.className = `dial-card glass-panel ${isSelected ? 'is-share-selected' : ''}`;
    card.draggable = !isShareSelectionMode; // Disable drag if share mode
    card.dataset.id = dial.id;
    card.dataset.index = index.toString();

    // Lógica normal de Click (o selección de compartir)
    card.addEventListener('click', async (e) => {
      if (isEditMode) return;
      if (isShareSelectionMode) {
        e.preventDefault();
        e.stopPropagation();
        if (shareSelectedDials.has(dial.id)) {
          shareSelectedDials.delete(dial.id);
          card.classList.remove('is-share-selected');
        } else {
          shareSelectedDials.add(dial.id);
          card.classList.add('is-share-selected');
        }
        updateShareBottomBar();
        return;
      }

      if ((e.target as HTMLElement).closest('.dial-actions')) return;

      e.preventDefault();

      const groups = await getGroups();
      const groupData = groups.find(g => g.id === dial.groupId);

      if (groupData?.openInNewWindow) {
        if (typeof chrome !== 'undefined' && chrome.windows) {
          chrome.windows.create({ url: dial.url });
        } else {
          window.open(dial.url, '_blank', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes');
        }
      } else if (groupData?.openInNewTab || e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(dial.url, '_blank');
      } else {
        window.location.href = dial.url;
      }
    });

    // Inyectamos un timestamp para ignorar caché si se requiere
    const cacheBuster = globalFaviconCacheTimestamp ? `&t=${globalFaviconCacheTimestamp}` : '';
    const faviconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(dial.url)}&size=128${cacheBuster}`;
    const fallbackLetter = getFallbackText(dial.title, dial.url);
    const gradient = gradients[getGradientIndex(dial.url)];

    card.innerHTML = `
      <div class="share-check-badge">
         <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div class="dial-thumbnail">
        <div class="dial-logo-fallback" style="background: ${gradient}; position: absolute; inset:0; border-radius: 0; width: 100%; height: 100%;">
           ${fallbackLetter}
        </div>
        <img src="${faviconUrl}" alt="${dial.title}" class="dial-icon-img" style="position:relative; z-index:1; width: 64px; height: 64px; border-radius: 16px; object-fit: contain; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); background: white; padding: 4px;">
      </div>
      <div class="dial-footer">
        <h3 class="dial-title" title="${dial.title}">${dial.title}</h3>
        ${!currentGroup?.isLocked ? `
        <div class="dial-actions">
          <button class="dial-action-btn edit-btn" title="Editar">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="dial-action-btn delete-btn" title="Eliminar">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>` : ''}
      </div>
    `;

    // Evitamos CSP script-src-attr error escuchando dinámicamente
    const imgElement = card.querySelector('.dial-icon-img') as HTMLImageElement;
    if (imgElement) {
      imgElement.addEventListener('error', () => {
        imgElement.style.display = 'none';
      });
    }


    // Drag events
    card.addEventListener('dragstart', (e) => {
      if (currentGroup?.isLocked) {
        e.preventDefault();
        return;
      }
      dragStartIndex = index;
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });

    card.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dropIndex = index;
      if (dragStartIndex !== null && dragStartIndex !== dropIndex && activeGroupId) {
        const allDials = await getDialsByGroup(activeGroupId);
        const [movedDial] = allDials.splice(dragStartIndex, 1);
        allDials.splice(dropIndex, 0, movedDial);
        allDials.forEach((d, i) => d.order = i); // Actualizar order
        await saveDials(allDials); // Disclaimer: En un flujo ideal saveDials guardaría TODOS los dials reconstruyendo, en api.ts add/up/rm asumen full array, pero getDialsByGroup es un subconjunto, necesitamos refactor save local/global.
        // Cuidado: el saveDials en este caso sobreescribira TODOS los demás dials de otros grupos en el storage si no lo corregimos. 
        // Solución rapida segura: En lugar de usar saveDials sobre el subconjunto, recargamos y usamos un helper bulk
        // Lo resolvemos haciendo un update 1 a 1 de orders, o implementando bulkUpdate:
        // Por simplicidad en este prototipo, iteramos y actualizamnos
        for (const dial of allDials) {
          await updateDial(dial.id, { order: dial.order });
        }
        await renderDials();
      }
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      dragStartIndex = null;
    });

    card.querySelector('.edit-btn')?.addEventListener('click', () => openModal(dial));
    card.querySelector('.delete-btn')?.addEventListener('click', async () => {
      if (confirm(`¿Eliminar "${dial.title}"?`)) {
        await removeDial(dial.id);
        await renderDials();
      }
    });

    grid.appendChild(card);
  });

  // Fase V16: Inyectar Tarjeta Fija "+" al final del grid para creación rápida
  if (!isShareSelectionMode && !currentGroup?.isLocked) {
    const addCard = document.createElement('div');
    addCard.className = 'dial-card add-dial-card';
    addCard.title = 'Añadir Nuevo Marcador';
    // Estilos inline para no perturbar demasiado style.css
    addCard.style.display = 'flex';
    addCard.style.alignItems = 'center';
    addCard.style.justifyContent = 'center';
    addCard.style.cursor = 'pointer';
    addCard.style.background = 'rgba(255, 255, 255, 0.03)';
    addCard.style.border = '2px dashed rgba(255, 255, 255, 0.2)';
    addCard.style.minHeight = '140px';
    addCard.style.transition = 'all 0.3s ease';

    addCard.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; opacity: 0.5; stroke: white;">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;

    addCard.addEventListener('click', () => {
      openModal();
    });

    addCard.addEventListener('mouseenter', () => {
      addCard.style.background = 'rgba(255, 255, 255, 0.08)';
      addCard.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    });

    addCard.addEventListener('mouseleave', () => {
      addCard.style.background = 'rgba(255, 255, 255, 0.03)';
      addCard.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    grid.appendChild(addCard);
  }
}


// DIALS MODAL LOGIC
async function openModal(dial?: Dial) {
  if (!activeGroupId) { alert('Selecciona un grupo primero.'); return; }
  const groups = await getGroups();
  const currentGroup = groups.find(g => g.id === activeGroupId);
  if (currentGroup?.isLocked) { alert('Este grupo está bloqueado. Desbloquéalo para añadir o editar marcadores.'); return; }

  modal.classList.remove('hidden');
  if (dial) {
    editingDialId = dial.id;
    modalTitle.textContent = 'Editar Marcador';
    titleInput.value = dial.title;
    urlInput.value = dial.url;
  } else {
    editingDialId = null;
    modalTitle.textContent = 'Añadir Marcador';
    form.reset();
  }
}

function closeModal() { modal.classList.add('hidden'); form.reset(); editingDialId = null; }

addBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeGroupId) return;
  const title = titleInput.value.trim();
  let urlStr = urlInput.value.trim();
  if (!title || !urlStr) return;
  if (!/^https?:\/\//i.test(urlStr)) urlStr = 'https://' + urlStr;

  if (editingDialId) await updateDial(editingDialId, { title, url: urlStr });
  else await addDial({ groupId: activeGroupId, title, url: urlStr });

  closeModal();
  await renderDials();
});


// GROUPS MODAL LOGIC (Simple / Add)
function openGroupModal(group?: Group) {
  groupModal.classList.remove('hidden');
  if (group) {
    editingGroupId = group.id;
    groupModalTitle.textContent = 'Editar Grupo';
    groupTitleInput.value = group.title;
  } else {
    editingGroupId = null;
    groupModalTitle.textContent = 'Añadir Grupo';
    groupForm.reset();
  }
}

function closeGroupModal() { groupModal.classList.add('hidden'); groupForm.reset(); editingGroupId = null; }

addGroupBtn.addEventListener('click', () => openGroupModal());
closeGroupBtn.addEventListener('click', closeGroupModal);
cancelGroupBtn.addEventListener('click', closeGroupModal);
groupModal.addEventListener('click', (e) => { if (e.target === groupModal) closeGroupModal(); });

groupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = groupTitleInput.value.trim();
  if (!title) return;

  if (editingGroupId) {
    await updateGroup(editingGroupId, { title });
  } else {
    const newGroup = await addGroup(title);
    activeGroupId = newGroup.id;
  }

  closeGroupModal();
  await renderGroups();
  await renderDials();
});

let tempGroupSettings: Partial<Group> = {};

function applyLivePreview() {
  const dialGrid = document.getElementById('dial-grid');
  if (!dialGrid) return;
  dialGrid.classList.remove('layout-list');
  if (tempGroupSettings.layoutType === 'dynamic') {
    const w = tempGroupSettings.dynamicWidth || 240;
    const h = tempGroupSettings.dynamicHeight || 180;
    dialGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${w}px, 1fr))`;
    dialGrid.style.margin = '0';
    dialGrid.style.maxWidth = 'none';
    dialGrid.style.setProperty('--dial-height', `${h}px`);
    dialGrid.style.setProperty('--dial-aspect-ratio', 'auto');
  } else if (tempGroupSettings.layoutType === 'list') {
    dialGrid.classList.add('layout-list');
    if (tempGroupSettings.listDirection === 'horizontal') {
      const w = tempGroupSettings.listWidth || 240;
      dialGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${w}px, 1fr))`;
      dialGrid.style.maxWidth = 'none';
    } else {
      dialGrid.style.gridTemplateColumns = `1fr`;
      dialGrid.style.maxWidth = `${tempGroupSettings.listWidth || 800}px`;
    }
    dialGrid.style.margin = '0 auto';
    dialGrid.style.setProperty('--dial-height', 'auto');
    dialGrid.style.setProperty('--dial-aspect-ratio', 'auto');
  } else {
    dialGrid.style.margin = '0';
    dialGrid.style.maxWidth = 'none';
    const cols = tempGroupSettings.columns || 4;
    dialGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(10px, 1fr))`;

    const aw = tempGroupSettings.gridAspectWidth || 16;
    const ah = tempGroupSettings.gridAspectHeight || 12;
    dialGrid.style.setProperty('--dial-height', 'auto');
    dialGrid.style.setProperty('--dial-aspect-ratio', `${aw} / ${ah}`);
  }

  // Preview Diapositivas Gap
  if (tempGroupSettings.gapSize !== undefined) {
    dialGrid.style.gap = `${tempGroupSettings.gapSize}px`;
  } else {
    // defaults from CSS
    if (tempGroupSettings.layoutType === 'list' && tempGroupSettings.listDirection === 'vertical') {
      dialGrid.style.gap = '8px';
    } else {
      dialGrid.style.gap = '15px';
    }
  }

  // Preview Appearance
  if (tempGroupSettings.textColor) {
    dialGrid.style.color = tempGroupSettings.textColor;
  } else {
    dialGrid.style.color = '';
  }

  // Preview Group Tab (Live Feedback)
  const activeTab = document.querySelector(`.group-tab[data-id="${editingGroupId}"]`);
  if (activeTab) {
    let iconHtml = tempGroupSettings.groupIcon ? `<span style="margin-right: 6px; font-size: 1.1rem; line-height: 1;">${tempGroupSettings.groupIcon}</span>` : '';
    if (tempGroupSettings.isLocked) {
      iconHtml += `<svg style="margin-right: 4px; width: 14px; height: 14px; opacity: 0.7;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    }
    if (tempGroupSettings.isDefault) {
      iconHtml += `<svg style="margin-right: 4px; width: 14px; height: 14px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }

    const iconContainer = activeTab.querySelector('.group-icon-container');
    if (iconContainer) {
      iconContainer.innerHTML = iconHtml;
    }

    const titleContainer = activeTab.querySelector('.group-title') as HTMLElement;
    if (titleContainer) {
      titleContainer.textContent = (tempGroupSettings.title || '').replace(/^[📁📂]\s*/, '').trim() || tempGroupSettings.title || '';
      titleContainer.style.color = tempGroupSettings.textColor || '';
    }
  }

  // Preview Background
  applyGroupBackground(tempGroupSettings);
}

function applyGroupBackground(group: Partial<Group>) {
  // Solo aplicamos al body. El "bgOnlyTitle" se manejara despues.
  const bgType = group.bgType || 'none';
  if (bgType === 'none') {
    document.body.style.background = '';
  } else if (bgType === 'solid') {
    document.body.style.background = group.bgColor1 || '#28005f';
  } else if (bgType === 'gradient') {
    const type = group.bgGradientType === 'linear' ? 'linear-gradient' : 'radial-gradient';
    const prefix = group.bgGradientType === 'linear' ? '135deg' : (group.bgGradientType === 'radial-circle' ? 'circle at center' : 'ellipse at center');
    const c1 = group.bgColor1 || '#3b82f6';
    const c2 = group.bgColor2 || '#0f172a';
    document.body.style.background = `${type}(${prefix}, ${c1}, ${c2})`;
  } else {
    document.body.style.background = ''; // default fallback
  }
}

// ADVANCED GROUP MODAL LOGIC (Fase V14)
function renderBgAccordions(bgType: string) {
  if (advBgSolidBody) {
    advBgSolidBody.style.display = bgType === 'solid' ? 'flex' : 'none';
    if (bgType === 'solid') advBgSolidBody.classList.remove('hidden');
  }
  if (advBgGradientBody) {
    advBgGradientBody.style.display = bgType === 'gradient' ? 'flex' : 'none';
    if (bgType === 'gradient') advBgGradientBody.classList.remove('hidden');
  }
}

function openAdvancedGroupModal(group: Group) {
  editingGroupId = group.id;

  const safeTitle = group.title.replace(/^[📁📂]\s*/, '').trim() || group.title;
  advGroupModalTitle.textContent = `Editar grupo: "${safeTitle}"`;
  advGroupTitleInput.value = safeTitle;

  tempGroupSettings = { ...group, title: safeTitle };
  advGroupColsVal.textContent = (tempGroupSettings.columns || 4).toString();
  advGroupRowsVal.textContent = (tempGroupSettings.rows || 5).toString();

  // Populate new inputs
  if (advDynWVal) advDynWVal.value = (tempGroupSettings.dynamicWidth || 240).toString();
  if (advDynHVal) advDynHVal.value = (tempGroupSettings.dynamicHeight || 180).toString();
  if (advListWVal) advListWVal.value = (tempGroupSettings.listWidth || 240).toString();
  if (advGridFill) advGridFill.checked = tempGroupSettings.gridFill !== false;
  if (advGridCenter) advGridCenter.checked = tempGroupSettings.gridCenterSlides || false;
  if (advGridAwVal) advGridAwVal.value = (tempGroupSettings.gridAspectWidth || 16).toString();
  if (advGridAhVal) advGridAhVal.value = (tempGroupSettings.gridAspectHeight || 12).toString();

  if (tempGroupSettings.layoutType === 'dynamic') {
    if (advLayoutDynamic) advLayoutDynamic.checked = true;
  } else if (tempGroupSettings.layoutType === 'list') {
    if (advLayoutList) advLayoutList.checked = true;
  } else {
    if (advLayoutGrid) advLayoutGrid.checked = true;
  }

  // Populate Apariencia
  if (advIconChoices && advIconChoices.length > 0) {
    advIconChoices.forEach(ic => ic.classList.remove('active'));
    if (tempGroupSettings.groupIcon) {
      const curIcon = document.querySelector(`.adv-icon-choice[data-icon="${tempGroupSettings.groupIcon}"]`);
      if (curIcon) curIcon.classList.add('active');
    } else {
      advIconChoices[0].classList.add('active'); // default cross
    }
  }

  if (advTextColorEnable && advTextColorPicker && advTextColorHex) {
    if (tempGroupSettings.textColor) {
      advTextColorEnable.checked = true;
      advTextColorPicker.value = tempGroupSettings.textColor;
      advTextColorHex.textContent = tempGroupSettings.textColor.toUpperCase();
    } else {
      advTextColorEnable.checked = false;
      advTextColorPicker.value = '#ffffff';
      advTextColorHex.textContent = '#FFFFFF';
    }
  }

  // Populate Fondo
  const bgType = tempGroupSettings.bgType || 'none';
  const gradType = tempGroupSettings.bgGradientType || 'radial-ellipse';

  advBgRadios.forEach(radio => {
    if (radio.value === bgType) radio.checked = true;
  });
  advBgGradRadios.forEach(radio => {
    if (radio.value === gradType) radio.checked = true;
  });

  if (advBgSolidColor && advBgSolidHex) {
    advBgSolidColor.value = tempGroupSettings.bgColor1 || '#28005f';
    advBgSolidHex.textContent = (tempGroupSettings.bgColor1 || '#28005f').toUpperCase();
  }
  if (advBgGradColor1 && advBgGradHex1 && advBgGradColor2 && advBgGradHex2) {
    advBgGradColor1.value = tempGroupSettings.bgColor1 || '#3b82f6';
    advBgGradHex1.textContent = (tempGroupSettings.bgColor1 || '#3b82f6').toUpperCase();
    advBgGradColor2.value = tempGroupSettings.bgColor2 || '#0f172a';
    advBgGradHex2.textContent = (tempGroupSettings.bgColor2 || '#0f172a').toUpperCase();
  }

  // Render Accordions de Fondo
  renderBgAccordions(bgType);

  // Populate Diapositivas
  if (advGapEnable && advGapRange && advGapVal) {
    if (tempGroupSettings.gapSize !== undefined) {
      advGapEnable.checked = true;
      advGapRange.value = tempGroupSettings.gapSize.toString();
      advGapVal.textContent = tempGroupSettings.gapSize + 'px';
    } else {
      advGapEnable.checked = false;
      advGapRange.value = '20';
      advGapVal.textContent = '20px';
    }
  }

  if (advOpenWindow) advOpenWindow.checked = tempGroupSettings.openInNewWindow || false;
  if (advOpenTab) advOpenTab.checked = tempGroupSettings.openInNewTab || false;

  // Populate Configuración
  if (advSetDefault) advSetDefault.checked = tempGroupSettings.isDefault || false;
  if (advIsLocked) advIsLocked.checked = tempGroupSettings.isLocked || false;

  if (advPasswordContainer && advGroupPassword) {
    if (advIsLocked.checked) {
      advPasswordContainer.style.display = 'block';
      advGroupPassword.value = tempGroupSettings.password || '';
    } else {
      advPasswordContainer.style.display = 'none';
      advGroupPassword.value = '';
    }
  }

  // reset tabs to first
  advSidebarBtns.forEach(b => b.classList.remove('active'));
  advTabContents.forEach(c => c.classList.add('hidden'));
  advSidebarBtns[0].classList.add('active');
  document.getElementById('tab-general')?.classList.remove('hidden');

  // reset drag position
  advModalPosX = 0;
  advModalPosY = 0;
  if (advModalContent) advModalContent.style.transform = `translate(0px, 0px)`;

  // Aplicar preview inicial
  applyLivePreview();

  advGroupModal.classList.remove('hidden');
}

// Live Preview Events
if (advGroupColsUp) {
  advGroupColsUp.addEventListener('click', () => {
    let c = parseInt(advGroupColsVal.textContent || '4');
    c = Math.min(12, c + 1);
    advGroupColsVal.textContent = c.toString();
    tempGroupSettings.columns = c;
    applyLivePreview();
  });
}
if (advGroupColsDown) {
  advGroupColsDown.addEventListener('click', () => {
    let c = parseInt(advGroupColsVal.textContent || '4');
    c = Math.max(1, c - 1);
    advGroupColsVal.textContent = c.toString();
    tempGroupSettings.columns = c;
    applyLivePreview();
  });
}
if (advGroupRowsUp) {
  advGroupRowsUp.addEventListener('click', () => {
    let r = parseInt(advGroupRowsVal.textContent || '5');
    r = Math.min(20, r + 1);
    advGroupRowsVal.textContent = r.toString();
    tempGroupSettings.rows = r;
  });
}
if (advGroupRowsDown) {
  advGroupRowsDown.addEventListener('click', () => {
    let r = parseInt(advGroupRowsVal.textContent || '5');
    r = Math.max(1, r - 1);
    advGroupRowsVal.textContent = r.toString();
    tempGroupSettings.rows = r;
  });
}

const updateLayout = () => {
  if (advLayoutDynamic?.checked) tempGroupSettings.layoutType = 'dynamic';
  else if (advLayoutList?.checked) tempGroupSettings.layoutType = 'list';
  else if (advLayoutGrid?.checked) tempGroupSettings.layoutType = 'grid';
  applyLivePreview();
};

const updateListDir = () => {
  if (advListDirH?.checked) tempGroupSettings.listDirection = 'horizontal';
  else if (advListDirV?.checked) tempGroupSettings.listDirection = 'vertical';
  applyLivePreview();
};

advLayoutDynamic?.addEventListener('change', updateLayout);
advLayoutList?.addEventListener('change', updateLayout);
advLayoutGrid?.addEventListener('change', updateLayout);

advListDirH?.addEventListener('change', updateListDir);
advListDirV?.addEventListener('change', updateListDir);

// Generic number input binding
const setupNumberInput = (input: HTMLInputElement, btnUp: HTMLButtonElement, btnDown: HTMLButtonElement, field: keyof Group, min: number, max: number, step: number = 10) => {
  if (!input || !btnUp || !btnDown) return;
  const updateVal = (newVal: number) => {
    newVal = Math.max(min, Math.min(max, newVal));
    input.value = newVal.toString();
    (tempGroupSettings as any)[field] = newVal;
    applyLivePreview();
  };
  btnUp.addEventListener('click', (e) => { e.preventDefault(); updateVal(parseInt(input.value || '0') + step); });
  btnDown.addEventListener('click', (e) => { e.preventDefault(); updateVal(parseInt(input.value || '0') - step); });
  input.addEventListener('input', () => {
    let val = parseInt(input.value);
    if (!isNaN(val)) {
      (tempGroupSettings as any)[field] = val;
      applyLivePreview();
    }
  });
};

setupNumberInput(advDynWVal, advDynWUp, advDynWDown, 'dynamicWidth', 50, 1000);
setupNumberInput(advDynHVal, advDynHUp, advDynHDown, 'dynamicHeight', 50, 1000);
setupNumberInput(advListWVal, advListWUp, advListWDown, 'listWidth', 50, 1000);

setupNumberInput(advGridAwVal, advGridAwUp, advGridAwDown, 'gridAspectWidth', 1, 100, 1);
setupNumberInput(advGridAhVal, advGridAhUp, advGridAhDown, 'gridAspectHeight', 1, 100, 1);

if (advGridFill) advGridFill.addEventListener('change', () => { tempGroupSettings.gridFill = advGridFill.checked; applyLivePreview(); });
if (advGridCenter) advGridCenter.addEventListener('change', () => { tempGroupSettings.gridCenterSlides = advGridCenter.checked; applyLivePreview(); });

// Live Preview Events - Apariencia
const advIconGridElement = document.getElementById('adv-icon-grid');
if (advIconGridElement) {
  advIconGridElement.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('adv-icon-choice')) {
      const allChoices = advIconGridElement.querySelectorAll('.adv-icon-choice');
      allChoices.forEach(i => i.classList.remove('active'));
      target.classList.add('active');
      const iconBase = target.getAttribute('data-icon');
      if (iconBase && iconBase !== '✖') {
        tempGroupSettings.groupIcon = iconBase;
      } else {
        tempGroupSettings.groupIcon = undefined;
      }
      applyLivePreview();
    }
  });
}

if (advTextColorEnable) {
  advTextColorEnable.addEventListener('change', () => {
    if (advTextColorEnable.checked) {
      tempGroupSettings.textColor = advTextColorPicker.value;
      advTextColorHex.textContent = advTextColorPicker.value.toUpperCase();
    } else {
      tempGroupSettings.textColor = undefined;
      advTextColorHex.textContent = '#FFFFFF';
    }
    applyLivePreview();
  });
}

if (advTextColorPicker) {
  advTextColorPicker.addEventListener('input', () => {
    advTextColorHex.textContent = advTextColorPicker.value.toUpperCase();
    if (advTextColorEnable.checked) {
      tempGroupSettings.textColor = advTextColorPicker.value;
      applyLivePreview();
    }
  });
}

// Live Preview Events - Fondo
advBgRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      tempGroupSettings.bgType = radio.value as any;
      renderBgAccordions(radio.value);
      applyLivePreview();
    }
  });
});

advBgGradRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      tempGroupSettings.bgGradientType = radio.value as any;
      applyLivePreview();
    }
  });
});

if (advBgSolidColor) advBgSolidColor.addEventListener('input', () => {
  advBgSolidHex.textContent = advBgSolidColor.value.toUpperCase();
  tempGroupSettings.bgColor1 = advBgSolidColor.value;
  if (tempGroupSettings.bgType === 'solid') applyLivePreview();
});

if (advBgGradColor1) advBgGradColor1.addEventListener('input', () => {
  advBgGradHex1.textContent = advBgGradColor1.value.toUpperCase();
  tempGroupSettings.bgColor1 = advBgGradColor1.value;
  if (tempGroupSettings.bgType === 'gradient') applyLivePreview();
});

if (advBgGradColor2) advBgGradColor2.addEventListener('input', () => {
  advBgGradHex2.textContent = advBgGradColor2.value.toUpperCase();
  tempGroupSettings.bgColor2 = advBgGradColor2.value;
  if (tempGroupSettings.bgType === 'gradient') applyLivePreview();
});



// Live Preview Events - Diapositivas
if (advGapEnable) advGapEnable.addEventListener('change', () => {
  if (advGapEnable.checked) {
    tempGroupSettings.gapSize = parseInt(advGapRange.value, 10);
  } else {
    tempGroupSettings.gapSize = undefined;
  }
  applyLivePreview();
});

if (advGapRange) advGapRange.addEventListener('input', () => {
  advGapVal.textContent = advGapRange.value + 'px';
  if (advGapEnable.checked) {
    tempGroupSettings.gapSize = parseInt(advGapRange.value, 10);
    applyLivePreview();
  }
});


if (advOpenWindow) advOpenWindow.addEventListener('change', () => { tempGroupSettings.openInNewWindow = advOpenWindow.checked; });
if (advOpenTab) advOpenTab.addEventListener('change', () => { tempGroupSettings.openInNewTab = advOpenTab.checked; });

// Modal Events - Configuración
if (advSetDefault) advSetDefault.addEventListener('change', () => { tempGroupSettings.isDefault = advSetDefault.checked; });
if (advIsLocked) {
  advIsLocked.addEventListener('change', () => {
    tempGroupSettings.isLocked = advIsLocked.checked;
    if (advPasswordContainer) {
      if (advIsLocked.checked) {
        advPasswordContainer.style.display = 'block';
      } else {
        advPasswordContainer.style.display = 'none';
        advGroupPassword.value = '';
        tempGroupSettings.password = undefined;
      }
    }
  });
}
if (advGroupPassword) {
  advGroupPassword.addEventListener('input', () => {
    tempGroupSettings.password = advGroupPassword.value;
  });
}

function closeAdvancedGroupModal() {
  advGroupModal.classList.add('hidden');
  editingGroupId = null;
  // Revert preview to actual group saved state
  getGroups().then(groups => {
    const cur = groups.find(x => x.id === activeGroupId);
    if (cur) {
      tempGroupSettings = { ...cur };
      applyLivePreview();
    }
  });
}

closeAdvGroupModalBtn.addEventListener('click', closeAdvancedGroupModal);
discardAdvGroupBtn.addEventListener('click', closeAdvancedGroupModal);
advGroupModal.addEventListener('click', (e) => {
  if (e.target === advGroupModal) closeAdvancedGroupModal();
});

// Tab switching
advSidebarBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // untoggle all
    advSidebarBtns.forEach(b => b.classList.remove('active'));
    advTabContents.forEach(c => c.classList.add('hidden'));

    // toggle clicked
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    if (tabId) document.getElementById(tabId)?.classList.remove('hidden');
  });
});

// Save changes
saveAdvGroupBtn.addEventListener('click', async () => {
  if (!editingGroupId) return;
  const newTitle = advGroupTitleInput.value.trim();
  if (newTitle) {
    tempGroupSettings.title = newTitle;
    await updateGroup(editingGroupId, tempGroupSettings);
    await renderGroups();
    await renderDials();
  }
  closeAdvancedGroupModal();
});

// SETTINGS LOGIC
let isEditMode = false;

function toggleSettings() {
  settingsSidebar.classList.toggle('hidden');
}

function updateEditModeUI() {
  if (isEditMode) {
    document.body.classList.add('edit-mode');
    toggleEditModeBtn.textContent = '✅ Desactivar Modo Edición';
    toggleEditModeBtn.style.background = '#10b981'; // Tailwind Emerald
  } else {
    document.body.classList.remove('edit-mode');
    toggleEditModeBtn.textContent = '🛠️ Activar Modo Edición';
    toggleEditModeBtn.style.background = '';
  }
}

chrome.storage.local.get(['isEditMode'], (result) => {
  isEditMode = !!result.isEditMode;
  updateEditModeUI();
});

toggleEditModeBtn.addEventListener('click', () => {
  isEditMode = !isEditMode;
  chrome.storage.local.set({ isEditMode: isEditMode });
  updateEditModeUI();
});

// Dropdown Menu Logic
settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  const target = e.target as Node;
  if (!dropdownMenu.contains(target) && target !== settingsBtn) {
    dropdownMenu.classList.add('hidden');
    // Si se cierra el menu principal, nos aseguramos de cerrar los secundarios
    document.getElementById('menu-update-thumbnails-container')?.classList.remove('active');
    document.getElementById('menu-advanced-container')?.classList.remove('active');
  }
});

const updateThumbnailsContainer = document.getElementById('menu-update-thumbnails-container');
const updateThumbnailsBtn = document.getElementById('menu-update-thumbnails');
const advancedContainer = document.getElementById('menu-advanced-container');
const advancedBtn = document.getElementById('menu-advanced');

if (updateThumbnailsBtn && updateThumbnailsContainer) {
  updateThumbnailsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evitamos que cierre el menú padre
    // Cerramos el de Avanzado si estuviese abierto
    advancedContainer?.classList.remove('active');
    updateThumbnailsContainer.classList.toggle('active');
  });
}

if (advancedBtn && advancedContainer) {
  advancedBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evitamos que cierre el menú padre
    // Cerramos el de Miniaturas si estuviese abierto
    updateThumbnailsContainer?.classList.remove('active');
    advancedContainer.classList.toggle('active');
  });
}

// Help File Action (Fase V20)
const menuHelp = document.getElementById('menu-help');
if (menuHelp) {
  menuHelp.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.add('hidden');
    // Para funcionar tanto offline como en un entorno de extensión:
    chrome.tabs.create({ url: chrome.runtime.getURL('Help.md') });
  });
}

// Omitimos el alert del boton principal de hover
// document.getElementById('menu-update-thumbnails')?.addEventListener('click', () => { ... });

document.getElementById('sub-update-group')?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  document.getElementById('menu-update-thumbnails-container')?.classList.remove('active');

  // Encontrar todas las imágenes de este grupo y forzar nueva URL
  const images = document.querySelectorAll('.dial-icon-img') as NodeListOf<HTMLImageElement>;
  const timestamp = Date.now();
  images.forEach(img => {
    // Limpiamos parámetros `&t=` anteriores si existen
    const baseUrl = img.src.split('&t=')[0];
    img.src = `${baseUrl}&t=${timestamp}`;
    img.style.display = 'block'; // Aseguramos que se vuelva a mostrar si estaba oculta
  });
});

document.getElementById('sub-update-missing')?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  document.getElementById('menu-update-thumbnails-container')?.classList.remove('active');

  // Solo buscamos las que están ocultas por el `onerror`
  const images = document.querySelectorAll('.dial-icon-img') as NodeListOf<HTMLImageElement>;
  const timestamp = Date.now();
  let count = 0;

  images.forEach(img => {
    if (img.style.display === 'none') {
      const baseUrl = img.src.split('&t=')[0];
      img.src = `${baseUrl}&t=${timestamp}`;
      img.style.display = 'block'; // Reintentar visualización
      count++;
    }
  });

  if (count === 0) {
    alert("Todas las miniaturas de este grupo están correctamente cargadas.");
  }
});

document.getElementById('sub-update-all')?.addEventListener('click', async (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  document.getElementById('menu-update-thumbnails-container')?.classList.remove('active');

  // Forzar un refresh limpio completo en toda la app asignando un timestamp global
  globalFaviconCacheTimestamp = Date.now().toString();
  await renderDials();
});
document.getElementById('sub-show-errors')?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  advancedContainer?.classList.remove('active');
  showErrorsModal();
});

document.getElementById('sub-show-stats')?.addEventListener('click', async (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  advancedContainer?.classList.remove('active');
  await showStatsModal();
});

async function showStatsModal() {
  const groups = await getGroups();
  const allDials = await getAllDials();

  statsTotalGroups.textContent = groups.length.toString();
  statsTotalDials.textContent = allDials.length.toString();

  const avg = groups.length > 0 ? (allDials.length / groups.length).toFixed(1) : '0.0';
  statsAvgDials.textContent = avg;

  statsModal.classList.remove('hidden');
}

function showErrorsModal() {
  errorsModal.classList.remove('hidden');
}

function hideStatsModal() {
  statsModal.classList.add('hidden');
}

function hideErrorsModal() {
  errorsModal.classList.add('hidden');
}

closeStatsModalBtn.addEventListener('click', hideStatsModal);
statsModal.addEventListener('click', (e) => {
  if (e.target === statsModal) hideStatsModal();
});

closeErrorsModalBtn.addEventListener('click', hideErrorsModal);
errorsModal.addEventListener('click', (e) => {
  if (e.target === errorsModal) hideErrorsModal();
});

clearErrorsBtn.addEventListener('click', () => {
  errorsLogArea.value = '';
  alert('Se ha vaciado el Log de incidentes de esta sesión.');
});

// Busca Marcadores Logic
function showSearchModal() {
  searchModal.classList.remove('hidden');
  searchDialInput.value = '';
  searchResultsContainer.innerHTML = '';
  searchDialInput.focus();
}

function hideSearchModal() {
  searchModal.classList.add('hidden');
}

document.getElementById('menu-search-dial')?.addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  showSearchModal();
});

closeSearchModalBtn.addEventListener('click', hideSearchModal);
searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) hideSearchModal();
});

// Atajo Teclado Buscar
document.addEventListener('keydown', (e) => {
  // Ctrl + Shift + F (o Cmd en mac)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyF') {
    e.preventDefault();
    if (searchModal.classList.contains('hidden')) {
      showSearchModal();
    } else {
      hideSearchModal();
    }
  }

  if (e.key === 'Escape') {
    if (!searchModal.classList.contains('hidden')) hideSearchModal();
  }
});

// Listener Motor Búsqueda
searchDialInput.addEventListener('input', async (e) => {
  const term = (e.target as HTMLInputElement).value.toLowerCase().trim();
  searchResultsContainer.innerHTML = '';

  if (term.length < 1) return;

  const allDials = await getAllDials();

  // Limitar resultados a max 15
  const matches = allDials.filter(d =>
    d.title.toLowerCase().includes(term) || d.url.toLowerCase().includes(term)
  ).slice(0, 15);

  if (matches.length === 0) {
    searchResultsContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary); text-align: center;">No se encontraron resultados.</div>';
    return;
  }

  matches.forEach(dial => {
    const anchor = document.createElement('a');
    anchor.href = dial.url;
    anchor.className = 'search-result-item';
    // Funcionalidad extra: cerrar el modal tras click en caso de que quede "background" de la extensión
    anchor.addEventListener('click', () => hideSearchModal());

    const img = document.createElement('img');
    img.className = 'search-result-favicon';
    img.src = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(dial.url)}&size=32`;

    // Fallback text avatar (simplificado para los div)
    img.onerror = () => {
      img.style.display = 'none';
    };

    const info = document.createElement('div');
    info.className = 'search-result-info';

    const t = document.createElement('span');
    t.className = 'search-result-title';
    t.textContent = dial.title;

    const u = document.createElement('span');
    u.className = 'search-result-url';
    u.textContent = dial.url;

    info.appendChild(t);
    info.appendChild(u);
    anchor.appendChild(img);
    anchor.appendChild(info);

    searchResultsContainer.appendChild(anchor);
  });
});


document.getElementById('menu-options')?.addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  toggleSettings();
});

document.getElementById('menu-select-dials')?.addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  alert("Función 'Seleccionar diapositivas' en desarrollo...");
});

/* =========================================================
   FASE V13: COMPARTIR DIAPOSITIVAS (MODO SELECCIÓN)
========================================================= */

function updateShareBottomBar() {
  const count = shareSelectedDials.size;
  // TODO: optimizar contando grupos unicos o solo mostrando el dial en cuestion
  shareBottomCount.textContent = `Seleccionado: ${count} diapositivas`;
  shareModalCountText.textContent = `Seleccionado: ${count}`;
  shareModalSubtitleText.textContent = `${count} diapositivas preparadas`;
}

async function renderAdvancedShareModalList() {
  if (shareSelectedDials.size === 0) {
    shareSelectedList.innerHTML = '<div style="color:var(--text-secondary); text-align:center;">No has seleccionado ninguna diapositiva.</div>';
    return;
  }

  const allDials = await getAllDials();
  const allGroups = await getGroups();
  const selectedDials = allDials.filter(d => shareSelectedDials.has(d.id));

  // Agrupar visualmente por grupo original
  const byGroup: Record<string, typeof selectedDials> = {};
  selectedDials.forEach(d => {
    if (!byGroup[d.groupId]) byGroup[d.groupId] = [];
    byGroup[d.groupId].push(d);
  });

  shareSelectedList.innerHTML = '';

  for (const [groupId, dials] of Object.entries(byGroup)) {
    const gMatch = allGroups.find(g => g.id === groupId);
    const title = gMatch ? gMatch.title : 'Grupo Desconocido';

    const gHeader = document.createElement('div');
    gHeader.className = 'share-group-header';
    gHeader.innerHTML = `
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
         ${title}:
      `;
    shareSelectedList.appendChild(gHeader);

    dials.forEach(d => {
      const row = document.createElement('div');
      row.className = 'share-item-row';

      const faviconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(d.url)}&size=32`;
      row.innerHTML = `
            <img src="${faviconUrl}" class="share-item-favicon" onerror="this.style.display='none'">
            <div class="share-item-title">${d.title} - <span style="color:var(--text-secondary)">${d.url}</span></div>
         `;
      shareSelectedList.appendChild(row);
    });
  }
}

function startShareSelectionMode() {
  isShareSelectionMode = true;
  shareSelectedDials.clear();
  document.body.classList.add('share-mode-active');
  shareBottomBar.classList.remove('hidden');
  setTimeout(() => shareBottomBar.classList.add('active'), 10);
  updateShareBottomBar();
  renderGroups(); // Volvemos a renderizar los checks de grupo
  renderDials(); // Volvemos a pintar para aplicar isShareSelectionMode (anular drags y mostrar ui)
}

function cancelShareSelectionMode() {
  isShareSelectionMode = false;
  shareSelectedDials.clear();
  document.body.classList.remove('share-mode-active');
  shareBottomBar.classList.remove('active');
  setTimeout(() => shareBottomBar.classList.add('hidden'), 300);
  shareModalAdvanced.classList.add('hidden');
  renderGroups();
  renderDials();
}

function showAdvancedShareModal() {
  shareBottomBar.classList.remove('active');
  shareModalAdvanced.classList.remove('hidden');
  renderAdvancedShareModalList();
}

function backToSelectionBottomBar() {
  shareModalAdvanced.classList.add('hidden');
  shareBottomBar.classList.add('active');
}

// Event Listeners (UI Flow)
document.getElementById('menu-edit-group')?.addEventListener('click', async (e) => {
  e.stopPropagation();
  dropdownMenu.classList.add('hidden');
  const groups = await getGroups();
  const currentGroup = groups.find(g => g.id === activeGroupId);
  if (currentGroup) {
    openAdvancedGroupModal(currentGroup);
  } else {
    alert("Prueba seleccionando un grupo válido en las pestañas superiores primero.");
  }
});

document.getElementById('menu-share-dials')?.addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  startShareSelectionMode();
});

shareBottomSelectAllBtn.addEventListener('click', async () => {
  const allDials = await getAllDials();
  const isAllSelected = allDials.length > 0 && shareSelectedDials.size === allDials.length;

  if (isAllSelected) {
    shareSelectedDials.clear();
  } else {
    allDials.forEach(d => shareSelectedDials.add(d.id));
  }

  updateShareBottomBar();
  renderGroups();
  renderDials();
});

shareBottomCancelBtn.addEventListener('click', cancelShareSelectionMode);
shareBottomUpBtn.addEventListener('click', showAdvancedShareModal);
closeAdvancedShareModalBtn.addEventListener('click', cancelShareSelectionMode);
btnBackToSelection.addEventListener('click', backToSelectionBottomBar);
shareModalAdvanced.addEventListener('click', (e) => {
  if (e.target === shareModalAdvanced) backToSelectionBottomBar();
});

// Exporters
shareAdvancedCopyBtn.addEventListener('click', async () => {
  if (shareSelectedDials.size === 0) {
    alert("No has seleccionado ningún marcador.");
    return;
  }
  const allDials = await getAllDials();
  const d = allDials.filter(dial => shareSelectedDials.has(dial.id));

  const title = shareTitleInput.value || 'Mis Marcadores';
  const textContent = `${title}:\n\n` + d.map(x => `${x.title} - ${x.url}`).join('\n');
  try {
    await navigator.clipboard.writeText(textContent);
    alert('¡Marcadores copiados al portapapeles!');
    cancelShareSelectionMode();
  } catch (err) {
    console.error('Error al copiar: ', err);
    alert('Error al copiar al portapapeles. Revisa los permisos de tu navegador.');
  }
});

shareAdvancedExportBtn.addEventListener('click', async () => {
  if (shareSelectedDials.size === 0) {
    alert("No has seleccionado ningún marcador.");
    return;
  }

  const allDials = await getAllDials();
  const d = allDials.filter(dial => shareSelectedDials.has(dial.id));
  const groupName = shareTitleInput.value || 'Compartidos';

  let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${groupName}</H3>
    <DL><p>\n`;

  d.forEach(x => {
    htmlContent += `        <DT><A HREF="${x.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}">${x.title}</A>\n`;
  });

  htmlContent += `    </DL><p>\n</DL><p>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const cleanName = groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `bookmarks_${cleanName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  cancelShareSelectionMode();
});

// Sidebar Close Event
closeSettingsBtn.addEventListener('click', toggleSettings);
settingsSidebar.addEventListener('click', (e) => {
  if (e.target === settingsSidebar) toggleSettings();
});

// INIT IMPORT ACTIONS
async function handleNativeImport() {
  const btn1 = importNativeSidebarBtn;
  const btn2 = onboardingNativeBtn;
  btn1.textContent = 'Importando...';
  btn2.textContent = 'Importando...';
  try {
    const count = await importNativeBookmarksBulk();
    alert(`¡Importación completada! Se han importado ${count} marcadores nativos.`);
    onboardingModal.classList.add('hidden');
    toggleSettings(); // Cierra o no importa, init() recargará igual.
    window.location.reload(); // Recarga limpia
  } catch (err) {
    console.error(err);
    alert('Error al importar marcadores nativos.');
    btn1.textContent = '🦊 Importar del Navegador';
    btn2.textContent = '🦊 Importar Marcadores del Navegador';
  }
}

async function handleHtmlImport(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const text = ev.target?.result as string;
    try {
      const count = await importHtmlBookmarks(text);
      alert(`¡Éxito! Se han importado ${count} marcadores correctamente.`);
      onboardingModal.classList.add('hidden');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar el archivo HTML.');
    }
  };
  reader.readAsText(file);
}

// Vinculando Sidebars & Modals
importNativeSidebarBtn.addEventListener('click', handleNativeImport);
onboardingNativeBtn.addEventListener('click', handleNativeImport);

importHtmlSidebarBtn.addEventListener('click', () => importHtmlSidebarInput.click());
importHtmlSidebarInput.addEventListener('change', handleHtmlImport);

onboardingHtmlBtn.addEventListener('click', () => onboardingHtmlInput.click());
onboardingHtmlInput.addEventListener('change', handleHtmlImport);

skipOnboardingBtn.addEventListener('click', () => {
  onboardingModal.classList.add('hidden');
});

// SCROLL EVENTS
if (scrollUpBtn && scrollDownBtn && groupsContainer) {
  const getScrollAmount = () => {
    // La altura visible máxima de una fila configurada en CSS es de 38px
    // Usar la visibilidad actual prevendrá desplazamientos exagerados
    return groupsContainer.clientHeight > 0 ? groupsContainer.clientHeight : 38;
  };

  scrollUpBtn.addEventListener('click', () => {
    groupsContainer.scrollBy({ top: -getScrollAmount(), behavior: 'smooth' });
  });

  scrollDownBtn.addEventListener('click', () => {
    groupsContainer.scrollBy({ top: getScrollAmount(), behavior: 'smooth' });
  });

  groupsContainer.addEventListener('scroll', checkScrollButtons);
  window.addEventListener('resize', checkScrollButtons);

  groupsContainer.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      // Multiplicar el tamaño de la fila por la dirección asegura pasos exactos de 1 fila
      groupsContainer.scrollBy({ top: getScrollAmount() * direction, behavior: 'auto' });
    }
  });
}

// Fase V19: Menú Contextual Custom y Ordenación
document.addEventListener('contextmenu', (e) => {
  const target = e.target as HTMLElement;
  const isGridContent = grid.contains(target) || target === grid;
  // Solo se muestra si clickeamos derecho en la zona de dials teniendo un grupo activo cerrado
  if (isGridContent && activeGroupId) {
    e.preventDefault();
    customContextMenu.style.display = 'block';

    // Calcular posiciones evitando salirse de pantalla
    const rect = customContextMenu.getBoundingClientRect();
    const menuWidth = rect.width || 240;
    const menuHeight = rect.height || 180;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight;

    customContextMenu.style.left = `${x}px`;
    customContextMenu.style.top = `${y}px`;
  } else {
    customContextMenu.style.display = 'none';
  }
});

document.addEventListener('click', () => {
  if (customContextMenu && customContextMenu.style.display === 'block') {
    customContextMenu.style.display = 'none';
  }
});

async function sortDialsCtx(comparator: (a: Dial, b: Dial) => number) {
  if (!activeGroupId) return;
  const allDials = await getAllDials();
  const groupDials = allDials.filter(d => d.groupId === activeGroupId);

  // Ordenar el array en su propia copia contextual
  groupDials.sort(comparator);

  // Reasignar la variable order basada en la ordenación devuelta del DOM
  groupDials.forEach((d, index) => {
    d.order = index;
  });

  // Mezclar lo guardado:
  const idsInGroup = new Set(groupDials.map(d => d.id));
  const newFullDials = allDials.filter(d => !idsInGroup.has(d.id)).concat(groupDials);

  await saveDials(newFullDials);
  customContextMenu.style.display = 'none';
  await renderDials();
}

ctxSortNameAsc?.addEventListener('click', () => {
  sortDialsCtx((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
});

ctxSortNameDesc?.addEventListener('click', () => {
  sortDialsCtx((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
});

ctxSortDateAsc?.addEventListener('click', () => {
  // Los Ids son Date.now(), por lo que pueden parsearse para antigüedad
  sortDialsCtx((a, b) => parseInt(a.id) - parseInt(b.id)); // Mas Viejos
});

ctxSortDateDesc?.addEventListener('click', () => {
  sortDialsCtx((a, b) => parseInt(b.id) - parseInt(a.id)); // Mas Nuevos
});

// Init
init();
