import Phaser from "phaser";
import Config from "../Config";
import Button from "../ui/Button";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
  }

  create() {
    const bg = this.add.graphics();
    bg.fillStyle(0x1C1117);
    bg.fillRect(0, 0, Config.width, Config.height);
    bg.setScrollFactor(0);

    this.add
      .bitmapText(Config.width / 2, Config.height/2.5, "pixelFont", "Tilemap_Test", 100)
      .setOrigin(0.5);

    new Button(
      Config.width / 2,
      Config.height / 1.9,
      "Start",
      this,
      () => this.scene.start("playGame")
    );
  }
}
