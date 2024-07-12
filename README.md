# Iovie Prototype
A web based prototype for my iovie game, with custom data definition systems and coffeescript scripting.

To know fully what things are done and what are missing check `todo.txt` and if you want to see what things i am currently going to do open `doing.txt`.

To contribute just contribute, just pr and i'll accept.

Here's a list of things i am using incase u want to check it:
  + `mongodb`
  + `node`
  + `three`
  + `vite`
  + `coffeescript`

To run this, you will need a mongodb database, here's how i did it:
```bash
podman run --detach --name mongodb -p 27017:27017 -v /home/[user]/db-mongo docker.io/mongodb/mongodb-community-server:latest
```
and simply:
```bash
podman start mongodb
```

YOU NEED BUN FOR THIS, but if u have bun, then just do this.
```bash
node server.js
```

There are some fucked up stuff, and i might fix them, but for now if it runs it runs.