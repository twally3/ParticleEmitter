import Emitter from './Emitter.js';

export default class Smoke {
  constructor(container, { width, height }) {
    let canvas = container;

    canvas.width = width;
    canvas.height = height;

    let ctx = canvas.getContext('2d');
    let noiseCanvas = this.makeOctaveNoise(width, height, 8);

    let green = new Emitter({
      name: 'left',
      maxAge: 300,
      width: canvas.width,
      height: canvas.height,
      damping: 0.75,
      exposure: 0.05,
      intensity: 1.0,
      noiseCanvas: noiseCanvas,
      color: {
        r: 57,
        g: 124,
        b: 191
      },
      x: 0,
      y: canvas.height * 0.5,
      velocity: {
        x: 1,
        y: 0
      }
    });

    this.canvas = canvas;
    this.ctx = ctx;
    this.emitters = [green];

    this.update = this.update.bind(this);
    this.loop = this.loop.bind(this);
    this.loop();
  }

  update() {
    let ctx = this.ctx,
      canvas = this.canvas;

    ctx.globalCompositeOperation = 'normal';
    ctx.fillStyle = 'rgba(5, 15, 16, 1.00)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.ctx.globalCompositeOperation = 'lighter';
    this.emitters.forEach(emitter => {
      emitter.update();
      this.ctx.drawImage(emitter.canvas, 0, 0);
      emitter.ctx.restore();
    });
  }

  loop() {
    this.update();
    window.requestAnimationFrame(this.loop);
  }

  makeNoise(width, height) {
    let canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    let imgData = ctx.getImageData(0, 0, width, height),
      data = imgData.data,
      pixels = data.length;

    for (let i = 0; i < pixels; i += 4) {
      data[i] = Math.random() * 255;
      data[i + 1] = Math.random() * 255;
      data[i + 2] = Math.random() * 255;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    return canvas;
  }

  makeOctaveNoise(width, height, octaves) {
    let canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 1 / octaves;
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < octaves; i++) {
      let octave = this.makeNoise(width >> i, height >> i);
      ctx.drawImage(octave, 0, 0, width, height);
    }
    return canvas;
  }
}