# Plan de Implementación: Fase V3 - Arquitectura Multi-Grupo y Ajustes

El objetivo es transformar el actual listado plano de marcadores (Speed Dial) en un verdadero **Group Speed Dial**, donde existan carpetas/grupos y los marcadores se almacenen dentro de estos. Además, añadiremos un **Menú Global de Ajustes**.

## Proposed Changes

### 1. `src/api.ts` (Capa de Datos)
Modificar el esquema de almacenamiento para soportar grupos.
*   **[MODIFY]** `src/api.ts`
    *   Añadir interfaz `Group` (`id`, `title`, `order`).
    *   Modificar interfaz `Dial` para añadir `groupId`.
    *   Renombrar/crear funciones CRUD para `Groups`: `getGroups`, `addGroup`, `updateGroup`, `removeGroup`.
    *   Actualizar funciones CRUD de `Dials` para aceptar y filtrar por `groupId`.
    *   Manejar la eliminación en cascada (al borrar un grupo, borrar sus dials).
    *   Añadir lógica inicial para crear un grupo "General" por defecto si no existe ninguno.

### 2. `index.html` & `src/style.css` (Esqueleto UI)
Refactorizar el layout para acomodar la navegación por grupos y el botón de ajustes.
*   **[MODIFY]** `index.html`
    *   Añadir una barra de navegación (Tabs o Sidebar) para listar los grupos en el HTML.
    *   Añadir botones para "Nuevo Grupo" y "Ajustes".
    *   Modificar los modales existentes para soportar el formulario de creación de Grupo (separado del de Dial).
    *   Añadir el esqueleto (HTML) de un modal o sidebar para el Menú de Ajustes.
*   **[MODIFY]** `src/style.css`
    *   Estilos para las pestañas/sidebar de grupos (Glassmorphism integrado).
    *   Estado "Activo" de los grupos.
    *   Estilos para el Menú de Ajustes global.

### 3. `src/main.ts` (Lógica UI)
Conectar la UI con la nueva API basada en grupos.
*   **[MODIFY]** `src/main.ts`
    *   Estado global: Mantener el ID del grupo actualmente seleccionado.
    *   `renderGroups()`: Renderizar la barra de navegación de grupos. Al hacer click, cambiar el grupo activo y llamar a `renderDials()`.
    *   `renderDials()`: Mostrar solo los marcadores que pertenezcan al grupo activo.
    *   Lógica para los nuevos modales: "Añadir Grupo", "Editar Grupo".
    *   Lógica de Drag & Drop actualizada para funcionar en el contexto de grupos (y mover/reordenar grupos en sí si es posible en su barra).
    *   Abrir/Cerrar menú de Settings.

### 4. `popup.html` & `src/popup.ts` (Inyección Rápida)
*   **[MODIFY]** `popup.html` y `src/popup.ts`
    *   Añadir un selector (dropdown - `<select>`) para elegir en qué grupo se quiere guardar la pestaña activa.

## Verification Plan

### Automated Tests
*   Ejecutar `npm run build` para asegurar que el código en Vanilla TS y la refactorización profunda no produzcan errores de transpilación.
*   Las pruebas estáticas (Typescript compiler) funcionarán como primera línea de validación para las interfaces `Group` y `Dial`.

### Manual Verification
1.  **Carga del complemento**: Cargar la carpeta `dist` en Firefox o Chrome/Edge.
2.  **Validar Estado Inicial**: Verificar que se auto-genera un grupo "Por defecto" y el panel de Speed Dial está vacío pero funcional.
3.  **Probar CRUD de Grupos**: 
    - Crear 2 o más grupos (ej. "Trabajo", "Ocio").
    - Navegar entre ellos sin problemas.
    - Editar un grupo.
    - Eliminar un grupo (y comprobar que sus marcadores anidados se borran).
4.  **Probar CRUD de Marcadores en Contexto**: 
    - Estando en "Trabajo", añadir "GitHub".
    - Estando en "Ocio", añadir "YouTube".
    - Verificar que al cambiar de pestaña los marcadores se aíslen correctamente por grupo.
5.  **Probar Popup Contextual**: Abrir cualquier web, dar clic al ícono de la extensión, elegir "Trabajo" en el menú desplegable y guardar. Verificar en la pestaña *New Tab*.

## Fase V7: Menú de Acciones (Dropdown)

### Cambios HTML (`index.html`)
- Cambiar el SVG del `settings-btn` a un icono de hamburguesa (tres líneas).
- Envolver el botón en un `.dropdown-wrapper`.
- Crear el interior `.dropdown-menu` en orden alfabético, cada botón con `.dropdown-item` e iconos azules.

### Cambios CSS (`src/style.css`)
- Estilizar el wrapper y el posicionamiento absoluto del dropdown (`top: 100%; right: 0;`).
- Fondos oscuros `rgba(25, 30, 40, 0.95)` y separadores `border-bottom: 1px solid rgba(255, 255, 255, 0.05)`.

### Cambios JS (`src/main.ts`)
- Controlar apertura y cierre del menú al clicar el botón o fuera de él.
- Relacionar `menu-opciones` para que dispare `toggleSettings()`.
- Relacionar `menu-editar-grupo` para que dispare `openGroupModal()` para el grupo activo (si hay).
## Fase V8: Submenú "Actualizar Miniaturas"

El usuario requiere que la opción de "Actualizar miniaturas" despliegue sub-opciones anidadas de forma contextual o en un Tooltip flotante al mantener el ratón encima o hacer click.

## Fase V17: Menú Contextual para Añadir Marcador
Para cumplir el nuevo requisito del usuario ("Añadir página desde menú contextual (click derecho)"):

### Cambios Arquitectónicos
1. **`manifest.json`**: Añadir permiso de `"contextMenus"`.
2. **`src/background.ts`**:
   - `chrome.contextMenus.create` al inicializar la extensión.
   - `chrome.contextMenus.onClicked.addListener` para atrapar el clic derecho.
   - Usar `chrome.windows.create` para abrir una ventana tipo popup pasando la URL y el Título como query parameters (`popup.html?url=...&title=...`).
3. **`popup.html`**:
   - Refactorizar UI para mostrar `inputs` de título y enlace.
   - Añadir al desplegable la opción "`[+] Crear nuevo grupo...`".
   - Añadir un `<input>` condicional para el título de este nuevo grupo.
4. **`src/popup.ts`**:
   - Capturar los parámetros de URL si existen, o inyectar los datos del tab activo mediante `chrome.tabs.query` si se abrió en el action.
   - Lógica del `<select>`: Mostrar el input de grupo si el value es de creación.
   - En el `submit`, si se eligió nuevo grupo, llamar primero a `addGroup()`, esperar la respuesta y pasar ese ID a `addDial()`.

### Cambios HTML (`index.html`)
- Convertir `.dropdown-item#menu-update-thumbnails` en un contenedor relativo (`.has-submenu`).
- Añadir dentro un `div.submenu-panel` que contenga las 3 sub-opciones:
    1. Actualizar todas las diapositivas en grupo
    2. Todas las que falten (después de la sincronización)
    3. Todos los grupos de diapositivas

## Fase V18: Gestión de Contraseña para Grupos Bloqueados

Para permitir que cada grupo tenga su propia contraseña o gestionar una contraseña maestra:

### 1. `src/api.ts` (Datos)
*   Añadir la propiedad opcional `password?: string` a la interfaz `Group`.

### 2. `index.html` (Vista)
*   En la pestaña "Configuración" del Modal Avanzado de Grupos (`#tab-configuracion`), añadir un contenedor para la contraseña justo debajo del checkbox `#adv-is-locked`.
*   El contenedor tendrá un input de tipo texto/password para establecer la contraseña.

### 3. `src/main.ts` (Controlador)
*   Modificar `openAdvancedGroupModal` para cargar la contraseña guardada (o vacía por defecto) en el nuevo input.
*   Añadir listener para mostrar/ocultar el input de contraseña dependiendo de si el checkbox `#adv-is-locked` está marcado o no.
*   En el evento de guardado (`saveAdvGroupBtn`), asegurar que `tempGroupSettings.password` se recupere del input.
*   Actualizar los `prompt` de verificación (al hacer clic en tab, editar y eliminar) para que comprueben la contraseña contra `group.password` (ofreciendo fallback a `'0000'` si por alguna razón antigua está bloqueado pero sin contraseña).

## Fase V19: Menú Contextual de Organización de Diales

Se creará un menú contextual nativo en la app que reescriba el menú de sistema/navegador cuando hagamos clic derecho ("contextmenu") en un grupo de dials, permitiendo reordenar automáticamente.

### 1. `index.html` (Vista)
*   **[MODIFY]** `index.html`
    * Añadir un `div` con id `custom-context-menu` al final del body (o cerca).
    * El menú contendrá elementos (ul/li o `div.context-item`) para las 4 opciones de ordenación: "Por nombre (A-Z)", "Por nombre (Z-A)", "Por antigüedad (Más recientes primero)", "Por antigüedad (Más antiguos primero)".

### 2. `src/style.css` (Estilos)
*   **[MODIFY]** `src/style.css`
    * Estilizar `#custom-context-menu` con `position: absolute`, `z-index: 1000`, diseño premium (glassmorphism/translucido) similar al menú dropdown de `.dropdown-menu`.
    * Mantener el hover interactivo color azulado.

### 3. `src/main.ts` (Eventos y Lógica)
*   **[MODIFY]** `src/main.ts`
    * Añadir un *Event Listener* global para reaccionar al `contextmenu` y prevenir la acción por defecto (`e.preventDefault()`). Si se lanza en las tarjetas (`.dial-grid`), tabs de grupos (`.groups-nav` o `.group-tab`), u otra zona contextual válida, se visualizará el `custom-context-menu`.
    * Posicionar el menú usando `e.clientX` y `e.clientY`, limitando el ancho contra el `window.innerWidth`.
    * Añadir *Event Listener* al click (`click`) sobre el `document` entero para esconder el modal custom contextual si pinchamos fuera.
    * Al accionar cada botón del contextual, recolectar la lista completa de `dials` pertenecientes al `activeGroupId`.
    * Ordenar los `dials` modificando el array resultante usando `array.sort()`.  
        - *Nombre (A-Z, Z-A)* usando el valor de `dial.title.toLowerCase()`.  
        - *Fecha* parseando `dial.id` directamente como Entero (nuestros ids son timestamps que guardan la fecha de creación en milisegundos).  
    * Reasignar los índices de la propiedad `dial.order` de 0 hasta la longitud - 1 para consolidar su nuevo puesto y utilizar nuestra API `saveDials(...)` o `updateDial(...)` masiva, y re-llamar `renderDials()`.
- Añadir pequeñas flechas (chevrons) o tooltips que simulen la captura.

### Cambios CSS (`src/style.css`)
- Estilizar el `submenu-panel` para que aparezca a la izquierda o derecha del menú principal (comportamiento de dropdown anidado o expandible hacia abajo).
- Mantener la estética `glassmorphism`, fondo `rgba(25, 30, 40, 0.95)` y separar las opciones con bordes suaves.

### Cambios JS (`src/main.ts` y APIs)
1. Conectar las opciones del submenú a funciones Javascript (aun si son mockups temporalmente).
2. Lógica para *hover* o *click* que revele el submenú de forma elegante y se oculte cuando pase a otra opción o cierre el dropdown global.

## Fase V9: Lógica Actualizar Miniaturas

El usuario requiere que las tres opciones de "Actualizar miniaturas" sean funcionales. Dado que estamos usando el servicio de favicon de Google (`t0.gstatic.com/faviconV2`), las imágenes dependen en gran medida de la caché del navegador. Para "actualizarlas", forzaremos al navegador a volver a descargar la imagen inyectando un parámetro único (`timestamp`) a la URL renderizada.

### 1. Actualizar todas las diapositivas en grupo
Esta opción iterará sobre cada elemento `.dial-card` visible en el grupo actual seleccionado y mutará el atributo `src` de su imagen `.dial-icon-img` agregando un `&t=Date.now()`.

### 2. Todas las que falten (después de la sincronización)
Dado que añadimos un *event listener* `onerror` que oculta (`display: none`) las imágenes que fallan al cargar (las que "faltan"), esta opción buscará únicamente los `.dial-card` cuya imagen tenga `display: none`. Eliminará ese estilo y reinyectará la URL con un timestamp actualizado, además de intentar obtenerlas desde una URL alternativa de favicon para maximizar el éxito.

### 3. Todos los grupos de diapositivas
Al igual que la opción 1, pero requerirá despachar una re-renderización a nivel global (`renderDials`) aplicando un flag temporal o actualizando un timestamp maestro global en la sesión actual que se añada siempre a la construcción de favicons.

## Fase V10: Submenú "Avanzado"

Siguiendo el flujo de los submenús, la opción "Avanzado" también debe contar con su propio `.submenu-panel` desplegable o flotante. 

### Cambios HTML (`index.html`)
- Convertir el botón `#menu-advanced` en un contenedor anidado similar a "Actualizar miniaturas", envolviéndolo en un `.dropdown-item.has-submenu`.
- Añadir el chevron derecho (ícono de flecha) para indicar que es un menú expandible, tal como se muestra en la captura de referencia.
- Incluir un `.submenu-panel` interior con dos botones:
  1. `Mostrar registro de errores...` (con su icono correspondiente).
  2. `Estadísticas` (con su icono de gráfico).

### Cambios CSS (`src/style.css`)
- Reutilizaremos las clases existentes (`.has-submenu`, `.submenu-panel`, `.submenu-item`) que garantizan la posición a la derecha o izquierda y el diseño glassmorphism.
- Asegurarse de que los iconos en los submenús hereden el mismo color azul u opacidad que los elementos padre.

### Cambios JS (`src/main.ts`)
- Configurar el *Event Listener* de clic sobre `#menu-advanced` para que haga `toggle` de la clase `.active`, mostrando el submenú en pantallas e interacciones con ratón.
- Conectar internamente las dos nuevas opciones (`Mostrar registro de errores...` y `Estadísticas`) a un `alert` temporal mientras se decide cómo y dónde renderizar estos datos en el futuro.

## Fase V11: Funcionalidad de Errores y Estadísticas

Para dotar de utilidad a las opciones del menú "Avanzado", crearemos modales nativos informativos integrados en la estética de la extensión.

### 1. Estadísticas
-   **Interfaz** (`index.html`): Crear un nuevo modal `#stats-modal` que contenga una cuadrícula informativa.
-   **Lógica** (`src/main.ts`): Al pulsar en "Estadísticas", se calcularán en tiempo real los datos recopilados iterando sobre las estructuras Storage:
    -   Número total de **Grupos** creados.
    -   Número total de **Marcadores/Diapositivas** sumados entre todos los grupos.
    -   Promedio de marcadores por grupo y/u otras métricas derivadas.

### 2. Mostrar registro de errores...
Dado que es una extensión local y no cuenta con un servidor backend, es prudente tener un visor de excepciones o validaciones fallidas.
-   **Interfaz** (`index.html`): Crear un nuevo modal `#errors-modal` con una lista o área de texto tipo terminal que liste incidencias.
-   **Lógica** (`src/api.ts` y `main.ts`): 
    -   Se implementará un estado base para mostrar "No se han registrado errores.".
    -   Este modal servirá como esqueleto para en el futuro poder volcar ahí capturas asíncronas originadas en el catch de promesas fallidas o importaciones erróneas.

## Fase V12: Buscar Diapositiva

La opción para "Buscar diapositiva" permite al usuario encontrar rápidamente entre todos los grupos un marcador y navegar hacia él de inmediato.

### Interfaz UI (`index.html`, `style.css`)
-   Implementar un nuevo modal flotante `.modal` llamado `#search-modal`.
-   Contendrá un input superior, espacioso y prominente, `.search-input`.
-   Añadir un contenedor `.search-results` donde inyectaremos divs `.search-result-item` con la concordancia (con estilo hover y flexbox).

### Lógica (`src/main.ts`)
1.  **Apertura**: El modal se abrirá tanto por evento `.addEventListener('click')` en `#menu-search-dial` como escuchando el atajo global de teclado (`keydown`) para `Ctrl + Shift + F` y `Command + Shift + F`.
2.  **Motor de Búsqueda**: Escucharemos el evento `input` del campo de búsqueda:
    -   Lanzaremos una query a `getAllDials()`. (Idealmente con debounce o de inmediato porque el storage es local ultrarrápido).
    -   Filtraremos por `dial.title.toLowerCase().includes(term)` o por `url`.
    -   Renderiremos las coincidencias limitando los resultados para no sobrecargar el modal visualmente.
3.  **Redirección**: Al hacer clic en un `.search-result-item` se cerrará el modal y se redirigirá con `window.location.href` hacia la URL seleccionada.

## Fase V13: Compartir Diapositivas (Avanzado)

Permitirá al usuario extraer fácilmente su colección de marcadores a través de un **Modo de Selección** guiado e interactivo con una interfaz calcada a la original de la extensión.

### Interfaz UI (`index.html`)
1.  **Barra Inferior de Selección (`#share-bottom-bar`)**:
    -   Un banner oscuro anclado abajo con el texto: `Compartir diapositivas` y `Seleccionado: X diapositivas / Y grupos`.
    -   A su derecha, un botón/icono "Chevron-Up" que abre un Modal superior con los detalles elegidos.
2.  **Modal Previo a Compartir (`#share-modal-advanced`)**:
    -   Título: "Compartir diapositivas" y un botón "<- SELECCIONAR DIAPOSITIVAS" que minimiza este panel para seguir añadiendo clics.
    -   Lista anidada de los elementos seleccionados: Muestra el Grupo, y anidadas como lista sus miniaturas/texto de marcadores seleccionados.
    -   Input inferior `Titula esta selección` y en lugar de "Crear Enlace" (dado que somos offline) ofreceremos los dos super-botones funcionales de nuestra App: **Copiar al Portapapeles (TXT)** y **Exportar Netscape Bookmarks (HTML)**.
3.  **Selector Visual en Diales**:
    -   Inyectar un div `.share-checkbox` o un borde de color en los `.dial-card` al hacer click si el "Modo Selección" está activo, con el SVG de un *Check* como en las imágenes del cliente.

### Lógica JS (`src/main.ts`)
1.  **Estado Global**: `let isShareSelectionMode = false;`, `let shareSelectedDials = new Set<string>();`.
2.  **Toggle del Modo**: Al pulsar "Compartir diapositivas" en el dropdown principal, activar este modo, mostrar el `share-bottom-bar` y añadir una clase al body `share-mode-active` para neutralizar clicks de navegación normal en los dials y reemplazarlos por "toggles de su Set".
3.  **Visualización**: Clicar el Chevron-Up rellena dinámicamente el Modal leyendo el `Set` y agrupando los Diales por los grupos a los que pertenecen (`getAllDials().filter(id => Set.has(id))`).
4.  **Exportación**: Reutilizar el parseador a TXT (Clipboard) y a File (`.html`) que ya definimos, pero ahora alimentado EXCLUSIVAMENTE de los Dials que existan en nuestro Set temporal.

## Fase V14: Menú Editar Grupo (Avanzado)

De acuerdo a las imágenes aportadas, el menú "Editar Grupo" original era un centro de control muy completo y tabulado. Recrearemos fielmente este Modal UI.

### Estructura HTML (`index.html`)
- Reemplazar el modal simple `#group-modal` por uno avanzado: `#advanced-group-modal`.
-   **Layout Dual CSS**: Un contenedor Flex interno con un `.sidebar-left` (columna azul turquesa) y un `.content-right` (columna gris oscuro).
-   **Pestañas (Sidebar)**: 5 Tramos interactivos: `General`, `Apariencia`, `Fondo`, `Diapositivas`, `Configuración` con sus respectivos SVG calcados.
-   **Paneles de Opciones**:
    -   *General*: Input Nombre, Inputs numéricos Posición/Columnas, Radios de Diseño de Grupo.
    -   *Apariencia*: Grid de Iconos clickeables, Input hex de "Color del texto".
    -   *Fondo*: Radios de Color Sólido, Degradados, SVG locales e input de URL de fondo.
    -   *Diapositivas*: Slider `Espacio entre diapositivas`, Selectores de Contenedor y Checkbox de Nueva Ventana/Pestaña.
    -   *Configuración*: Checkboxes Pestaña Predeterminada, Archivar, Bloqueo de contraseña, y Botón Clonar.
-   **Barra Inferior Footer**: Botones "GUARDAR CAMBIOS" (azul vibrante) y "DESCARTAR CAMBIOS" (gris oscuro/negro transparente).

### Lógica JS (`src/main.ts`)
- Configurar evento de apertura apuntando desde "Ajustes de Pestaña de grupo" y "Editar grupo" (Dropdown global) a esta nueva UI gigante pasándole la Data del grupo actual (`document.getElementById('advanced-group-modal-title').innerText = \`Editar grupo: "${group.title}"\` `).
- Programar el tabulador visual: Al clicar en el sidebar izquierdo, ocultar/mostrar el `div` asociado en el lado derecho.
- Mantener compatibilidad parcial: interceptar el botón Guardar para mutar el `group.title` (es la única variable que interfiere al 100% vitalmente con el código actual, el resto del backend de UI/estética de grupo es puramente visual de momento).

## Fase V15: Funcionalidad Integral del Modal Avanzado

De acuerdo a la retroalimentación, la estructura (HTML) y la navegación (JS) de las pestañas funcionan, pero las características visuales y lógicas de las opciones presentadas no alteran el estado ni se guardan. Expandiremos la interactividad para que "Apariencia", "Fondo", "Diapositivas" y "Configuración" sean completamente funcionales.

### Lógica Core (`api.ts` y `main.ts`)
- Mapear nuevos campos a la interfaz `Group` (como `groupIcon`, `groupColor`, `groupBgType`, `groupBgValue`, etc.) y habilitar su previsualización en vivo dentro de `tempGroupSettings`.

### 1. Pestaña Apariencia
- **Iconos**: Hacer que la selección visual del grid asigne el icono correspondiente a `tempGroupSettings`, aplicándolo al tab principal del grupo.
- **Color de Texto**: Capturar el input de color e inyectarlo en el color de fuente del header del grupo / marcadores de ese grupo.

### 2. Pestaña Fondo
- **Radios BG**: Implementar control de UI de acordeones (Ninguno, Color, Gradientes, Imagen).
- **Binding Visual**: Añadir listeners para cada bloque, generando en tiempo real (Live Preview) variables de CSS sobre el fondo general (`body` interactivo) vinculado exclusivamente a cuando el grupo activo es seleccionado.

### 3. Pestaña Diapositivas
- **Espaciado**: Capturar el rango del control deslizante/input para el gap entre diapositivas e inyectarlo en vivo sobre el contenedor de marcadores (`grid-gap: Xpx`).
- **Comportamiento Redirección**: Enlazar los Checkboxes de Apertura (Pestaña/Ventana) para que impacten en los oyentes click principales de `.dial-card` al navegar.

### 4. Pestaña Configuración
- Enlazar la casilla "Predeterminado" a persistirse globalmente o alterando el índice base.
- Implementar maquetado del "Bloquear grupo" e inyectar un icono candado visual si se encuentra *true*, restringiendo acciones de drag&drop en sus botones.

## Fase V20: Menú y Archivo de Ayuda

### 1. Archivo Base (`Ayuda.md`)
*   **[NEW]** `Ayuda.md`
    * Se creará un archivo nuevo de texto estructurado en Markdown en la raíz del proyecto.
    * Servirá como "Manual de Usuario" para leer fácilmente sobre cómo exprimir todas las características disponibles (ajustes avanzados, atajos, seguridad, importar base de datos, customizaciones visuales, etc.).

### 2. Conectividad JS (`src/main.ts`)
*   **[MODIFY]** `src/main.ts`
    * Redirigir el evento del botón base `#menu-help` del HTML.
    * Crear una función que actúe sobre este botón `addEventListener('click', ...)` para abrir el archivo directamente en una pestaña local mediante `chrome.tabs.create({ url: chrome.runtime.getURL('Ayuda.md') })` o alternativamente un `window.open` a la ruta local.

## Fase V21: Instrucciones de Instalación
Dado que hemos empaquetado una extensión privada que aún no se publica en la tienda oficial de plugins, debemos instruir al usuario final en cómo instalar la carpeta `/dist` local en su navegador:
### Chrome, Edge, Brave (Chromium)
1. Navegar a `chrome://extensions`.
2. Habilitar **Modo Creador/Desarrollador**.
3. Cargar la extensión Desempaquetada y seleccionar `/dist`.
### Firefox (Gecko)
1. Navegar a `about:debugging#/runtime/this-firefox`.
2. Cargar complemento temporal: Seleccionando el `manifest.json`.

Todo esto quedará recogido en un gran archivo explicativo `Instalacion.md`.

## Fase V22: Publicación en Repositorio (GitHub)
Para facilitar que el usuario y otros desarrolladores accedan al código:
*   **[NEW]** `.gitignore`
    * Asegurar que no se suban ficheros pesados como `node_modules`, ni variables locales o caches de Vite/npm.
*   **Comandos de Git**: Inicialización del repo `git init`, adición de todos los archivos válidos `git add .` y creación de un commit base "v1.0.0 Release - Premium Version".
