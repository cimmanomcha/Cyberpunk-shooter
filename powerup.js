// Powerup.js - Adjusted 'weaponUpgrade' symbol

    class PowerUp {
      constructor(x, y, type) {
        this.pos = createVector(x, y);
        this.type = type;
        this.size = 20;
        this.radius = this.size / 2;
        this.bobOffset = 0;
        this.bobSpeed = 0.05;

        switch (this.type) {
          // Existing
          case 'shield': this.color = color(0, 150, 255); this.symbol = 'S'; break;
          case 'overclock': this.color = color(255, 100, 0); this.symbol = 'OC'; break; // Changed symbol
          case 'speedBoost': this.color = color(255, 255, 0); this.symbol = '>'; break;
          case 'emp': this.color = color(100, 150, 255); this.symbol = 'EMP'; break;
          case 'timeSlow': this.color = color(150, 150, 255); this.symbol = 'TS'; break;
          case 'weaponUpgrade': this.color = color(255, 0, 255); this.symbol = 'W+'; break; // Changed symbol W+
          case 'drone': this.color = color(100, 255, 100); this.symbol = 'D'; break;
          // New
          case 'healthPack': this.color = color(0, 220, 0); this.symbol = '+'; break;
          case 'damageBoost': this.color = color(255, 150, 0); this.symbol = 'DMG'; break;
          case 'fireRateBoost': this.color = color(255, 200, 0); this.symbol = 'FR+'; break;
          case 'shieldRegen': this.color = color(0, 100, 200); this.symbol = 'SR'; break;
          case 'multiShot': this.color = color(200, 0, 255); this.symbol = 'MS'; break;
          case 'explosiveRounds': this.color = color(255, 50, 0); this.symbol = 'EX'; break;
          default: this.color = color(255); this.symbol = '?'; break;
        }
        this.glowColor = color(red(this.color), green(this.color), blue(this.color), 100);
      }
      update(timeScale = 1) { this.bobOffset = sin(frameCount * this.bobSpeed * timeScale) * 3; }
      display() { let displayY = this.pos.y + this.bobOffset; noStroke(); fill(this.glowColor); ellipse(this.pos.x, displayY, this.size * 1.8, this.size * 1.8); fill(this.color); stroke(255); strokeWeight(1.5); ellipse(this.pos.x, displayY, this.size, this.size); fill(0); noStroke(); textSize(this.size * (this.symbol.length > 2 ? 0.35 : this.symbol.length > 1 ? 0.4 : 0.6)); textAlign(CENTER, CENTER); text(this.symbol, this.pos.x, displayY - 1); }
    }
