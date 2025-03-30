// No changes needed in droneBullet.js
      // Keep the existing droneBullet.js content.
      // Drone Bullet - often weaker but auto-fired
      class DroneBullet extends Bullet { // Inherit from Bullet
          constructor(x, y, targetPos, speed = 6) {
              // Call Bullet constructor with drone-specific properties
              super(x, y, speed, color(150, 255, 150), 0.5, false); // Light green, low damage, no pierce
              this.size = 6; // Smaller than player bullets
              this.glowColor = color(150, 255, 150, 100);

              // Aim directly at target at time of firing (could add prediction later)
              this.vel = p5.Vector.sub(targetPos, this.pos);
              this.vel.normalize();
              this.vel.mult(this.speed);
          }

          update(timeScale = 1) {
              // Override standard bullet update (which just goes up)
              this.pos.add(p5.Vector.mult(this.vel, timeScale)); // Move along calculated velocity
          }

          // Display uses parent Bullet display method
          // isOffscreen uses parent Bullet method
          // hits uses parent Bullet method
      }
