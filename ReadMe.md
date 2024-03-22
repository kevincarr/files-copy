# NPM  
# Programming
## Starting Application 
1. Run `npm start`
    - Run `npm stop`
    - If port is busy see: `# Port 9000 issue/solution` (line 86-ish)

## Install application
1. Run `npm install`

## Stopping the Application  
1. Press `Ctrl` & `c` in the terminal  

## Building a testing application
1. Run `npm run make`
  - The builds will be created in the out folder

## ASAR File issues (copying)
[](https://www.electronjs.org/docs/latest/tutorial/asar-archives#treating-an-asar-archive-as-a-normal-file)

## Port Busy issue/solution
```
[doc](https://js.electronforge.io/plugin/webpack/interfaces/webpackpluginconfig__;!!BBM_p3AAtQ!PF4kHC9a1dzqiNApB99LZA-Jo-mdKpR3Jb4o7OOKeIQCXdYA4IPwvqwE6cawOmWn6lj3qOMj8oVAl80JQjEtudc$)

The devServer.port is probably overwritten by electron-forge, and the values for the config are set in forge.config.js:
{
  "name": "my-project",
  // ...
  "config": {
    "forge": {
      "packagerConfig": {},
      "makers": [
        // ...
      ],
      "plugins": [
        [
          "@electron-forge/plugin-webpack",
          {
            "mainConfig": "./webpack.main.config.js",
            "renderer": {
              "config": "./webpack.renderer.config.js",
              "entryPoints": [
                {
                  "html": "./src/index.html",
                  "js": "./src/renderer.js",
                  "name": "main_window"
                }
              ]
            },

            // Solution for: `EADDRINUSE: address already in use`
            "port": 3001,
            "loggerPort": 4001
          }
        ]
      ]
    }
  }
}
```