// Modules to control application life and create native browser window
const path = require('path')
const { app, BrowserWindow } = require('electron')
const { port } = require('./port.json')
app.commandLine.appendSwitch('remote-debugging-port', port)

app.whenReady().then(() => {
  win()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) win()
  })
})

app.on('window-all-closed', function () { if (process.platform !== 'darwin') app.quit() })

function win () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
  win.webContents.openDevTools()
}
