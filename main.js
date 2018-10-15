const { app, BrowserWindow, Menu, ipcMain, Tray} = require('electron')
const exec = require('child_process').exec;
const path = require('path')
const util = require('util')
const fs = require('fs')
const stat = util.promisify(fs.stat)

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};

let mainWindow
let tray = null

app.on('ready', () => {
    const htmlPath = path.join('src', 'index.html')
    
    mainWindow = new BrowserWindow
    // mainWindow.setMenu(null);
    mainWindow.loadFile(htmlPath)

    const template = [
        {
          label: 'Edit',
          submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
          ]
        },
        {
          label: 'View',
          submenu: [
            {role: 'reload'},
            {role: 'forcereload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
          ]
        },
        {
          role: 'window',
          submenu: [
            {role: 'minimize'},
            {role: 'close'}
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click () { require('electron').shell.openExternal('https://electronjs.org') }
            }
          ]
        }
      ]

    tray = new Tray('./database.png')
    const contextMenu = Menu.buildFromTemplate(template)
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
})

ipcMain.on('files', async (event, filesArr) => {
    try {
        const data = await Promise.all(
            filesArr.map(async ({name, pathName}) => ({
                ...await stat(pathName),
                name,
                pathName
            }))
        )

        mainWindow.webContents.send('metadata', data)
    } catch (error) {
        mainWindow.webContents.send('metadata:error', error)
    }
})