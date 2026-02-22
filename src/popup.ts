import './style.css';
import { addDial, getGroups, addGroup } from './api';

const btnAdd = document.getElementById('add-current') as HTMLButtonElement;
const select = document.getElementById('group-select') as HTMLSelectElement;
const newGroupNameInput = document.getElementById('new-group-name') as HTMLInputElement;
const titleInput = document.getElementById('dial-title') as HTMLInputElement;
const urlInput = document.getElementById('dial-url') as HTMLInputElement;
const statusMessage = document.getElementById('status-message') as HTMLDivElement;

const urlParams = new URLSearchParams(window.location.search);
const passedUrl = urlParams.get('url');
const passedTitle = urlParams.get('title');

async function init() {
    // Si la extension es abierta como ventana por el Context Menu, la URL trae parametros
    if (passedUrl && passedTitle) {
        titleInput.value = passedTitle;
        urlInput.value = passedUrl;
    } else {
        // Ejecución clásica vía clic en Action Bar de Extensiones
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.url && tab?.title) {
                titleInput.value = tab.title;
                urlInput.value = tab.url;
            }
        } catch (e) { console.error(e); }
    }

    await loadGroups();
}

async function loadGroups() {
    const groups = await getGroups();
    select.innerHTML = '';

    // Inyectar opción por defecto para crear
    const newGroupOpt = document.createElement('option');
    newGroupOpt.value = 'NEW_GROUP';
    newGroupOpt.textContent = '[+] Crear nuevo grupo...';
    select.appendChild(newGroupOpt);

    if (groups.length > 0) {
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.title;
            select.appendChild(opt);
        });
        select.value = groups[0].id; // Autoseleccionar último/primer grupo activo mejoraría la UX
    } else {
        select.value = 'NEW_GROUP';
    }

    updateNewGroupInputVisibility();
}

function updateNewGroupInputVisibility() {
    if (select.value === 'NEW_GROUP') {
        newGroupNameInput.classList.remove('hidden');
        newGroupNameInput.focus();
    } else {
        newGroupNameInput.classList.add('hidden');
    }
}

select.addEventListener('change', updateNewGroupInputVisibility);

btnAdd.addEventListener('click', async () => {
    let groupId = select.value;
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();

    if (!title || !url) {
        showMessage('Título y URL son requeridos', true);
        return;
    }

    if (groupId === 'NEW_GROUP') {
        const newTitle = newGroupNameInput.value.trim();
        if (!newTitle) {
            showMessage('El nombre del grupo es requerido', true);
            return;
        }
        btnAdd.disabled = true;
        try {
            const newGroup = await addGroup(newTitle);
            groupId = newGroup.id;
        } catch (e) {
            showMessage('Error al crear grupo', true);
            btnAdd.disabled = false;
            return;
        }
    }

    btnAdd.disabled = true;
    try {
        await addDial({
            groupId: groupId,
            title: title,
            url: url
        });

        btnAdd.textContent = '¡Guardado!';
        btnAdd.style.backgroundColor = '#10b981';
        setTimeout(() => window.close(), 1000);
    } catch (e) {
        console.error(e);
        showMessage('Error al guardar', true);
        btnAdd.disabled = false;
    }
});

function showMessage(text: string, isError: boolean = false) {
    statusMessage.textContent = text;
    statusMessage.classList.remove('hidden');
    statusMessage.style.color = isError ? '#ef4444' : '#10b981';
    if (isError) {
        setTimeout(() => statusMessage.classList.add('hidden'), 3000);
    }
}

init();
