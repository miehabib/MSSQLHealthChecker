const electron = require('electron');
const url = require('url');
const path = require('path');
const { protocol } = require('electron');
const { createWriteStream } = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set env
process.env.NODE_ENV = 'dev';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // // Create new window
    // mainWindow  = new BrowserWindow({ 
    //     webPreferences: {
    //         nodeIntegration: true
    //     }
    // });
    // // Load html into window
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'mainWindow.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));
    
    mainWindow = createNewWindow('mainWindow');

    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    
    // Buil menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create new window
function createNewWindow(htmlFileName, windowWidth = '', windowHeight = '', windowTitle = ''){
    let newWindow;
    // Create new window
    newWindow  = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        title: windowTitle,
        webPreferences: {
            nodeIntegration: true
        }
    });
    // Load html into window
    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, htmlFileName + '.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    newWindow.on('closed', function(){
        addWindow = null;
    });

    return newWindow;
}

 // Catch item add 
ipcMain.on('item:add', function(e, item){  
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                click(){ 
                    createNewWindow('addWindow', 300, 200, 'Add new Item');
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer item if not in production
if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push(
        {
            label: 'Developer Tools',
            submenu: [
                {
                    label:'Toggle Devtools',
                    accelerator: process.platform == 'darwin' ? 'Command+I': 'Ctrl+I',
                    click(item, focusedWindow){
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role:'reload'
                }
            ]           
        }
    );
}