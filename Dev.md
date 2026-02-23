# Group Speed Dial - Documentación y Análisis de Proyecto (Dev.md)

## Estado Actual del Proyecto
Tras analizar la carpeta `e:/Proyectos/vddgroupdial`, he detectado que contiene la versión **compilada y empaquetada** de la extensión (archivos generados por Webpack listos para producción o distribución), pero **no el código fuente original**.

*   Según el `README.md`, el proyecto original está desarrollado con **Node.js, TypeScript, Vue.js y Vuetify**.
*   Los archivos actuales son los *chunks* minificados de JavaScript (ej. `17.js`, `274.js`, `background_gsd.worker.js`), fuentes `.woff2` e iconos.
*   No hay archivo `package.json` ni archivos `.ts` o `.vue` en esta ruta.

## Mejoras Posibles y Recomendadas

A continuación, las mejoras arquitectónicas y funcionales que he identificado, ordenadas por prioridad:

### 1. Obtener y Trabajar sobre el Código Fuente Original (Crítico)
Para realizar y mantener mejoras (ya sea refactorización o diseño UI/UX), necesitamos acceder al repositorio del código fuente con sus archivos TypeScript y Vue, además del archivo `package.json`. Modificar código directamente sobre archivos minificados/ofuscados (`.js` generados por Webpack) es sumamente ineficiente, propenso a errores y poco escalable.

### 2. Migración a Manifest V3 (Alta Prioridad)
El `manifest.json` actual define `"manifest_version": 2`. 
*   **Por qué mejorarlo**: Manifest V2 está obsoleto (deprecated) y dejará de ser soportado en navegadores basados en Chromium e incluso en Firefox paulatinamente.
*   **Qué implica**: 
    *   Cambiar a `"manifest_version": 3`.
    *   Reemplazar `"browser_action"` por `"action"`.
    *   Migrar los "background scripts" persistentes a un "Service Worker" (`background_gsd.worker.js` está estructurado como worker, lo cual facilita el paso, pero hay que quitar `"persistent": true`).
    *   Adaptar APIs de red (sustituir partes de `webRequest` por `declarativeNetRequest` si bloquea o modifica peticiones).

### 3. Rediseño de UI/UX - "Premium Aesthetics" (Media Prioridad)
Una vez en el código fuente:
*   Inyectar un rediseño que use **Glassmorphism**, transiciones suaves (micro-animaciones) y una paleta de colores curada y moderna orientada a dar un **aspecto premium**.
*   Asegurar que los componentes de *Vuetify* tengan personalización adecuada para no verse como los valores por defecto del framework, mejorando los efectos de *hover* e interacción.

### 4. Modularización de la Documentación 
Como indica nuestra regla, mantendré y actualizaré siempre este único archivo (`Dev.md`) centralizando aquí todos los detalles de arquitectura y cambios realizados durante cada sesión.

## Plan de Acción: Nueva Extensión Speed Dial (Pro)

Dado que no disponemos del código fuente original (TypeScript/Vue) de la extensión actual, intentar realizar ingeniería inversa o modificaciones sobre código minificado por Webpack (`.js`) es inviable para un mantenimiento a largo plazo y para añadir nuevas funcionalidades de forma estable.

Por lo tanto, la **decisión arquitectónica principal** es **construir una nueva extensión desde cero** basándonos en las funcionalidades y el aspecto visual de Group Speed Dial, pero utilizando tecnologías modernas, una arquitectura limpia y apuntando directamente a **Manifest V3**.

### Fases del Nuevo Proyecto

1.  **Levantamiento del Proyecto Base (Manifest V3)**
    *   Inicializar un nuevo proyecto (ej. con Vite + Vue 3 o Vanilla JS/TS según las necesidades).
    *   Configurar el `manifest.json` en versión 3.
    *   Establecer la estructura básica: `background` (Service Worker), `popup`, y la página principal (`newtab` o dial).
2.  **Arquitectura de Datos y Almacenamiento**
    *   Diseñar el esquema de datos para los grupos y los "dials" (marcadores).
    *   Implementar la capa de almacenamiento usando `chrome.storage.local` o `chrome.storage.sync`.
3.  **UI/UX Premium**
    *   Implementar un diseño moderno, glassmorphism, modo oscuro/claro y animaciones fluidas.
    *   Crear la interfaz principal de la cuadrícula de dials (Speed Dial).
4.  **Funcionalidades Core**
    *   Añadir/Editar/Eliminar URLs y Grupos.
    *   Generación o asignación de miniaturas (thumbnails).
    *   Gestión de arrastrar y soltar (Drag & Drop) para reorganizar.

### Iteración V3 - Auténtico "Group Speed Dial"
Tras analizar el comportamiento inicial, la extensión carece del componente clave original: la **agrupación**.
*   **Arquitectura de Datos Refactorizada**:
    *   Entidad de primera clase: `Group` (id, title, order).
    *   Entidad secundaria anidada: `Dial` (id, groupId, title, url, order).
*   **Interfaz Principal (New Tab)**:
    *   Inyección de una barra lateral o pestaña superior de Navegación de Grupos.
    *   Los marcadores individuales solo se muestran y añaden en el contexto del Grupo activo.
*   **Menú de Aplicación (Ajustes)**:
    *   Sidebar o Modal global con opciones estructurales.
    *   Sección de Importación/Exportación (HTML, copias de seguridad).
    *   Ajustes de visualización y preferencias globales.

---
**Nota**: Para iniciar el desarrollo, crearé una nueva carpeta para el proyecto (ej. `e:/Proyectos/new-speeddial`) o podemos vaciar la actual si lo prefieres, y comenzaré con la fase de andamiaje (scaffolding).

### Fase V14: Funcionalidad de Modal Avanzado de Grupos (Pestaña General)
Se completó la lógica de frontend para el modal de edición avanzada de grupos. Se añadió interactividad en vivo (live preview) de las columnas y el layout del grid. Se corrigió un bug donde un event listener duplicado abría simultáneamente la modal de edición simple de grupos. Se adaptó la interfaz Group en api.ts para almacenar las columnas y el layoutType, reflejándose inmediatamente en el DOM sin necesidad de refrescar la página.

### Fase V14: Refinamiento de Diseño de Grupo (Live Preview Dinámico)
Se implementaron completamente los controles para el Tamaño de Diapositiva Dinámico, Tamaño de Lista y Opciones de Cuadrícula (Rellenar hueco, Centrar, Relación de Aspecto). Ahora todos los botones +/- y campos de texto reaccionan en tiempo real, actualizando la cuadrícula de marcadores en el fondo sin necesidad de guardar primero, y persistiendo correctamente al confirmar.
- Se ha modificado el Modal Avanzado (#advanced-group-modal) haciéndolo arrastrable. Se añadió lógica JS en main.ts escuchando los eventos de ratón en el header y desplazando su contenedor usando 	ransform: translate, permitiendo ver el fondo con los marcadores a tiempo real durante la edición.
- Se implementó la opción Dirección (Horizontal/Vertical) dentro de la vista Dinámico - lista. Horizontal distribuye con auto-fill y ancho regulable en modo flex row. Vertical la fuerza a 1 columna. Se creó la clase .layout-list en style.css que altera los marcadores para convertirlos estructuralmente en filas de lista, reduciendo el ícono a la izquierda y dejando el título a la derecha.
- Se han inhabilitado las reglas de desenfoque (ackdrop-filter) y reducido la opacidad del color de fondo de la superposición oscura del modal Editar Grupo (#advanced-group-modal) en style.css para permitir una visión clara y sin estorbos de los marcadores detrás de él mientras se visualizan los cambios en tiempo real.
- Se reorganizó el contenido de las pestañas del Modal Avanzado de Grupo. La sección de Columnas y Filas junto con las opciones de Diseño de grupo (Dinámico, Lista, Cuadrícula) se movieron lógicamente de la pestaña General hacia la pestaña **Apariencia**. Las acciones misceláneas (Abrir en contenedor, nueva ventana, etc.) pasaron de **Diapositivas** a **Configuración**.
- Se ha corregido la distribución de elementos del Modal Avanzado de Grupo según las indicaciones del usuario. **General** recupera las de control de Columnas/Filas y diseño. **Apariencia** se queda solo con el color del texto y la selección del ícono del grupo. En **Diapositivas** se encuentran Espacio entre diapositivas y las opciones de Acciones de enrutamiento (Firefox containers, nueva pestaña, etc). Por último, **Configuración** conserva las opciones de Bloquear el grupo y abrir al Arranque (predeterminado).
- Se detectó y corrigió un error visual en el cual todas las pestañas del Modal Avanzado se mostraban a la vez. El código JS asignaba una clase .hidden pero esta clase no existía de forma genérica en el archivo style.css. Se añadió y ahora el visor de pestañas funciona correctamente.
- **Fase V15 (Completa)**: Se documentó globalmente la interfaz base de *Fondo* (Solid, Linear-Gradient, radial-circle y radial-ellipse, URL), *Apariencia* (Hex Color Text, 15+ SVGs seleccionables), *Diapositivas* (Gap slider paramétrico y checkboxes de target=\_blank por Grupo) y *Configuración* (isDefault fallback y isLocked drag-and-drop shield protector). Se aplicó una reescritura de toda la pre-visualización reactiva de `applyLivePreview` inyectando propiedades CSS inline sobre el contenedor o el `body`.
- **Refinamientos Finales de la Pestaña Diapositivas**: Se eliminaron selectores HTML obsoletos como "Imagen desde URL" y "Abrir en Contenedor". Se depuró la propagación del EventListener de "Click" en `main.ts` que provocaba abrir miniaturas por duplicado. Además, se reescribió la opción "Abrir en nueva ventana" empleando directamente la API de Extensiones `chrome.windows.create`, forzando que navegadores como Firefox y Chrome aíslen el proceso fuera del marco de la pestaña sin importar su política de Pop-up defaults.
- **Acceso Rápido a Creación de Grupos**: Se inyectó dinámicamente una nueva pseudo-pestaña interactiva con el logo '+' justo al final del renderizado de la barra de navegación de Grupos (`groupsContainer`). Permite abrir el modal base de "Añadir Nuevo Grupo" reduciendo drásticamente la fricción y atajos secundarios requeridos para escalar el Speed Dial.
- **Fase V18 (Completa)**: Implementación de la propiedad `password` en el modelo de datos. Se inyectó un nuevo input al modal de "Configuración de Grupo", permitiendo definir una contraseña local en lugar de "0000". Los `prompts` de visualización, edición y borrado ahora consultan dinámicamente este string de base de datos interrumpiendo el flujo nativo si falla la confirmación.
- **Fase V19 (Completa)**: Sobrescritura del menú contextual nativo (`contextmenu`) en `main.ts` restringido a los contornos del Speed Dial activo. Se diseñó en CSS un panel absoluto (`#custom-context-menu`) con `glassmorphism` e iconos SVG que despliega funciones de organización (Nombre A-Z/Z-A, Más Antiguos/Más Recientes). La lógica Javascript emplea `sort()` evaluando las fechas parseadas sobre los `id` de origen (timestamps simulados) y repinta asíncronamente en pantalla invocando `renderDials()`.
- **Fase V20 (Completa)**: Elaboración funcional de guía global usando base de texto semántico. La estructura se instanció bajo el nombre `Help.md` para empaquetado cross-plataform directo en la raíz. La inyección en UI principal asocia una API combinando llamadas de `chrome.runtime.getURL()` conectadas en listeners asíncronos para asegurar retrocompatibilidad con apertura local offline.
- **Fase V21 (Completa)**: Elaborada guía de instalación "humana" en formato Markdown (`Instalacion.md`) conteniendo el proceso de carga de la carpeta limpia `/dist` en modo desarrollador con diferenciación estructural para Gecko / Chromium environments.
- **Fase V22 (Completa)**: Repositorio preparado para publicación/hosting. Descomentado `/dist` de `.gitignore` vitalicio. Realizado el escaneo maestro y consolidación versionada en disco local con inicialización `git init`, indexación y commit maestro de versión v1.0.0.
- **Fase V23 (Completa)**: Arquitectura multi-idioma (i18n) en español e inglés implementada ex profeso. Los literals hardcodeados del TypeScript (alerts/prompts) se parsearon con un script en JS para conectarlos a `chrome.i18n`. Se inyectó una función auto-parser conectada a los atributos de datos `[data-i18n]` y `[data-i18n-title]` del archivo Index originando un DOM 100% dinámico. Finalmente se escribió el fichero maestro de repositorio `README.md` detallado en inglés de forma orgánica.
- **Fase V24 (Completa)**: Operación de empaquetado manual de carpeta `/dist`. Consolidado exitosamente el contenido en el formato Mozilla Installer `vddgroupdial.xpi` listo para la distribución raw en navegadores compatibles.
