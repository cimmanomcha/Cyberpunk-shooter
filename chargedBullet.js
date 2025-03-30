// ChargedBullet.js - Pass player level for visuals

    class ChargedBullet extends Bullet {
      // Added playerLevel parameter
      constructor(x, y, speed, size, damage, piercing, explosive = false, playerLevel = 0) {
        // Determine base color based on level before calling super
        let baseColor = color(255, 0, 255); // Default magenta for charged
        if (playerLevel === 3) {
            baseColor = color(255, 255, 255); // White for immortal charged
        }
        // Call parent Bullet constructor, passing level
        super(x, y, speed, baseColor, damage, piercing, explosive, playerLevel);
        this.size = size; // Override size from parent based on charge amount
        this.glowColor = color(red(this.color), green(this.color), blue(this.color), 200); // Brighter glow
        this.trail = [];
        this.maxTrailLength = 10;
      }

      update(timeScale = 1) { /* Keep as is */ this.trail.push(this.pos.copy()); if (this.trail.length > this.maxTrailLength) { this.trail.shift(); } super.update(timeScale); }
      display() { /* Keep as is */ noStroke(); for (let i = 0; i < this.trail.length; i++) { let trailPos = this.trail[i]; let alpha = map(i, 0, this.trail.length, 0, 100); let trailSize = lerp(this.size * 0.2, this.size * 0.8, i / this.trail.length); fill(red(this.color), green(this.color), blue(this.color), alpha * (this.faded ? this.fadeTimer / 15 : 1)); ellipse(trailPos.x, trailPos.y, trailSize, trailSize); } let currentAlpha = this.faded ? map(this.fadeTimer, 0, 15, 0, 255) : 255; noStroke(); fill(red(this.glowColor), green(this.glowColor), blue(this.glowColor), alpha(this.glowColor) * (currentAlpha / 255)); ellipse(this.pos.x, this.pos.y, this.size * 1.5, this.size * 1.5); fill(red(this.color), green(this.color), blue(this.color), currentAlpha); ellipse(this.pos.x, this.pos.y, this.size, this.size); }
    }
