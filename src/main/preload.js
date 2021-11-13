const { contextBridge, ipcRenderer } = require('electron');
const { readdir } = require('fs/promises');
const { statSync } = require('fs');

contextBridge.exposeInMainWorld('api', {
  directoryContents: async (path) => {
    const results = await readdir(path, { withFileTypes: true });

    return results.map((entry) => {
      const isDir = entry.isDirectory();
      let meta;
      if (!isDir) {
        const result = statSync(path + '/' + entry.name);
        meta = {
          modify: result.mtime,
          change: result.ctime,
          access: result.atime,
        };
      }


      return {
        name: entry.name,
        type: isDir ? 'directory' : 'file',
        meta: isDir ? null : meta,
      };
    });
  },
  currentDirectory: () => {
    return process.cwd();
  },
});

// contextBridge.exposeInMainWorld('electron', {
//   ipcRenderer: {
//     myPing() {
//       ipcRenderer.send('ipc-example', 'ping');
//     },
//     on(channel, func) {
//       const validChannels = ['ipc-example'];
//       if (validChannels.includes(channel)) {
//         // Deliberately strip event as it includes `sender`
//         ipcRenderer.on(channel, (event, ...args) => func(...args));
//       }
//     },
//     once(channel, func) {
//       const validChannels = ['ipc-example'];
//       if (validChannels.includes(channel)) {
//         // Deliberately strip event as it includes `sender`
//         ipcRenderer.once(channel, (event, ...args) => func(...args));
//       }
//     },
//   },
// });
