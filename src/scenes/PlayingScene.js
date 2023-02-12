import Phaser from "phaser";
import Config from "../Config";
import Player, {
  Direction
} from "../characters/Player";
import global_pause from "../utils/pause";
import level_pause from "../utils/levelup";
import {
  getTimeString
} from "../utils/time";
import {
  getRandomPosition
} from "../utils/math";

export default class PlayingScene extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  create() {
    // pause
    // 일시정지 또는 레벨업 했을 시 보여줄 화면을 만들어놓는 부분
    this.createVeil();
    this.createPauseScreen();
    this.createLevelScreen();

    // sound
    // 사용할 sound들을 추가해놓는 부분
    this.sound.pauseOnBlur = false;
    this.m_beamSound = this.sound.add("audio_beam");
    this.m_explosionSound = this.sound.add("audio_explosion");
    this.m_pickupSound = this.sound.add("audio_pickup");
    this.m_hurtSound = this.sound.add("audio_hurt");
    this.m_gameoverSound = this.sound.add("audio_gameover");
    this.m_pauseInSound = this.sound.add("pause_in");
    this.m_pauseOutSound = this.sound.add("pause_out");
    this.m_hitMobSound = this.sound.add("hit_mob");

    this.m_music = this.sound.add("music");
    const musicConfig = {
      mute: true,
      //mute: false,
      volume: 0.7,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };
    this.m_music.play(musicConfig);


    // tilemap
    const map = this.make.tilemap({
      key: 'test_level',
      tileWidth: 48,
      tileHeight: 48,
      width: 50,
      height: 50
    })
    const wall_tileset = map.addTilesetImage('walls', 'walls', 16, 16, 1, 2)
    const floor_tileset = map.addTilesetImage('floors', 'floors', 16, 16, 1, 2)

    const floorsLayer = map.createStaticLayer('Floors', floor_tileset, 0, 0)
    const wallsLayer = map.createStaticLayer('Walls', wall_tileset, 0, 0)

    wallsLayer.setCollisionByProperty({
      collides: true
    })

    const debugGraphics = this.add.graphics().setAlpha(0.7)
    wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 55),
      faceColor: new Phaser.Display.Color(40, 39, 37, 55)
    })

    // projectiles
    this.m_projectiles = this.add.group();

    // player
    this.m_player = new Player(this);
    this.physics.add.collider(this.m_player, wallsLayer);
    this.m_player.body.setSize(this.m_player.width * 0.8, this.m_player.height * 0.9)
    this.cameras.main.startFollow(this.m_player);
    this.cameras.main.setZoom(4);
    this.cameras.main.centerOn(0, 0);
    


    // keys
    this.m_cursorKeys = this.input.keyboard.createCursorKeys();
    this.m_wasdKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });


    // event handler
    // ESC 키를 눌러 일시정지 할 수 있습니다.
    this.input.keyboard.on(
      "keydown-ESC",
      () => {
        global_pause("playGame");
      },
      this
    );

    // 처음에 나타날 mob을 추가해줍니다.
  }
  //////////////////////////// END OF create() ////////////////////////////

  update() {
    this.movePlayerManager();

    /// player로부터 가장 가까운 mob으ㄹ 구합니다.
    /*
    const closest = this.physics.closest(
      this.m_player,
      this.m_mobs.getChildren()
    );
    this.m_closest = closest;
    */
  }

  //////////////////////// FUNCTIONS ////////////////////////

  /*
  pickExpUp(player, expUp) {
    
    disableBody
    param 1 : 오브젝트를 비활성화합니다.
    param 2 : 오브젝트를 화면에 보이지 않게 합니다.
    
    expUp.disableBody(true, true);
    expUp.destroy();

    this.m_pickupSound.play();
    this.m_expBar.increase(expUp.m_exp);
    if (this.m_expBar.m_currentExp >= this.m_expBar.m_maxExp) {
      level_pause(this);
    }
  }
  */



  // mob이 1초마다 생성되도록 event를 생성해줍니다.
  /*
  addMob(mobTexture, mobAnim, mobHp, mobDropRate) {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        // 화면 바깥에서 나타나도록 해줍니다.
        const r =
          Math.sqrt(
            Config.width * Config.width + Config.height * Config.height
          ) / 2;
        let [x, y] = getRandomPosition(this.m_player.x, this.m_player.y, r);
        this.m_mobs.add(
          new Mob(this, x, y, mobTexture, mobAnim, mobHp, mobDropRate)
        );
      },
      loop: true,
    });
  }
  */

  movePlayerManager() {
    if (this.m_cursorKeys.left.isDown || this.m_wasdKeys.left.isDown) {
      this.m_player.move(Direction.Left);
    } else if (this.m_cursorKeys.right.isDown || this.m_wasdKeys.right.isDown) {
      this.m_player.move(Direction.Right);
    }

    if (this.m_cursorKeys.up.isDown || this.m_wasdKeys.up.isDown) {
      this.m_player.move(Direction.Up);
    } else if (this.m_cursorKeys.down.isDown || this.m_wasdKeys.down.isDown) {
      this.m_player.move(Direction.Down);
    }
  }

  // 반투명 검은 veil 화면을 만들어줍니다.
  createVeil() {
    this.m_veil = this.add.graphics({
      x: 0,
      y: 0
    });
    this.m_veil.fillStyle(0x000000, 0.3);
    this.m_veil.fillRect(0, 0, Config.width, Config.height);
    this.m_veil.setDepth(110);
    this.m_veil.setScrollFactor(0);
  }

  // level up 했을 때의 화면을 만들어줍니다.
  createLevelScreen() {
    const texts = [
      "You're on the Next Level!",
      "",
      "Press Enter to Keep Going",
    ];
    this.m_textLevel = this.add
      .text(Config.width / 2, Config.height / 2, texts, {
        fontSize: 40
      })
      .setOrigin(0.5)
      .setDepth(120)
      .setScrollFactor(0);

    // 처음에는 보이지 않게 감춰줍니다.
    this.toggleLevelScreen(false);
  }

  toggleLevelScreen(isVisible) {
    this.m_veil.setVisible(isVisible);
    this.m_textLevel.setVisible(isVisible);
  }

  // 일시정지 했을 때의 화면을 만들어줍니다.
  createPauseScreen() {
    this.m_textPause = this.add
      .text(Config.width / 2, Config.height / 2, "Pause", {
        fontSize: Config.width/50
      })
      .setOrigin(0.5)
      .setDepth(120)
      .setScrollFactor(0);

    // 처음에는 보이지 않게 감춰줍니다.
    this.togglePauseScreen(false);
  }

  togglePauseScreen(isVisible) {
    this.m_veil.setVisible(isVisible);
    this.m_textPause.setVisible(isVisible);
  }
}