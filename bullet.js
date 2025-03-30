// Bullet.js - Pass player level for visuals

    class Bullet {
      // Added playerLevel parameter
      constructor(x, y, speed = 8, baseClr = color(255, 255, 0), damage = 1, piercing = false, explosive = false, playerLevel = 0) {
        this.pos = createVector(x, y);
        this.speed = speed;
        this.damage = damage;
        this.piercing = piercing;
        this.isExplosive = explosive;
        this.vel = createVector(0, -this.speed); // Default velocity
        this.faded = false;
        this.fadeTimer = 15;

        // Determine color and size based on level
        this.playerLevel = playerLevel;
        switch (this.playerLevel) {
            case 1: // Level 1
                this.color = color(255, 165, 0); // Orange
                this.size = 9;
                break;
            case 2: // Level 2
                this.color = color(255, 60, 0); // Red-Orange
                this.size = 10;
                break;
            case 3: // Immortal
                // Pulsating rainbow effect? Or bright white? Let's do white.
                this.color = color(255, 255, 255);
                this.size = 12;
                break;
            default: // Level 0
                this.color = baseClr; // Yellow default
                this.size = 8;
                break;
        }
        this.glowColor = color(red(this.color), green(this.color), blue(this.color), 150);
      }

      update(timeScale = 1) {
        this.pos.add(p5.Vector.mult(this.vel, timeScale));
        if (this.faded) { this.fadeTimer -= timeScale; }
        // Add immortal bullet visual effect (e.g., slight color shift)
        if (this.playerLevel === 3) {
            let hueShift = (frameCount * 5) % 360; // Simple hue rotation
             // This requires HSB color mode, let's stick to white glow for simplicity
             this.glowColor = color(255, 255, 255, 200); // Bright white glow
        }
      }

      display() { /* Keep as is */ noStroke(); fill(this.glowColor); ellipse(this.pos.x, this.pos.y, this.size * 1.5, this.size * 1.5); fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); }
      isOffscreen(w = width, h = height) { /* Keep as is */ return this.pos.y < -this.size || this.pos.y > h + this.size || this.pos.x < -this.size || this.pos.x > w + this.size; }
      hits(enemy) { /* Keep as is */ let enemyRadius = enemy.radius || enemy.size / 2; let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y); return d < this.size / 2 + enemyRadius; }
      startFade() { if (this.piercing) { this.piercing = false; this.faded = true; } }
    }

    // EnemyBullet class remains the same
    class EnemyBullet { /* Keep as is */ constructor(x, y, targetPos, speed = 4, size = 10, clr = color(255, 0, 100), damage = 1) { this.pos = createVector(x, y); this.size = size; this.speed = speed; this.color = clr; this.glowColor = color(red(clr), green(clr), blue(clr), 150); this.damage = damage; this.vel = p5.Vector.sub(targetPos, this.pos); this.vel.normalize(); this.vel.mult(this.speed); } update(timeScale = 1) { this.pos.add(p5.Vector.mult(this.vel, timeScale)); } display() { noStroke(); fill(this.glowColor); ellipse(this.pos.x, this.pos.y, this.size * 1.5, this.size * 1.5); fill(this.color); ellipse(this.pos.x, this.pos.y, this.size, this.size); } isOffscreen(w = width, h = height) { return this.pos.y > h + this.size || this.pos.y < -this.size || this.pos.x < -this.size || this.pos.x > w + this.size; } }
