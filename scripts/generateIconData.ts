import * as fs from 'fs'
import * as path from 'path'

// Path to the folder containing the icons
const iconsFolder = path.join(__dirname, '..', 'public', 'icons')

// Read all PNG files from the folder
const readIcons = () => {
  return new Promise<Array<string>>((resolve, reject) => {
    fs.readdir(iconsFolder, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      // Filter only PNG files
      const pngFiles = files.filter((file) => path.extname(file).toLowerCase() === '.png')
      resolve(pngFiles)
    })
  })
}

// Write the array to the file
const writeToFile = (array: Array<string>) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '..', 'src', 'icons.data.ts')
    const content = `export default ${JSON.stringify(array)};\n`

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

// Execute the script
readIcons()
  .then((files) => {
    return writeToFile(files)
  })
  .then(() => {
    console.log('Icons data file generated successfully.')
  })
  .catch((err) => {
    console.error('Error generating icons data file:', err)
  })
