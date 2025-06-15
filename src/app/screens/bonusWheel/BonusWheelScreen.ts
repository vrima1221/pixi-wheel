import { Container, Sprite } from "pixi.js";
import { engine } from "../../getEngine";
import { Label } from "../../ui/Label";
import { WinPopup } from "../../popups/WinPopup";
import { Wheel } from "./Wheel";
import { balance } from "../../../engine/balance/balance";
import { animate, AnimationPlaybackControls, ObjectTarget } from "motion";

export class BonusScreen extends Container {
  private wheel: Wheel;
  private message: Label;
  private background: Sprite;

  constructor() {
    super();
    this.background = Sprite.from("bg.png"); // Your image path
    this.background.anchor.set(0.5);
    this.background.width = engine().renderer.width;
    this.background.height = engine().renderer.height;
    this.background.position.set(
      engine().renderer.width / 2,
      engine().renderer.height / 2,
    );
    this.addChild(this.background);

    this.message = new Label({
      text: "Press to spin",
      style: { fontSize: 32, fill: 0xffffff },
    });
    this.message.anchor.set(0.5);
    this.message.position.set(engine().renderer.width / 2, 100);
    this.addChild(this.message);

    this.wheel = new Wheel();
    this.wheel.position.set(
      engine().renderer.width / 2,
      engine().renderer.height / 2,
    );
    this.addChild(this.wheel);

    this.wheel.interactive = true;
    this.wheel.on("pointertap", () => this.spinWheel());
  }

  private async spinWheel() {
    this.message.text = "Spinning...";
    this.message.style.fill = 0xaaaaaa;

    const winAmount = await this.wheel.spin();

    this.message.text = "Press to spin";
    this.message.style.fill = 0xffffff;

    // Show win popup
    const winPopup = new WinPopup();
    winPopup.setWinAmount(winAmount);

    // Update balance
    balance.add(winAmount);
    await this.showWin(winAmount);
  }

  private async showWin(amount: number): Promise<void> {
    await engine().navigation.presentPopup(WinPopup, (popup) =>
      popup.setWinAmount(amount),
    );
  }

  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.3 });

    const elementsToAnimate = [this.wheel, this.message];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
      delay: 0.5,
    });
  }
}
