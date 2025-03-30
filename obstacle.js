// No changes needed in obstacle.js
      // Keep the existing obstacle.js content.
      // Base Obstacle Class (Can be inherited)
      class Obstacle {
          constructor(x, y, w, h) {
              this.pos = createVector(x, y);
              this.width = w;
              this.height = h;
              this.size = max(w, h); // General size reference
              this.radius = this.size / 2; // For simple circle collision approx

              // Properties defining behavior
              this.blocksPlayer = true;
              this.blocksBullets = true;
              this.dealsDamage = false;
              this.damageAmount = 0; // Damage per second if dealsDamage is true
              this.color = color(100, 100, 120); // Default obstacle color (grey)
              this.glowColor = color(100, 100, 120, 80);
          }

          update(timeScale = 1) {
              // Base obstacles are static, override in subclasses for movement
          }

          display() {
              // Basic rectangle display
              noStroke();
              fill(this.glowColor);
              rect(this.pos.x, this.pos.y, this.width + 10, this.height + 10); // Glow effect

              fill(this.color);
              stroke(150);
              strokeWeight(1);
              rect(this.pos.x, this.pos.y, this.width, this.height);
          }

          // Simple AABB collision check (Axis-Aligned Bounding Box)
          hits(entity) {
              let entityRadius = entity.radius || entity.size / 2;
              // Check overlap on both X and Y axes
              let xOverlap = abs(this.pos.x - entity.pos.x) * 2 < (this.width + entityRadius * 2);
              let yOverlap = abs(this.pos.y - entity.pos.y) * 2 < (this.height + entityRadius * 2);
              return xOverlap && yOverlap;
          }

           // Calculate overlap vector to push entity out (simple version)
           getOverlap(entity) {
               let entityRadius = entity.radius || entity.size / 2;
               let overlap = createVector(0, 0);
               let dx = entity.pos.x - this.pos.x; // Difference in x
               let dy = entity.pos.y - this.pos.y; // Difference in y
               let combinedHalfWidths = this.width / 2 + entityRadius;
               let combinedHalfHeights = this.height / 2 + entityRadius;

               // Check for collision (already done in hits, but needed for overlap calc)
               if (abs(dx) < combinedHalfWidths && abs(dy) < combinedHalfHeights) {
                   let overlapX = combinedHalfWidths - abs(dx);
                   let overlapY = combinedHalfHeights - abs(dy);

                   // Push out by the smaller overlap amount
                   if (overlapX < overlapY) {
                       overlap.x = overlapX * Math.sign(dx);
                   } else {
                       overlap.y = overlapY * Math.sign(dy);
                   }
               }
               return overlap;
           }


          isOffscreen(w = width, h = height) {
              // Check if completely off screen
              return (this.pos.x + this.width / 2 < 0 ||
                      this.pos.x - this.width / 2 > w ||
                      this.pos.y + this.height / 2 < 0 ||
                      this.pos.y - this.height / 2 > h);
          }
      }

      // --- Example Subclasses ---

      class MovingBarrier extends Obstacle {
          constructor(x, y, w, h, speedX) {
              super(x, y, w, h);
              this.vel = createVector(speedX, 0);
              this.color = color(150, 150, 180); // Lighter grey
          }

          update(timeScale = 1) {
              this.pos.add(p5.Vector.mult(this.vel, timeScale));
              // Bounce off screen edges (optional)
              if (this.pos.x - this.width / 2 < 0 || this.pos.x + this.width / 2 > width) {
                   this.vel.x *= -1; // Reverse direction
                   // Ensure it doesn't get stuck off-screen
                   this.pos.x = constrain(this.pos.x, this.width / 2, width - this.width / 2);
              }
          }
      }

      class HazardZone extends Obstacle {
           constructor(x, y, w, h, damage = 0.5) {
               super(x, y, w, h);
               this.blocksPlayer = false; // Doesn't block movement
               this.blocksBullets = false; // Doesn't block bullets
               this.dealsDamage = true;
               this.damageAmount = damage; // Damage per second
               this.color = color(255, 100, 0, 50); // Transparent orange
               this.glowColor = color(255, 100, 0, 80);
           }

           display() {
               // Pulsating alpha effect
               let pulse = abs(sin(frameCount * 0.05));
               let currentAlpha = lerp(30, 80, pulse); // Pulsate alpha

               noStroke();
               fill(red(this.glowColor), green(this.glowColor), blue(this.glowColor), currentAlpha + 20);
               rect(this.pos.x, this.pos.y, this.width + 10, this.height + 10);

               fill(red(this.color), green(this.color), blue(this.color), currentAlpha);
               rect(this.pos.x, this.pos.y, this.width, this.height);
           }
      }
