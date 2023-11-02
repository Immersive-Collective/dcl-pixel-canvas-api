import { Entity, Transform, GltfContainer, engine } from '@dcl/sdk/ecs'
import { getDatabase, initDatabase } from './api'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { createCanvas, createColor, createColorPicker, createPixel } from './factory'
import { colorPickerHoverSystem, loadingIndicatorSystem, pixelHoverSystem } from './systems'

const canvasWidth = 16
const canvasHeight = 16

const colors = [
  '#FFFFFF', // White
  '#FFFF00', // Yellow
  '#FF7F00', // Orange
  '#FF0000', // Red
  '#FF00FF', // Magenta
  '#800080', // Purple
  '#0000FF', // Blue
  '#00FFFF', // Cyan
  '#008000', // Green
  '#006400', // Dark Green
  '#8B4513', // Brown
  '#D2B48C', // Tan
  '#D3D3D3', // Light Grey
  '#A9A9A9', // Medium Grey
  '#696969', // Dark Grey
  '#000000' // Black
]

// This is the color player paints with
export let playersColor: string = colors[1]
export function updatePlayersColor(hexColor: string) {
  playersColor = hexColor
}

// Make canvas globaly accessable
export const canvas: Entity = createCanvas({
  position: { x: 4, y: 0.25, z: 8 },
  rotation: Quaternion.fromEulerDegrees(0, 0, 0),
  scale: { x: 0.5, y: 0.5, z: 0.5 }
})

export async function main() {



// add tile 

const tile1 = engine.addEntity()
GltfContainer.create(tile1, { src: 'models/CityTile.glb'}) 
//Spinner.create(tile1, { speed: 100 })
Transform.create(tile1, {
position: Vector3.create(8, 0, 8),
scale: Vector3.create(1, 1, 1), 
rotation: Quaternion.fromEulerDegrees(0, 180, 0),
})


// follow player and smooth 

const smoothing = 0.05;

function updateColorPickerPosition() {
  if (!Transform.has(engine.PlayerEntity)) return;

  const playerPos = Transform.get(engine.PlayerEntity).position;
  const pickerTransform = Transform.getMutable(colorPicker);
  const currentPos = pickerTransform.position;

  // Calculate the new position for the color picker entity
  const offset = { x: 1, y: 0.5, z: 1 }; // 0.5 meters above the player
  const targetPosition = {
    x: playerPos.x + offset.x,
    y: playerPos.y + offset.y,
    z: playerPos.z + offset.z
  };

  // Use Lerp for smooth transition
  const newPosition = {
    x: currentPos.x + (targetPosition.x - currentPos.x) * smoothing,
    y: currentPos.y + (targetPosition.y - currentPos.y) * smoothing,
    z: currentPos.z + (targetPosition.z - currentPos.z) * smoothing
  };

  // Update the color picker's position
  pickerTransform.position = newPosition;
}
  
  
// Add the system to continuously update the color picker position
engine.addSystem(updateColorPickerPosition)


 // Create color picker
 const colorPicker = createColorPicker({
  position: { x: 12, y: 0.5, z: 6 },
  rotation: Quaternion.fromEulerDegrees(0, 45, 0),
  scale: { x: 0.25, y: 0.25, z: 0.25 }
})

// Fill color picker with colors
const width = 4
const height = 4
let index = 0
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    createColor(colorPicker, x, y, colors[index])
    index++
  }
}

// Start systems
engine.addSystem(pixelHoverSystem)
engine.addSystem(colorPickerHoverSystem)

  
  // Load pixels from database
  let pixelData = await getDatabase()

  // If there are no pixel, create new ones in database
  if (pixelData.length == 0) {
    // Writes empty pixels into databse
    pixelData = await initDatabase(canvasWidth, canvasHeight, colors[15])
  }
  console.log(pixelData)

  // Fill canvas with pixel from database
  pixelData.forEach((pixel: { posX: number; posY: number; hexColor: string; _id: string }) => {
    createPixel(canvas, pixel.posX, pixel.posY, pixel.hexColor, pixel._id)
  })

 
  // animation bubbles and API colours 

engine.addSystem(loadingIndicatorSystem)


}