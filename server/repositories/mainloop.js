export class Mainloop {
    static register(loop) {
        Mainloop.loops.push(loop);
    }
    static start() {
        if (!Mainloop.running) {
            Mainloop.running = true;
            Mainloop.loop();
        }
    }
    static loop() {
        if (!Mainloop.running)
            return;
        Mainloop.loops.forEach(loop => loop());
        setImmediate(Mainloop.loop);
    }
    static stop() {
        Mainloop.running = false;
    }
}
Mainloop.running = false;
Mainloop.loops = [];
