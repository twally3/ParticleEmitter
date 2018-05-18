let { random, times, assign } = _;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const defaults = {
  maxAge: 70,
  exposure: 0.1,
  damping: 0.8,
  noise: 1.0,
  fuzz: 1.0,
  intensity: 1.0,
  vx: 10,
  vy: 10,
  spawn: 5,
  octaves: 8,
  color: {
    r: 25,
    g: 100,
    b: 75
  },
  width: WIDTH,
  height: HEIGHT,
  x: WIDTH * 0.5,
  y: HEIGHT * 0.5,
  velocity: {
    x: random(-0.5, 0.5, true),
    y: random(-0.5, 0.5, true)
  }
};

export default class Emitter {
  constructor(options) {
    assign(this, defaults, options);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

    this.noiseData = this.noiseCanvas.getContext('2d').getImageData(0, 0, this.width, this.height).data;
    this.particles = [];

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
    this.data = this.imgdata.data;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.hdrdata = [];
    times(this.noiseData.length, n => {
      this.hdrdata[n] = 0;
    });

    this.update = this.update.bind(this);
  }

  tonemap(n) {
    return (1 - Math.pow(2, -n * 0.005 * this.exposure)) * 255;
  }

  getNoise(x, y, channel) {
    return this.noiseData[(~~x + ~~y * this.width) * 4 + channel] / 127 - 1.0;
  }

  update() {
    if (this.x < 0 || this.x > this.width) return;
    if (this.y < 0 || this.y > this.height) return;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    let { x, y, vx, vy, width, color, maxAge, damping, noise, fuzz, intensity, spawn } = this;
    let { r, g, b } = color;

    times(spawn, _n => {
      this.particles.push({
        vx: this.fuzzy(vx),
        vy: this.fuzzy(vy),
        x: x,
        y: y,
        age: 0
      });
    });

    let alive = [];

    this.particles.forEach(p => {
      p.vx = p.vx * damping + this.getNoise(p.x, p.y, 0) * 4 * noise + this.fuzzy(0.1) * fuzz;
      p.vy = p.vy * damping + this.getNoise(p.x, p.y, 1) * 4 * noise + this.fuzzy(0.1) * fuzz;

      p.age++;

      times(10, _x => {
        p.x += p.vx * 0.1;
        p.y += p.vy * 0.1;
        let index = (~~p.x + ~~p.y * width) * 4;
        this.data[index] = this.tonemap(this.hdrdata[index] += r * intensity);
        this.data[index + 1] = this.tonemap(this.hdrdata[index + 1] += g * intensity);
        this.data[index + 2] = this.tonemap(this.hdrdata[index + 2] += b * intensity);
      });

      if (p.age < maxAge) alive.push(p);
    });

    this.ctx.putImageData(this.imgdata, 0, 0);
    this.particles = alive;
  }

  fuzzy(range, base) {
    return (base || 0) + (Math.random() - 0.5) * range * 2;
  }
}