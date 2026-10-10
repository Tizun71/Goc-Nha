// SPDX-License-Identifier: AGPL-3.0-or-later

// All lengths are centimetres. The room's x axis is its length, y axis its width.

export type Room = {
  length: number // x
  width: number // y
  height: number
  /** Screen angle (degrees clockwise from the top of the plan) that north points to. Missing in old saves = 0. */
  north?: number
}

export type Wall = 'top' | 'right' | 'bottom' | 'left'

export type FloorKind =
  // original set
  | 'wardrobe' | 'desk' | 'bookshelf' | 'bed' | 'chair' | 'fishboneShelf' | 'safe' | 'fan' | 'laundryBasket'
  | 'nightstand' | 'rug' | 'ceilingLight' | 'tableLamp' | 'plant'
  // beds
  | 'platformBed' | 'canopyBed' | 'upholsteredBed' | 'storageBed' | 'tatamiBed' | 'daybed'
  // storage
  | 'armoire' | 'chestOfDrawers' | 'openShelving' | 'cabinet'
  // tables
  | 'writingDesk' | 'consoleTable' | 'coffeeTable' | 'sideTable' | 'diningTable'
  // seating
  | 'accentChair' | 'loungeChair' | 'rockingChair' | 'beanBag' | 'readingChair'
  // lighting
  | 'floorLamp' | 'pendantLight' | 'candleHolder'
  // textiles and rugs
  | 'throwBlanket' | 'knittedBlanket' | 'duvet' | 'pillowCushion' | 'floorCushion'
  | 'shagRug' | 'juteRug' | 'persianRug' | 'layeredRug'
  // plants and pots
  | 'monstera' | 'fiddleLeafFig' | 'snakePlant' | 'pothos' | 'oliveTree' | 'bonsai' | 'pampasGrass'
  | 'ceramicPot' | 'terracottaPot' | 'plantStand' | 'hangingPlanter'
  // lifestyle corners
  | 'bookStack' | 'coffeeStation' | 'coffeeCart' | 'espressoMachine' | 'recordPlayer' | 'vinylShelf' | 'speaker' | 'projector'

export type WallKind =
  | 'door' | 'window' | 'curtain' | 'wallHook' | 'airConditioner' | 'wallLamp' | 'ledStrip' | 'fluorescentLamp'
  | 'powerOutlet' | 'wallPainting' | 'wallFan'
  | 'floatingShelf' | 'ropeShelf' | 'stringLights' | 'mugShelf'
  | 'galleryWall' | 'framedPoster' | 'canvasArt' | 'wallMirror' | 'fullLengthMirror' | 'woodPanel' | 'floatingFrame' | 'wallClock'
export type Kind = FloorKind | WallKind

/** Item on the floor. (x, y) is the centre of its footprint; local y points to its front. */
export type FloorItem = {
  id: string
  mount: 'floor'
  kind: FloorKind
  x: number
  y: number
  w: number // "dài": along local x
  d: number // "rộng/sâu": along local y
  h: number
  rotation: number // degrees, clockwise on screen
  color?: string
}

/** Item fixed to a wall. offset is measured along the wall, clockwise from its start corner. */
export type WallItem = {
  id: string
  mount: 'wall'
  kind: WallKind
  wall: Wall
  offset: number
  w: number
  h: number
  elevation: number
  hinge?: 'left' | 'right'
  opening?: 'in' | 'out'
  color?: string
}

export type Item = FloorItem | WallItem

export type RoomDoc = {
  room: Room
  items: Item[]
}
