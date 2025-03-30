// No changes needed in drone.js
      // Keep the existing drone.js content.
      class Drone {
          constructor(x, y) {
              this.pos = createVector(x, y); // Initial position near player
              this.targetPos = createVector(x, y); // Where it wants to be relative to player
              this.vel = createVector();
              this.size = 15;
              this.radius = this.size / 2;
              this.color = color(100, 255, 100); // Light green
              this.glowColor = color(100, 255, 100, 100);

              this.maxDuration = 900; // 15 seconds
              this.duration = this.maxDuration;

              // Targeting & Shooting
              this.targetEnemy = null;
              this.shootCooldown = 45; // Frames between shots
              this.shootTimer = 0;
              this.detectionRange = 300;
              this.bulletSpeed = 6;
          }

          update(playerPos, enemies, bullets, timeScale = 1) {
              this.duration -= timeScale;
              this.shootTimer -= timeScale;

              // --- Movement ---
              // Follow player with an offset (e.g., slightly behind and to the side)
              let offset = createVector(-player.size * 1.5, -player.size * 0.5); // Example offset
              this.targetPos = p5.Vector.add(playerPos, offset);

              // Simple spring-like movement towards target position
              let force = p5.Vector.sub(this.targetPos, this.pos);
              force.mult(0.1 * timeScale); // Spring constant (adjust for stiffness)
              this.vel.add(force);
              this.vel.mult(pow(0.85, timeScale)); // Damping (adjust for smoothness)
              this.pos.add(p5.Vector.mult(this.vel, timeScale));


              // --- Targeting ---
              this.findTarget(enemies);

              // --- Shooting ---
              if (this.targetEnemy && this.shootTimer <= 0) {
                  this.shoot(bullets); // Pass main bullets array to add drone bullets
                  this.shootTimer = this.shootCooldown;
              }
          }

          findTarget(enemies) {
              let closestDist = this.detectionRange;
              this.targetEnemy = null;

              for (let enemy of enemies) {
                   // Don't target phased-out stealth enemies
                   if (enemy.type === 'stealth' && !enemy.isVisible) continue;

                  let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
                  if (d < closestDist) {
                      closestDist = d;
                      this.targetEnemy = enemy;
                  }
              }
          }

          shoot(bullets) { // Add drone bullets to the main bullets array
              if (!this.targetEnemy) return;

              // Create a drone bullet aimed at the target
              let droneBullet = new DroneBullet(this.pos.x, this.pos.y, this.targetEnemy.pos, this.bulletSpeed);
              bullets.push(droneBullet); // Add to the sketch's main bullet array
              // Add drone shoot sound? (Could reuse player shoot sound at lower volume/pitch)
              // playShootSound(); // Example - needs pitch/volume adjustment
          }

          display() {
              let alpha = map(this.duration, 0, this.maxDuration / 4, 50, 255, true); // Fade out in last quarter duration

              // Glow
              noStroke();
              fill(red(this.glowColor), green(this.glowColor), blue(this.glowColor), alpha * 0.5);
              ellipse(this.pos.x, this.pos.y, this.size * 1.8, this.size * 1.8);

              // Body (e.g., small diamond)
              fill(red(this.color), green(this.color), blue(this.color), alpha);
              stroke(255, alpha);
              strokeWeight(1);
              push();
              translate(this.pos.x, this.pos.y);
              rotate(PI / 4);
              rect(0, 0, this.size * 0.8, this.size * 0.8);
              pop();
          }
      }
