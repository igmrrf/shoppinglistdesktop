const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

//Set ENV
// process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;
//Listen for app to be ready
app.on("ready", () => {
    //create new window
    mainWindow = new BrowserWindow({
        //Solving the require not defined
        webPreferences: {
            nodeIntegration: true,
        },
    });

    //Load html into window
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "mainWindow.html"),
            protocol: "file",
            slashes: true,
        })
    );

    //quite all apps when main window closes
    mainWindow.on("closed", function () {
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle Create Add window
function createAddWindow() {
    //create new window
    addWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Add shopping List Item",

        //For Uncaught ReferenceError: require is not defined
        webPreferences: {
            nodeIntegration: true,
        },
    });

    //Load html into window
    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "addWindow.html"),
            protocol: "file",
            slashes: true,
        })
    );
    //Garbage collection handle
    addWindow.on("close", function () {
        addWindow = null;
    });
}

//Catch item:add
ipcMain.on("item:add", function (e, item) {
    console.log(item);
    mainWindow.webContents.send("item:add", item);
    addWindow.close();
});

//create menu template
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add Item",
                accelerator:
                    process.platform == "darwin" ? "Command+J" : "Ctrl+j",
                click() {
                    createAddWindow();
                },
            },
            {
                label: "Clear Items",
                click() {
                    mainWindow.webContents.send("item:clear");
                },
            },
            {
                label: "Quit",
                accelerator:
                    process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                click() {
                    app.quit();
                },
            },
        ],
    },
];

//if mac, add empty object to menu
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({});
}

//Add developer tools item it not in production
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator:
                    process.platform == "darwin" ? "Command+I" : "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: "reload",
            },
        ],
    });
}
