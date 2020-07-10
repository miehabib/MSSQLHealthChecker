const electron = require('electron');   

const {app, BrowserWindow, Menu, ipcMain} = electron;

const { remote } = require('electron');

// Set env
process.env.NODE_ENV = 'dev'; // production || dev
 
const webPref = {nodeIntegration: true};
let mainWindow; 
let connectionWindow;

// Listen for app to be ready
app.on('ready', function(){ 

    // Create main and connection window on first load
    mainWindow = new BrowserWindow({ webPreferences: webPref}); 
    connectionWindow = new BrowserWindow({ webPreferences: webPref, width: 500, height:430, parent:mainWindow, modal:true, minimizable: false,maximizable: false});
 
    mainWindow.loadURL(`file://${__dirname}/../html/mainWindow.html`); 
    connectionWindow.loadURL(`file://${__dirname}/../html/connectionWindow.html`);

    // Hide Menu from connection window in releas mode. 
    if(process.env.NODE_ENV == 'production')
        connectionWindow.setMenuBarVisibility(false)

    // Hide window instead of close
    connectionWindow.on('close', (e)=>{
        e.preventDefault(); 
        connectionWindow.hide();
    });
    
    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[ 
            {
                label: 'Change Connection',
                accelerator: process.platform == 'darwin' ? 'Command+W': 'Ctrl+W',
                click(){
                    connectionWindow.show(); 
                }
            },
            {
                label: 'New',
                accelerator: process.platform == 'darwin' ? 'Command+N': 'Ctrl+N',
                click(){ 
                    mainWindow.webContents.send('tab:new'); 
                }
            }, 
            {
                label: 'Run',
                accelerator: 'F5',
                click(){ 
                    mainWindow.webContents.send('script:run'); 
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
                    accelerator: process.platform == 'darwin' ? 'F12': 'F12',
                    click(item, focusedWindow){
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    label:'Reload',
                    accelerator: process.platform == 'darwin' ? 'Command+F5': 'Ctrl+F5',
                    role:'forceReload'
                }
            ]           
        }
    );
}
   
// Catch when user change connection
ipcMain.on('connection:change', function(e, conn){  
    mainWindow.webContents.send('connection:change', conn); 
});

