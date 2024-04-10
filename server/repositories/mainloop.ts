

export class Mainloop {
  private static running: boolean = false;
  private static loops: CallableFunction[] = [];

  static register(loop: CallableFunction) {
    Mainloop.loops.push(loop);
  }

  static start() {
    if (!Mainloop.running) {
      Mainloop.running = true;
      Mainloop.loop();
    }
  }

  private static loop() {
    if (!Mainloop.running) return;

    Mainloop.loops.forEach(loop => loop());

    setImmediate(Mainloop.loop);
  }

  static stop() {
    Mainloop.running = false;
  }
}
