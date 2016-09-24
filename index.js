'use strict';
const electron = require('electron');

const app = electron.app;
const ipcMain = electron.ipcMain;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new electron.BrowserWindow({
    width: 1024,
    height: 768
  });

  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', onClosed);

  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
});

const fs = require('fs');
const dialog = electron.dialog;
ipcMain.on('sendImage', function(event, arg) {
  dialog.showSaveDialog(
    mainWindow,
    {
      title: '画像の保存先選択',
      buttonLabel: '保存'
    },
    function(filename) {
      let path = filename + '.png';
      let bin = arg;
      fs.writeFile(path, bin, 'base64', function(error) {
        if (error) {
          console.error(error);
          event.sender.send('sendImageComplete', false);
          return ;
        }
        event.sender.send('sendImageComplete', true);
        return ;
      });
    }
  );
});