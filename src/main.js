import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const STORAGE_KEY = 'roommaker-project-v2'
const OLD_STORAGE_KEY = 'roommaker-project-v1'
const CM_TO_M = 0.01
const WALL_THICKNESS = 16

const catalogue = [
  { id: 'seat2', group: 'Meubels', name: 'Stoel', w: 72, d: 72, color: '#8f7c62', model: '/models/Seat2.glb' },
  { id: 'sofa', group: 'Meubels', name: 'Bank', w: 210, d: 92, color: '#54708f' },
  { id: 'table', group: 'Meubels', name: 'Eettafel', w: 160, d: 90, color: '#9a704b' },
  { id: 'bed', group: 'Meubels', name: 'Bed', w: 180, d: 210, color: '#c4a07a' },
  { id: 'desk', group: 'Meubels', name: 'Bureau', w: 140, d: 70, color: '#5f7668' },
  { id: 'plant', group: 'Accessoires', name: 'Plant', w: 54, d: 54, color: '#4d8a64' },
  { id: 'rug', group: 'Accessoires', name: 'Vloerkleed', w: 180, d: 120, color: '#d49a6a' },
  { id: 'lamp', group: 'Accessoires', name: 'Lamp', w: 44, d: 44, color: '#e4c76f' },
]

const floorStyles = [
  { id: 'oak', label: 'Eiken', a: '#d8bf92', b: '#b98f5b' },
  { id: 'concrete', label: 'Beton', a: '#c8c8c4', b: '#9faaa9' },
  { id: 'darkwood', label: 'Donker hout', a: '#6f4a31', b: '#3f2c21' },
  { id: 'tile', label: 'Tegels', a: '#e8e5dc', b: '#b6b0a7' },
]

const figmaIcon = {
  back: 'https://www.figma.com/api/mcp/asset/061bc4ce-a6d2-4d57-a220-d54c2519a925',
  forward: 'https://www.figma.com/api/mcp/asset/480f2fce-ba26-4387-909a-03dd983dbace',
  previous: 'https://www.figma.com/api/mcp/asset/dae4b86b-db1c-41e3-9a96-6f605c56d856',
  copy: 'https://www.figma.com/api/mcp/asset/0c932af7-1a6e-4d45-b2bb-14bc4bd21083',
  share: 'https://www.figma.com/api/mcp/asset/89268102-1d18-489c-8a63-dba429f5520c',
  settings: 'https://www.figma.com/api/mcp/asset/0881a543-a054-4b7c-8c4b-441ac107ad0b',
  account: 'https://www.figma.com/api/mcp/asset/fcd65c9e-90b2-4150-88bf-197550e36816',
  room: 'https://www.figma.com/api/mcp/asset/ccf17854-89c7-4f38-b950-089d4e46cd4c',
  furniture: 'https://www.figma.com/api/mcp/asset/e209f67f-1b1b-43be-8be8-5f2d65f24531',
  accessories: 'https://www.figma.com/api/mcp/asset/a9a5df9a-d1f5-4d2b-b51d-9782a06c625a',
  dimensions: 'https://www.figma.com/api/mcp/asset/df26e5dd-9003-4a51-90fc-447accf946a6',
  openings: 'https://www.figma.com/api/mcp/asset/c4e23f73-6439-464e-a3bf-fc538655f36b',
  finish: 'https://www.figma.com/api/mcp/asset/4642b571-59a8-4bac-b7d6-8b204200a532',
  grid: 'https://www.figma.com/api/mcp/asset/78bb6c5b-c653-42e1-9cdb-2fba0057bc5b',
  measure: 'https://www.figma.com/api/mcp/asset/037be7d5-1381-458a-90f0-c53fbff52f34',
}

const icon = {
  home: `<img src="${figmaIcon.back}" alt="">`,
  undo: `<img src="${figmaIcon.previous}" alt="">`,
  redo: `<img src="${figmaIcon.forward}" alt="">`,
  copy: `<img src="${figmaIcon.copy}" alt="">`,
  export: '<span class="figma-export-icon"><i></i><b></b></span>',
  share: `<img src="${figmaIcon.share}" alt="">`,
  settings: `<img src="${figmaIcon.settings}" alt="">`,
  account: `<img src="${figmaIcon.account}" alt="">`,
  select: '<svg viewBox="0 0 24 24"><path d="m5 3 12 10-6 1.5L8 21z"/></svg>',
  room: `<img src="${figmaIcon.room}" alt="">`,
  dimensions: `<img src="${figmaIcon.dimensions}" alt="">`,
  openings: `<img src="${figmaIcon.openings}" alt="">`,
  furniture: `<img src="${figmaIcon.furniture}" alt="">`,
  finish: `<img src="${figmaIcon.finish}" alt="">`,
  accessories: `<img src="${figmaIcon.accessories}" alt="">`,
  grid: `<img src="${figmaIcon.grid}" alt="">`,
  measure: `<img src="${figmaIcon.measure}" alt="">`,
  view2d: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 9h8v6H8z"/></svg>',
  view3d: '<svg viewBox="0 0 24 24"><path d="m12 3 8 4v10l-8 4-8-4V7z"/><path d="M12 12v9M4 7l8 5 8-5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
}

const defaultPoints = () => [
  { x: 0, y: 0 },
  { x: 620, y: 0 },
  { x: 620, y: 460 },
  { x: 0, y: 460 },
]

const blankProject = () => ({
  name: 'Nieuw kamerproject',
  mode: '2d',
  activeTool: 'select',
  showGrid: true,
  measuring: false,
  room: {
    height: 260,
    wallColor: '#ebe3d4',
    floorStyle: 'oak',
    points: defaultPoints(),
  },
  objects: [
    { uid: crypto.randomUUID(), type: 'sofa', name: 'Bank', x: 84, y: 72, w: 210, d: 92, color: '#54708f', rotation: 0 },
    { uid: crypto.randomUUID(), type: 'table', name: 'Eettafel', x: 356, y: 236, w: 160, d: 90, color: '#9a704b', rotation: 0 },
    { uid: crypto.randomUUID(), type: 'plant', name: 'Plant', x: 510, y: 68, w: 54, d: 54, color: '#4d8a64', rotation: 0 },
  ],
  openings: [
    { uid: crypto.randomUUID(), type: 'door', wallIndex: 2, offset: 58, width: 92 },
    { uid: crypto.randomUUID(), type: 'window', wallIndex: 0, offset: 356, width: 132 },
  ],
})

let state = normalizeProject(loadProject())
let selected = { kind: 'object', id: state.objects[0]?.uid ?? null }
let selectedWallIndex = 0
let history = [snapshot()]
let historyIndex = 0
let view = { zoom: 0.82, panX: 170, panY: 150 }
let drag = null
let drawingPoints = []
let drawerTool = null

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <div class="canvas-wrap">
      <canvas id="planCanvas"></canvas>
      <div id="threeHost"></div>
    </div>

    <header class="topbar pill-bar" aria-label="Hoofdacties">
      <button class="icon-button top-back" data-action="home" title="Home" aria-label="Home">${icon.home}</button>
      <input class="project-name" id="projectName" aria-label="Projectnaam" />
      <button class="icon-button top-undo" data-action="undo" title="Stap terug" aria-label="Stap terug">${icon.undo}</button>
      <button class="icon-button top-redo" data-action="redo" title="Stap vooruit" aria-label="Stap vooruit">${icon.redo}</button>
      <button class="icon-button top-copy" data-action="copy" title="Kopieren" aria-label="Kopieren">${icon.copy}</button>
      <button class="icon-button top-export" data-action="export" title="Exporteren" aria-label="Exporteren">${icon.export}</button>
      <button class="icon-button top-share" data-action="share" title="Delen" aria-label="Delen">${icon.share}</button>
      <div class="segmented top-view-toggle" aria-label="Weergave">
        <button data-view="2d" title="2D weergave" aria-label="2D weergave">${icon.view2d}</button>
        <button data-view="3d" title="3D weergave" aria-label="3D weergave">${icon.view3d}</button>
      </div>
      <button class="icon-button top-settings" data-action="settings" title="Instellingen" aria-label="Instellingen">${icon.settings}</button>
      <button class="icon-button top-account" data-action="account" title="Account" aria-label="Account">${icon.account}</button>
    </header>

    <aside class="toolrail pill-bar" aria-label="Ruimte tools">
      <button class="rail-button rail-select" data-tool="select" title="Selecteren" aria-label="Selecteren">${icon.select}</button>
      <button class="rail-button rail-room" data-tool="room" title="Muren tekenen" aria-label="Muren tekenen">${icon.room}</button>
      <button class="rail-button rail-dimensions" data-tool="dimensions" title="Afmetingen" aria-label="Afmetingen">${icon.dimensions}</button>
      <button class="rail-button rail-openings" data-tool="openings" title="Ramen en deuren" aria-label="Ramen en deuren">${icon.openings}</button>
      <button class="rail-button rail-furniture" data-tool="furniture" title="Meubels" aria-label="Meubels">${icon.furniture}</button>
      <button class="rail-button rail-finish" data-tool="finish" title="Opmaak" aria-label="Opmaak">${icon.finish}</button>
      <button class="rail-button rail-accessories" data-tool="accessories" title="Accessoires" aria-label="Accessoires">${icon.accessories}</button>
      <button class="rail-button rail-grid" data-tool="grid" title="Raster" aria-label="Raster">${icon.grid}</button>
      <button class="rail-button rail-measure" data-tool="measure" title="Meetlint" aria-label="Meetlint">${icon.measure}</button>
    </aside>

    <div class="drawer-scrim" id="drawerScrim"></div>
    <aside class="tool-drawer" id="toolDrawer" aria-label="Tool menu" aria-hidden="true"></aside>
  </div>
`

const canvas = document.querySelector('#planCanvas')
const ctx = canvas.getContext('2d')
const threeHost = document.querySelector('#threeHost')
const projectName = document.querySelector('#projectName')
const toolDrawer = document.querySelector('#toolDrawer')
const drawerScrim = document.querySelector('#drawerScrim')

let renderer
let scene
let camera
let controls
let gltfLoader
const modelCache = new Map()

setupEvents()
initThree()
render()

function setupEvents() {
  projectName.value = state.name
  projectName.addEventListener('input', () => {
    state.name = projectName.value || 'Naamloos project'
    persist()
  })

  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool
      if (tool === 'grid') {
        state.showGrid = !state.showGrid
        closeDrawer(false)
      } else if (tool === 'measure') {
        state.measuring = !state.measuring
        closeDrawer(false)
      } else {
        if (state.activeTool === tool) {
          state.activeTool = 'select'
          drawerTool = null
          drawingPoints = []
        } else {
          state.activeTool = tool
          if (tool !== 'room') drawingPoints = []
          drawerTool = tool
        }
      }
      commit()
      render()
    })
  })

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.view
      render()
    })
  })

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleTopAction(button.dataset.action))
  })

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  drawerScrim.addEventListener('click', () => closeDrawer())
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer()
  })
  window.addEventListener('resize', render)
}

function handleTopAction(action) {
  if (action === 'undo') undo()
  if (action === 'redo') redo()
  if (action === 'copy') duplicateSelected()
  if (action === 'export') exportProject()
  if (action === 'share') {
    navigator.clipboard?.writeText(JSON.stringify(state, null, 2))
    toast('Projectdata gekopieerd')
  }
  if (action === 'home') {
    selected = { kind: 'object', id: null }
    state.mode = '2d'
    closeDrawer(false)
  }
  if (action === 'settings') {
    state.activeTool = 'dimensions'
    drawerTool = 'dimensions'
  }
  if (action === 'account') toast('Account flow komt in een volgende versie')
  render()
}

function onPointerDown(event) {
  if (state.mode !== '2d') return
  canvas.setPointerCapture(event.pointerId)
  const point = screenToWorld(event)

  if (state.activeTool === 'room') {
    const cornerIndex = hitCorner(point)
    if (cornerIndex > -1) {
      selected = { kind: 'corner', id: cornerIndex }
      drag = { type: 'corner', index: cornerIndex }
      render()
      return
    }

    if (drawingPoints.length > 2 && distance(point, drawingPoints[0]) < 18) {
      state.room.points = [...drawingPoints]
      migrateOpeningsToValidWalls()
      drawingPoints = []
      commit()
      render()
      return
    }

    drawingPoints.push({ x: snap(point.x), y: snap(point.y) })
    render()
    return
  }

  if (state.activeTool === 'openings') {
    const opening = hitOpening(point)
    if (opening) {
      selected = { kind: 'opening', id: opening.uid }
      drawerTool = 'openings'
      drag = { type: 'opening', id: opening.uid }
      render()
      return
    }

    const wall = hitWall(point)
    if (wall) {
      selectedWallIndex = wall.index
      selected = { kind: 'wall', id: wall.index }
      drawerTool = 'openings'
      render()
      return
    }
  }

  const object = hitObject(point)
  selected = { kind: 'object', id: object?.uid ?? null }
  if (object && state.activeTool === 'select') drawerTool = 'select'

  if (object) {
    drag = {
      type: 'object',
      id: object.uid,
      offsetX: point.x - object.x,
      offsetY: point.y - object.y,
      lastGood: { x: object.x, y: object.y },
    }
  } else {
    drag = { type: 'pan', startX: event.clientX, startY: event.clientY, panX: view.panX, panY: view.panY }
  }
  render()
}

function onPointerMove(event) {
  if (state.mode !== '2d' || !drag) return
  const point = screenToWorld(event)

  if (drag.type === 'pan') {
    view.panX = drag.panX + event.clientX - drag.startX
    view.panY = drag.panY + event.clientY - drag.startY
  }

  if (drag.type === 'corner') {
    state.room.points[drag.index] = { x: snap(point.x), y: snap(point.y) }
    keepObjectsInsideRoom()
  }

  if (drag.type === 'opening') {
    const opening = state.openings.find((item) => item.uid === drag.id)
    if (opening) {
      opening.offset = offsetOnWall(point, opening.wallIndex, opening.width)
    }
  }

  if (drag.type === 'object') {
    const object = state.objects.find((item) => item.uid === drag.id)
    if (!object) return
    object.x = snap(point.x - drag.offsetX)
    object.y = snap(point.y - drag.offsetY)
    if (isPlacementValid(object)) {
      drag.lastGood = { x: object.x, y: object.y }
    } else {
      object.x = drag.lastGood.x
      object.y = drag.lastGood.y
      toast('Botsing: plaatsing past hier niet')
    }
  }
  render()
}

function onPointerUp() {
  if (drag?.type) commit()
  drag = null
}

function onWheel(event) {
  if (state.mode !== '2d') return
  event.preventDefault()
  view.zoom = clamp(view.zoom + (event.deltaY > 0 ? -0.06 : 0.06), 0.35, 1.9)
  renderPlan()
}

function render() {
  projectName.value = state.name
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === state.activeTool)
    if (button.dataset.tool === 'grid') button.classList.toggle('is-active', state.showGrid)
    if (button.dataset.tool === 'measure') button.classList.toggle('is-active', state.measuring)
  })
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === state.mode)
  })
  canvas.hidden = state.mode !== '2d'
  threeHost.hidden = state.mode !== '3d'
  renderToolDrawer()
  renderPlan()
  renderThree()
}

function renderToolDrawer() {
  const object = selected.kind === 'object' ? state.objects.find((item) => item.uid === selected.id) : null
  const opening = selected.kind === 'opening' ? state.openings.find((item) => item.uid === selected.id) : null
  const isOpen = Boolean(drawerTool)
  toolDrawer.classList.toggle('is-open', isOpen)
  drawerScrim.classList.toggle('is-visible', isOpen)
  toolDrawer.setAttribute('aria-hidden', String(!isOpen))

  const drawerContent = {
    select: `
      <section class="panel-section">
        <div class="section-title"><span>Selectie</span></div>
        ${object ? selectedEditor(object) : '<p class="muted">Selecteer een object op het canvas om het hier te bewerken.</p>'}
      </section>
    `,
    room: `
      <section class="panel-section">
        <div class="section-title"><span>Muren tekenen</span></div>
        <p class="muted">Klik hoekpunten op het raster. Klik terug op het eerste punt om de kamer te sluiten. Sleep bestaande hoeken om de vorm te wijzigen.</p>
        <button class="small-button" data-reset-room>Nieuwe vorm tekenen</button>
        <label>Kamerhoogte cm <input type="number" min="210" max="420" data-room="height" value="${state.room.height}"></label>
        <div class="stats">
          <span>${state.room.points.length} hoeken</span>
          <span>${wallSegments().length} muren</span>
        </div>
      </section>
    `,
    dimensions: `
      <section class="panel-section">
        <div class="section-title">
          <span>Project</span>
          <button class="small-button" data-save>Bewaar</button>
        </div>
        <label>Naam <input data-field="name" value="${escapeHtml(state.name)}"></label>
        <label>Kamerhoogte cm <input type="number" min="210" max="420" data-room="height" value="${state.room.height}"></label>
        <div class="stats">
          <span>${Math.round(roomBounds().width)} cm breed</span>
          <span>${Math.round(roomBounds().height)} cm diep</span>
        </div>
      </section>
    `,
    openings: `
      <section class="panel-section">
        <div class="section-title"><span>Ramen en deuren</span></div>
        <p class="muted">Klik een muur om die te kiezen. Klik of sleep een opening om hem over de muur te verplaatsen.</p>
        <div class="split-actions">
          <button data-opening="door">Deur plaatsen</button>
          <button data-opening="window">Raam plaatsen</button>
        </div>
        ${opening ? openingEditor(opening) : '<p class="muted">Geen raam/deur geselecteerd.</p>'}
        <div class="opening-list">
          ${state.openings.map((item) => `
            <button class="list-row" data-select-opening="${item.uid}">
              <span>${item.type === 'door' ? 'Deur' : 'Raam'} - muur ${item.wallIndex + 1}</span>
              <strong>${Math.round(item.width)} cm</strong>
            </button>
          `).join('')}
        </div>
      </section>
    `,
    furniture: cataloguePanel('Meubels', 'Meubels'),
    accessories: cataloguePanel('Accessoires', 'Accessoires'),
    finish: `
      <section class="panel-section">
        <div class="section-title"><span>Opmaak</span></div>
        <label>Muurkleur <input type="color" data-room="wallColor" value="${state.room.wallColor}"></label>
        <div class="floor-grid">
          ${floorStyles.map((style) => `
            <button data-floor="${style.id}" class="${state.room.floorStyle === style.id ? 'is-active' : ''}" style="--a:${style.a};--b:${style.b}">
              ${style.label}
            </button>
          `).join('')}
        </div>
      </section>
    `,
  }[drawerTool] ?? ''

  toolDrawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <span>Menu</span>
        <strong>${toolLabel(drawerTool || state.activeTool)}</strong>
      </div>
      <button class="drawer-close" data-close-drawer aria-label="Sluit menu">${icon.close}</button>
    </div>
    ${drawerContent}
  `

  toolDrawer.querySelector('[data-close-drawer]')?.addEventListener('click', () => closeDrawer())
  toolDrawer.querySelector('[data-save]')?.addEventListener('click', () => {
    persist()
    toast('Project bewaard')
  })
  toolDrawer.querySelector('[data-reset-room]')?.addEventListener('click', () => {
    drawingPoints = []
    state.room.points = defaultPoints()
    migrateOpeningsToValidWalls()
    commit()
    render()
  })
  toolDrawer.querySelectorAll('[data-room]').forEach((input) => {
    input.addEventListener('input', () => {
      state.room[input.dataset.room] = input.type === 'number' ? Number(input.value) : input.value
      commit()
      render()
    })
  })
  toolDrawer.querySelector('[data-field="name"]')?.addEventListener('input', (event) => {
    state.name = event.target.value || 'Naamloos project'
    persist()
    render()
  })
  toolDrawer.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => addCatalogueItem(button.dataset.add))
  })
  toolDrawer.querySelectorAll('[data-opening]').forEach((button) => {
    button.addEventListener('click', () => addOpening(button.dataset.opening))
  })
  toolDrawer.querySelectorAll('[data-select-opening]').forEach((button) => {
    button.addEventListener('click', () => {
      selected = { kind: 'opening', id: button.dataset.selectOpening }
      render()
    })
  })
  toolDrawer.querySelectorAll('[data-opening-field]').forEach((input) => {
    input.addEventListener('input', () => updateSelectedOpening(input))
  })
  toolDrawer.querySelectorAll('[data-floor]').forEach((button) => {
    button.addEventListener('click', () => {
      state.room.floorStyle = button.dataset.floor
      commit()
      render()
    })
  })
  toolDrawer.querySelectorAll('[data-object]').forEach((input) => {
    input.addEventListener('input', () => updateSelectedObject(input))
  })
  toolDrawer.querySelector('[data-delete]')?.addEventListener('click', deleteSelectedObject)
  toolDrawer.querySelector('[data-delete-opening]')?.addEventListener('click', deleteSelectedOpening)
}

function cataloguePanel(title, group) {
  return `
    <section class="panel-section">
      <div class="section-title"><span>${title}</span></div>
      <div class="catalogue">
        ${catalogue.filter((item) => item.group === group).map((item) => `
          <button data-add="${item.id}">
            <i style="--swatch:${item.color}"></i>
            <span>${item.name}</span>
          </button>
        `).join('')}
      </div>
      <p class="muted">Klik op een item om het direct in de kamer te plaatsen.</p>
    </section>
  `
}

function selectedEditor(object) {
  return `
    <label>Naam <input data-object="name" value="${escapeHtml(object.name)}"></label>
    <label>X cm <input type="number" data-object="x" value="${Math.round(object.x)}"></label>
    <label>Y cm <input type="number" data-object="y" value="${Math.round(object.y)}"></label>
    <label>Schaal breedte <input type="range" min="30" max="360" data-object="w" value="${Math.round(object.w)}"></label>
    <label>Schaal diepte <input type="range" min="30" max="360" data-object="d" value="${Math.round(object.d)}"></label>
    <label>Rotatie <input type="range" min="0" max="270" step="90" data-object="rotation" value="${object.rotation}"></label>
    <label>Kleur <input type="color" data-object="color" value="${object.color}"></label>
    <button class="danger-button" data-delete>Verwijder object</button>
  `
}

function openingEditor(opening) {
  const wallLength = wallSegments()[opening.wallIndex]?.length ?? 1
  return `
    <label>Breedte cm <input type="range" min="45" max="${Math.max(50, Math.round(wallLength - 20))}" data-opening-field="width" value="${Math.round(opening.width)}"></label>
    <label>Positie op muur <input type="range" min="0" max="${Math.round(wallLength)}" data-opening-field="offset" value="${Math.round(opening.offset)}"></label>
    <button class="danger-button" data-delete-opening>Verwijder opening</button>
  `
}

function renderPlan() {
  const rect = canvas.parentElement.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(rect.width * dpr))
  canvas.height = Math.max(1, Math.round(rect.height * dpr))
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, rect.width, rect.height)

  ctx.save()
  ctx.translate(view.panX, view.panY)
  ctx.scale(view.zoom, view.zoom)
  if (state.showGrid) drawGrid(rect)
  drawRoom()
  state.openings.forEach(drawOpening)
  state.objects.forEach(drawObject)
  drawDraftRoom()
  ctx.restore()
  if (state.measuring) drawRulers(rect)
}

function drawGrid(rect) {
  const start = screenToWorldCoords(0, 0)
  const end = screenToWorldCoords(rect.width, rect.height)
  const minX = Math.floor(start.x / 50) * 50
  const maxX = Math.ceil(end.x / 50) * 50
  const minY = Math.floor(start.y / 50) * 50
  const maxY = Math.ceil(end.y / 50) * 50
  ctx.strokeStyle = '#d4d0d1'
  ctx.lineWidth = 1 / view.zoom
  for (let x = minX; x <= maxX; x += 50) line(x, minY, x, maxY)
  for (let y = minY; y <= maxY; y += 50) line(minX, y, maxX, y)
}

function drawRoom() {
  const points = state.room.points
  const floor = floorStyles.find((item) => item.id === state.room.floorStyle) ?? floorStyles[0]
  ctx.save()
  ctx.beginPath()
  points.forEach((p, index) => index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
  ctx.closePath()
  ctx.fillStyle = floor.a
  ctx.fill()
  ctx.clip()
  ctx.strokeStyle = floor.b
  ctx.lineWidth = 1
  const bounds = roomBounds()
  for (let x = bounds.x - bounds.height; x < bounds.x + bounds.width + bounds.height; x += 34) {
    line(x, bounds.y, x - bounds.height, bounds.y + bounds.height)
  }
  ctx.restore()

  wallSegments().forEach((wall, index) => {
    ctx.lineWidth = selected.kind === 'wall' && selected.id === index ? 22 : WALL_THICKNESS
    ctx.strokeStyle = selected.kind === 'wall' && selected.id === index ? '#7d7377' : '#2f2a2d'
    line(wall.a.x, wall.a.y, wall.b.x, wall.b.y)
    ctx.lineWidth = 2
    ctx.strokeStyle = state.room.wallColor
    line(wall.a.x, wall.a.y, wall.b.x, wall.b.y)
    drawWallLength(wall)
  })

  points.forEach((p, index) => {
    ctx.fillStyle = selected.kind === 'corner' && selected.id === index ? '#2f2a2d' : '#e6e1e3'
    ctx.strokeStyle = '#2f2a2d'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })
}

function drawDraftRoom() {
  if (!drawingPoints.length) return
  ctx.strokeStyle = '#7d7377'
  ctx.fillStyle = '#2f2a2d'
  ctx.lineWidth = 3 / view.zoom
  ctx.beginPath()
  drawingPoints.forEach((p, index) => index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
  ctx.stroke()
  drawingPoints.forEach((p) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawOpening(opening) {
  const placement = openingPlacement(opening)
  if (!placement) return
  const selectedOpening = selected.kind === 'opening' && selected.id === opening.uid
  ctx.save()
  ctx.translate(placement.x, placement.y)
  ctx.rotate(placement.angle)
  ctx.lineCap = 'round'
  ctx.lineWidth = selectedOpening ? 13 : opening.type === 'door' ? 8 : 10
  ctx.strokeStyle = opening.type === 'door' ? '#f4f0ec' : '#8ec5d9'
  line(-opening.width / 2, 0, opening.width / 2, 0)
  if (opening.type === 'door') {
    ctx.strokeStyle = '#8f7c62'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(-opening.width / 2, 0, opening.width, -Math.PI / 2, 0)
    ctx.stroke()
  }
  ctx.restore()
}

function drawObject(object) {
  const selectedObject = selected.kind === 'object' && object.uid === selected.id
  ctx.save()
  ctx.translate(object.x + object.w / 2, object.y + object.d / 2)
  ctx.rotate((object.rotation * Math.PI) / 180)
  ctx.fillStyle = object.color
  ctx.strokeStyle = selectedObject ? '#2f2a2d' : '#253235'
  ctx.lineWidth = selectedObject ? 4 : 2
  roundRect(-object.w / 2, -object.d / 2, object.w, object.d, 8)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = readableText(object.color)
  ctx.font = '600 16px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(object.name, 0, 0, object.w - 12)
  ctx.restore()
}

function drawRulers(rect) {
  ctx.save()
  ctx.fillStyle = 'rgba(230, 225, 227, 0.92)'
  ctx.strokeStyle = '#b9b1b5'
  ctx.lineWidth = 1
  const rulerHeight = 28
  const rulerWidth = 34
  const yBase = rect.height - rulerHeight
  const xBase = rect.width - rulerWidth
  ctx.fillRect(0, yBase, rect.width, rulerHeight)
  ctx.fillRect(xBase, 0, rulerWidth, rect.height)
  ctx.strokeRect(0, yBase, rect.width, rulerHeight)
  ctx.strokeRect(xBase, 0, rulerWidth, rect.height)
  ctx.fillStyle = '#2f2a2d'
  ctx.font = '10px system-ui'
  const start = screenToWorldCoords(0, 0)
  const end = screenToWorldCoords(rect.width, rect.height)
  for (let x = Math.floor(start.x / 50) * 50; x <= end.x; x += 50) {
    const sx = worldToScreen({ x, y: 0 }).x
    ctx.beginPath()
    ctx.moveTo(sx, yBase)
    ctx.lineTo(sx, yBase + 10)
    ctx.stroke()
    if (x % 100 === 0) ctx.fillText(`${x}`, sx + 3, yBase + 21)
  }
  for (let y = Math.floor(start.y / 50) * 50; y <= end.y; y += 50) {
    const sy = worldToScreen({ x: 0, y }).y
    ctx.beginPath()
    ctx.moveTo(xBase, sy)
    ctx.lineTo(xBase + 12, sy)
    ctx.stroke()
    if (y % 100 === 0) {
      ctx.save()
      ctx.translate(xBase + 24, sy - 3)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(`${y}`, 0, 0)
      ctx.restore()
    }
  }
  ctx.restore()
}

function renderThree() {
  if (!renderer) return
  const rect = threeHost.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return
  renderer.setSize(rect.width, rect.height, false)
  camera.aspect = rect.width / rect.height
  camera.updateProjectionMatrix()
  rebuildScene()
  renderer.render(scene, camera)
}

function initThree() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  threeHost.appendChild(renderer.domElement)
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#ebebeb')
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(4.5, 4.2, 5.4)
  controls = new OrbitControls(camera, renderer.domElement)
  gltfLoader = new GLTFLoader()
  controls.enableDamping = true
  controls.target.set(3, 0.7, 2.2)
  controls.addEventListener('change', () => renderer.render(scene, camera))
  animateThree()
}

function animateThree() {
  requestAnimationFrame(animateThree)
  if (state.mode === '3d') {
    controls.update()
    renderer.render(scene, camera)
  }
}

function rebuildScene() {
  scene.clear()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8c8c8c, 2))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(2, 6, 4)
  scene.add(sun)

  const bounds = roomBounds()
  const floor = floorStyles.find((item) => item.id === state.room.floorStyle) ?? floorStyles[0]
  const shape = new THREE.Shape()
  state.room.points.forEach((point, index) => {
    const x = (point.x - bounds.x) * CM_TO_M
    const y = (point.y - bounds.y) * CM_TO_M
    if (index) shape.lineTo(x, y)
    else shape.moveTo(x, y)
  })
  const floorMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshStandardMaterial({ color: floor.a, roughness: 0.78, side: THREE.DoubleSide })
  )
  floorMesh.rotation.x = -Math.PI / 2
  scene.add(floorMesh)

  const wallMat = new THREE.MeshStandardMaterial({ color: state.room.wallColor, roughness: 0.65 })
  const h = state.room.height * CM_TO_M
  wallSegments().forEach((wall) => {
    const length = wall.length * CM_TO_M
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, h, 0.1), wallMat)
    const midX = ((wall.a.x + wall.b.x) / 2 - bounds.x) * CM_TO_M
    const midZ = ((wall.a.y + wall.b.y) / 2 - bounds.y) * CM_TO_M
    mesh.position.set(midX, h / 2, midZ)
    mesh.rotation.y = -wall.angle
    scene.add(mesh)
  })

  state.openings.forEach((opening) => {
    const placement = openingPlacement(opening)
    if (!placement) return
    const isWindow = opening.type === 'window'
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(opening.width * CM_TO_M, opening.type === 'door' ? 2.05 : 0.75, 0.04),
      new THREE.MeshStandardMaterial({
        color: opening.type === 'door' ? '#8f7c62' : '#bfe9f4',
        emissive: isWindow ? '#9fd6ee' : '#000000',
        emissiveIntensity: isWindow ? 0.45 : 0,
        transparent: true,
        opacity: opening.type === 'door' ? 0.74 : 0.62,
        roughness: 0.24,
      })
    )
    marker.position.set((placement.x - bounds.x) * CM_TO_M, opening.type === 'door' ? 1.02 : 1.55, (placement.y - bounds.y) * CM_TO_M)
    marker.rotation.y = -placement.angle
    scene.add(marker)
    if (isWindow) addWindowLight(placement, bounds, h)
  })

  state.objects.forEach((object) => {
    if (object.model) {
      addModelObject(object, bounds)
      return
    }
    const procedural = createProceduralObject(object, bounds)
    if (procedural) scene.add(procedural)
    else addPlaceholderObject(object, bounds)
  })
}

function addWindowLight(placement, bounds, roomHeight) {
  const center = polygonCentroid(state.room.points)
  const windowX = (placement.x - bounds.x) * CM_TO_M
  const windowZ = (placement.y - bounds.y) * CM_TO_M
  const centerX = (center.x - bounds.x) * CM_TO_M
  const centerZ = (center.y - bounds.y) * CM_TO_M
  const nx = Math.cos(placement.angle + Math.PI / 2)
  const nz = -Math.sin(placement.angle + Math.PI / 2)
  const toCenterX = centerX - windowX
  const toCenterZ = centerZ - windowZ
  const normalFacesCenter = nx * toCenterX + nz * toCenterZ > 0
  const inwardX = normalFacesCenter ? nx : -nx
  const inwardZ = normalFacesCenter ? nz : -nz

  const light = new THREE.SpotLight(0xfff0cf, 3.6, 8, Math.PI / 5.5, 0.72, 1.35)
  light.position.set(windowX - inwardX * 0.35, Math.min(roomHeight - 0.4, 1.95), windowZ - inwardZ * 0.35)
  light.target.position.set(centerX, 0.45, centerZ)
  scene.add(light, light.target)

  const glow = new THREE.PointLight(0xd8f4ff, 0.7, 2.4, 1.6)
  glow.position.set(windowX + inwardX * 0.12, 1.55, windowZ + inwardZ * 0.12)
  scene.add(glow)
}

function addModelObject(object, bounds) {
  const cached = modelCache.get(object.model)
  if (!cached) {
    gltfLoader.load(object.model, (gltf) => {
      modelCache.set(object.model, gltf.scene)
      renderThree()
    })
    addPlaceholderObject(object, bounds)
    return
  }

  const model = cached.clone(true)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxSide = Math.max(size.x, size.z, 0.001)
  const targetSide = Math.max(object.w, object.d) * CM_TO_M
  const scale = targetSide / maxSide
  model.scale.setScalar(scale)

  const scaledBox = new THREE.Box3().setFromObject(model)
  const center = scaledBox.getCenter(new THREE.Vector3())
  model.position.set(
    -center.x + (object.x + object.w / 2 - bounds.x) * CM_TO_M,
    -scaledBox.min.y,
    -center.z + (object.y + object.d / 2 - bounds.y) * CM_TO_M
  )
  model.rotation.y = -(object.rotation * Math.PI) / 180
  scene.add(model)
}

function addPlaceholderObject(object, bounds) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(object.w * CM_TO_M, 0.55, object.d * CM_TO_M),
    new THREE.MeshStandardMaterial({ color: object.color, roughness: 0.56 })
  )
  mesh.position.set((object.x + object.w / 2 - bounds.x) * CM_TO_M, 0.275, (object.y + object.d / 2 - bounds.y) * CM_TO_M)
  mesh.rotation.y = -(object.rotation * Math.PI) / 180
  scene.add(mesh)
}

function createProceduralObject(object, bounds) {
  const w = object.w * CM_TO_M
  const d = object.d * CM_TO_M
  const group = new THREE.Group()
  const material = (color, options = {}) => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.58,
    metalness: 0.03,
    ...options,
  })
  const main = material(object.color)
  const dark = material(shadeColor(object.color, -28))
  const light = material(shadeColor(object.color, 24))
  const wood = material('#8a6647')
  const black = material('#2c2a29', { roughness: 0.5 })
  const fabric = material('#f2ede4', { roughness: 0.78 })

  const box = (sx, sy, sz, x, y, z, mat = main) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat)
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }
  const cylinder = (radiusTop, radiusBottom, height, x, y, z, mat = main, segments = 28) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat)
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }
  const sphere = (sx, sy, sz, x, y, z, mat = main) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), mat)
    mesh.scale.set(sx, sy, sz)
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }

  if (object.type === 'sofa') {
    box(w * 0.9, 0.2, d * 0.68, 0, 0.22, d * 0.06, main)
    box(w * 0.92, 0.55, d * 0.16, 0, 0.46, -d * 0.34, dark)
    box(w * 0.11, 0.4, d * 0.74, -w * 0.46, 0.33, 0.02, dark)
    box(w * 0.11, 0.4, d * 0.74, w * 0.46, 0.33, 0.02, dark)
    box(w * 0.26, 0.14, d * 0.22, -w * 0.2, 0.42, -d * 0.2, light)
    box(w * 0.26, 0.14, d * 0.22, w * 0.2, 0.42, -d * 0.2, light)
    ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(0.07, 0.16, 0.07, x * w * 0.37, 0.08, z * d * 0.28, black))
  } else if (object.type === 'table') {
    box(w, 0.09, d, 0, 0.76, 0, wood)
    ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(0.08, 0.72, 0.08, x * w * 0.42, 0.37, z * d * 0.38, dark))
    box(w * 0.72, 0.06, 0.08, 0, 0.61, -d * 0.34, dark)
    box(w * 0.72, 0.06, 0.08, 0, 0.61, d * 0.34, dark)
  } else if (object.type === 'bed') {
    box(w, 0.18, d, 0, 0.16, 0, dark)
    box(w * 0.92, 0.24, d * 0.82, 0, 0.36, d * 0.04, fabric)
    box(w * 0.92, 0.08, d * 0.46, 0, 0.54, d * 0.18, light)
    box(w * 0.92, 0.74, d * 0.08, 0, 0.52, -d * 0.47, dark)
    box(w * 0.34, 0.1, d * 0.16, -w * 0.22, 0.55, -d * 0.32, material('#ffffff', { roughness: 0.82 }))
    box(w * 0.34, 0.1, d * 0.16, w * 0.22, 0.55, -d * 0.32, material('#ffffff', { roughness: 0.82 }))
  } else if (object.type === 'desk') {
    box(w, 0.08, d, 0, 0.74, 0, main)
    box(w * 0.28, 0.56, d * 0.72, -w * 0.32, 0.42, 0, dark)
    box(w * 0.5, 0.06, d * 0.08, w * 0.2, 0.48, -d * 0.32, dark)
    ;[[0.39, -0.32], [0.39, 0.32]].forEach(([x, z]) => box(0.07, 0.68, 0.07, x * w, 0.37, z * d, black))
    box(w * 0.22, 0.025, d * 0.16, w * 0.12, 0.79, -d * 0.12, material('#d7e7e9', { roughness: 0.34 }))
  } else if (object.type === 'plant') {
    cylinder(w * 0.18, w * 0.24, 0.3, 0, 0.15, 0, material('#9b6a43'))
    cylinder(0.025, 0.035, 0.42, 0, 0.5, 0, material('#5f6f3f'))
    const leafMat = material('#3f8b5e', { roughness: 0.7 })
    ;[
      [-0.16, 0.78, 0.04, 0.32],
      [0.16, 0.84, -0.02, -0.28],
      [0.02, 0.94, 0.14, 0.08],
      [-0.03, 0.7, -0.16, -0.62],
      [0.0, 1.04, -0.02, 0.55],
    ].forEach(([x, y, z, rot]) => {
      const leaf = sphere(w * 0.22, 0.08, w * 0.12, x, y, z, leafMat)
      leaf.rotation.z = rot
    })
  } else if (object.type === 'rug') {
    box(w, 0.025, d, 0, 0.018, 0, main)
    box(w * 0.92, 0.008, d * 0.08, 0, 0.036, -d * 0.22, light)
    box(w * 0.92, 0.008, d * 0.08, 0, 0.037, d * 0.22, dark)
  } else if (object.type === 'lamp') {
    cylinder(w * 0.22, w * 0.24, 0.05, 0, 0.025, 0, black)
    cylinder(0.025, 0.025, 1.1, 0, 0.58, 0, material('#5f5d59', { metalness: 0.25, roughness: 0.34 }))
    cylinder(w * 0.16, w * 0.28, 0.32, 0, 1.21, 0, material('#f0d67a', { roughness: 0.46, emissive: '#5f4a14', emissiveIntensity: 0.18 }))
    sphere(0.08, 0.08, 0.08, 0, 1.07, 0, material('#fff4c5', { emissive: '#ffe496', emissiveIntensity: 0.85 }))
    const lampLight = new THREE.PointLight(0xffdf9a, 1.15, 3.2, 1.8)
    lampLight.position.set(0, 1.08, 0)
    group.add(lampLight)
  } else {
    return null
  }

  group.position.set((object.x + object.w / 2 - bounds.x) * CM_TO_M, 0, (object.y + object.d / 2 - bounds.y) * CM_TO_M)
  group.rotation.y = -(object.rotation * Math.PI) / 180
  return group
}

function shadeColor(color, amount) {
  const value = Number.parseInt(color.replace('#', ''), 16)
  const clampChannel = (channel) => clamp(channel + amount, 0, 255)
  const r = clampChannel(value >> 16)
  const g = clampChannel((value >> 8) & 0xff)
  const b = clampChannel(value & 0xff)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function addCatalogueItem(id) {
  const item = catalogue.find((entry) => entry.id === id)
  if (!item) return
  const bounds = roomBounds()
  const object = {
    uid: crypto.randomUUID(),
    type: item.id,
    name: item.name,
    x: snap(bounds.x + bounds.width / 2 - item.w / 2),
    y: snap(bounds.y + bounds.height / 2 - item.d / 2),
    w: item.w,
    d: item.d,
    color: item.color,
    model: item.model,
    rotation: 0,
  }
  if (!isPlacementValid(object)) {
    const center = polygonCentroid(state.room.points)
    object.x = center.x - item.w / 2
    object.y = center.y - item.d / 2
  }
  state.objects.push(object)
  selected = { kind: 'object', id: object.uid }
  commit()
  render()
}

function addOpening(type) {
  const wall = wallSegments()[selectedWallIndex] ?? wallSegments()[0]
  const width = type === 'door' ? 92 : 140
  state.openings.push({
    uid: crypto.randomUUID(),
    type,
    wallIndex: wall.index,
    offset: clamp(wall.length / 2, width / 2, wall.length - width / 2),
    width,
  })
  selected = { kind: 'opening', id: state.openings.at(-1).uid }
  commit()
  render()
}

function updateSelectedObject(input) {
  const object = state.objects.find((item) => item.uid === selected.id)
  if (!object) return
  const previous = { ...object }
  const key = input.dataset.object
  object[key] = input.type === 'number' || input.type === 'range' ? Number(input.value) : input.value
  if (!isPlacementValid(object)) Object.assign(object, previous)
  commit()
  render()
}

function updateSelectedOpening(input) {
  const opening = state.openings.find((item) => item.uid === selected.id)
  if (!opening) return
  const wall = wallSegments()[opening.wallIndex]
  const key = input.dataset.openingField
  opening[key] = Number(input.value)
  opening.width = clamp(opening.width, 45, Math.max(45, wall.length - 20))
  opening.offset = clamp(opening.offset, opening.width / 2, wall.length - opening.width / 2)
  commit()
  render()
}

function deleteSelectedObject() {
  state.objects = state.objects.filter((item) => item.uid !== selected.id)
  selected = { kind: 'object', id: null }
  commit()
  render()
}

function deleteSelectedOpening() {
  state.openings = state.openings.filter((item) => item.uid !== selected.id)
  selected = { kind: 'opening', id: null }
  commit()
  render()
}

function duplicateSelected() {
  if (selected.kind !== 'object') return
  const object = state.objects.find((item) => item.uid === selected.id)
  if (!object) return
  const copy = { ...object, uid: crypto.randomUUID(), name: `${object.name} kopie`, x: object.x + 28, y: object.y + 28 }
  if (isPlacementValid(copy)) {
    state.objects.push(copy)
    selected = { kind: 'object', id: copy.uid }
    commit()
  }
}

function keepObjectsInsideRoom() {
  state.objects.forEach((object) => {
    if (!isPlacementValid(object)) {
      const center = polygonCentroid(state.room.points)
      object.x = center.x - object.w / 2
      object.y = center.y - object.d / 2
    }
  })
}

function hitObject(point) {
  return [...state.objects].reverse().find((object) => (
    point.x >= object.x &&
    point.x <= object.x + object.w &&
    point.y >= object.y &&
    point.y <= object.y + object.d
  ))
}

function hitCorner(point) {
  return state.room.points.findIndex((corner) => distance(point, corner) < 14)
}

function hitWall(point) {
  return wallSegments().find((wall) => distanceToSegment(point, wall.a, wall.b) < 14)
}

function hitOpening(point) {
  return state.openings.find((opening) => {
    const p = openingPlacement(opening)
    if (!p) return false
    return distanceToSegment(point, p.start, p.end) < 16
  })
}

function isPlacementValid(object) {
  const corners = [
    { x: object.x, y: object.y },
    { x: object.x + object.w, y: object.y },
    { x: object.x + object.w, y: object.y + object.d },
    { x: object.x, y: object.y + object.d },
  ]
  if (!corners.every((corner) => pointInPolygon(corner, state.room.points))) return false
  return !state.objects.some((other) => other.uid !== object.uid && rectanglesOverlap(object, other))
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y
}

function openingPlacement(opening) {
  const wall = wallSegments()[opening.wallIndex]
  if (!wall) return null
  const offset = clamp(opening.offset, opening.width / 2, wall.length - opening.width / 2)
  const ux = (wall.b.x - wall.a.x) / wall.length
  const uy = (wall.b.y - wall.a.y) / wall.length
  const x = wall.a.x + ux * offset
  const y = wall.a.y + uy * offset
  return {
    x,
    y,
    angle: wall.angle,
    start: { x: x - ux * opening.width / 2, y: y - uy * opening.width / 2 },
    end: { x: x + ux * opening.width / 2, y: y + uy * opening.width / 2 },
  }
}

function offsetOnWall(point, wallIndex, openingWidth) {
  const wall = wallSegments()[wallIndex]
  const vx = wall.b.x - wall.a.x
  const vy = wall.b.y - wall.a.y
  const t = ((point.x - wall.a.x) * vx + (point.y - wall.a.y) * vy) / (wall.length * wall.length)
  return clamp(t * wall.length, openingWidth / 2, wall.length - openingWidth / 2)
}

function wallSegments() {
  return state.room.points.map((point, index, points) => {
    const next = points[(index + 1) % points.length]
    const length = Math.max(1, distance(point, next))
    return { index, a: point, b: next, length, angle: Math.atan2(next.y - point.y, next.x - point.x) }
  })
}

function roomBounds() {
  const xs = state.room.points.map((p) => p.x)
  const ys = state.room.points.map((p) => p.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

function migrateOpeningsToValidWalls() {
  const walls = wallSegments()
  state.openings.forEach((opening) => {
    opening.wallIndex = clamp(opening.wallIndex ?? 0, 0, walls.length - 1)
    opening.width = clamp(opening.width, 45, Math.max(45, walls[opening.wallIndex].length - 20))
    opening.offset = clamp(opening.offset, opening.width / 2, walls[opening.wallIndex].length - opening.width / 2)
  })
}

function screenToWorld(event) {
  const rect = canvas.getBoundingClientRect()
  return screenToWorldCoords(event.clientX - rect.left, event.clientY - rect.top)
}

function screenToWorldCoords(x, y) {
  return { x: (x - view.panX) / view.zoom, y: (y - view.panY) / view.zoom }
}

function worldToScreen(point) {
  return { x: point.x * view.zoom + view.panX, y: point.y * view.zoom + view.panY }
}

function toolLabel(tool) {
  const labels = {
    select: 'Selecteren',
    room: 'Muren tekenen',
    dimensions: 'Afmetingen',
    openings: 'Ramen en deuren',
    furniture: 'Meubels',
    finish: 'Opmaak',
    accessories: 'Accessoires',
  }
  return labels[tool] ?? 'Roommaker'
}

function closeDrawer(shouldRender = true) {
  drawerTool = null
  if (shouldRender) render()
}

function commit() {
  persist()
  const data = snapshot()
  history = history.slice(0, historyIndex + 1)
  history.push(data)
  historyIndex = history.length - 1
}

function undo() {
  if (historyIndex <= 0) return
  historyIndex -= 1
  state = normalizeProject(JSON.parse(history[historyIndex]))
  persist()
}

function redo() {
  if (historyIndex >= history.length - 1) return
  historyIndex += 1
  state = normalizeProject(JSON.parse(history[historyIndex]))
  persist()
}

function snapshot() {
  return JSON.stringify(state)
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function loadProject() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY)
    return saved ? JSON.parse(saved) : blankProject()
  } catch {
    return blankProject()
  }
}

function normalizeProject(project) {
  const fallback = blankProject()
  const next = { ...fallback, ...project, room: { ...fallback.room, ...(project.room ?? {}) } }
  if (!Array.isArray(next.room.points)) {
    next.room.points = [
      { x: 0, y: 0 },
      { x: next.room.width ?? 620, y: 0 },
      { x: next.room.width ?? 620, y: next.room.depth ?? 460 },
      { x: 0, y: next.room.depth ?? 460 },
    ]
  }
  const wallMap = { north: 0, east: 1, south: 2, west: 3 }
  next.openings = (next.openings ?? []).map((opening) => ({
    uid: opening.uid ?? crypto.randomUUID(),
    type: opening.type ?? 'window',
    wallIndex: opening.wallIndex ?? wallMap[opening.wall] ?? 0,
    offset: opening.offset ?? 80,
    width: opening.width ?? 100,
  }))
  return next
}

function exportProject() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${state.name.replace(/\s+/g, '-').toLowerCase()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function toast(message) {
  const existing = document.querySelector('.toast')
  existing?.remove()
  const element = document.createElement('div')
  element.className = 'toast'
  element.textContent = message
  document.body.appendChild(element)
  window.setTimeout(() => element.remove(), 1400)
}

function drawWallLength(wall) {
  const mx = (wall.a.x + wall.b.x) / 2
  const my = (wall.a.y + wall.b.y) / 2
  drawDimension(mx, my - 22, `${Math.round(wall.length)} cm`)
}

function drawDimension(x, y, text) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#2f2a2d'
  ctx.font = '700 12px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const metrics = ctx.measureText(text)
  ctx.fillStyle = 'rgba(230, 225, 227, 0.92)'
  roundRect(-metrics.width / 2 - 7, -11, metrics.width + 14, 22, 6)
  ctx.fill()
  ctx.fillStyle = '#2f2a2d'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

function line(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function pointInPolygon(point, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function polygonCentroid(points) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function distanceToSegment(point, a, b) {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const lengthSq = vx * vx + vy * vy
  const t = clamp(((point.x - a.x) * vx + (point.y - a.y) * vy) / lengthSq, 0, 1)
  return distance(point, { x: a.x + vx * t, y: a.y + vy * t })
}

function snap(value) {
  return state.showGrid ? Math.round(value / 10) * 10 : value
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char])
}

function readableText(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 135 ? '#243034' : '#ffffff'
}
