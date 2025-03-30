// No changes needed in particle.js
      // Keep the existing particle.js content.
      class Particle {
        constructor(x, y, clr, speed = random(1, 4), lifespan = 60) {
          this.pos = createVector(x, y);
          this.vel = p5.Vector.random2D();
          this.vel.mult(speed);
          this.lifespanMax = lifespan;
          this.lifespan = lifespan;
          this.color = clr;
          this.size = random(3, 7);
          this.alpha = alpha(clr) || 255; // Use color's alpha if set, else 255
          this.baseAlpha = this.alpha;
          this.drag = 0.97; // Air resistance
        }

        update(timeScale = 1) {
          this.pos.add(p5.Vector.mult(this.vel, timeScale));
          this.lifespan -= timeScale;
          this.alpha = map(this.lifespan, 0, this.lifespanMax, 0, this.baseAlpha); // Fade out based on initial alpha
          this.vel.mult(pow(this.drag, timeScale)); // Apply drag adjusted for timeScale
        }

        display() {
          noStroke();
          fill(red(this.color), green(this.color), blue(this.color), this.alpha);
          ellipse(this.pos.x, this.pos.y, this.size, this.size);
        }

        isFinished() {
          return this.lifespan <= 0;
        }
      }
