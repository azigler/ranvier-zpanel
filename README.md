# ranvier-zpanel

> Web-based control panel and building client for Ranvier

Create and modify game data for Ranvier via a web app. Built with [mithril-starter-kit](https://github.com/dhinesh03/mithril-starter-kit).

To use this bundle, you will need a specific checkout of Ranvier. You __MUST__ use my experimental fork ([azigler/zigmud](https://github.com/azigler/zigmud)) alongside a checkout of my experimental core:develop branch ([azigler/core:develop](https://github.com/azigler/core/tree/develop)).

This bundle __WILL NOT WORK__ with a [regular Ranvier checkout](https://github.com/RanvierMUD/ranviermud).

As of now, this bundle has only been tested with [ranvier-datasource-couchdb](https://github.com/azigler/ranvier-datasource-couchdb) serving all entity data.

This bundle requires Ranvier to be using at least [Node v12.18.2 LTS](https://nodejs.org/en/blog/release/v12.18.2/).

### Instructions

1. Install this bundle in your Ranvier repository.

2. Update `zPanel` in your `ranvier.json` to include the port and URL you'll use for the web client:

```
"zPanel": {
    "port": 4335,
    "url": "localhost"
  },
```

3. Add `zpanel: true` to the `Account` metadata of whomover can access zPanel and the accompanying API.

4. When the server next starts, the app will compile and serve zPanel at the address provided (e.g., `localhost:4335`). Navigate to the address to log in and begin editing.

### Usage

Currently this tool allows for the creation of very basic area, room, item, and NPC entities. When items and NPCs are created and updated they can be immediately spawned into the game from the new definition. At this time, you must reboot the server in order to see changes to rooms.

### Extending

The app is built with [Mithril](https://mithril.js.org/index.html) and [Construct-ui](https://vrimar.github.io/construct-ui/). You can use the `npm start` package script to run a Webpack development server for the Mithril app, but you will also need to run the game server to launch the API so it may be more effective to just reboot Ranvier when needed. The API is built with [hapi](https://hapi.dev/) and uses an HTTP cookie for authentication. You can readily add to the API and expand on the provided interface options since everything in the app potentially has access to state via the `server-event` that launches this bundle.