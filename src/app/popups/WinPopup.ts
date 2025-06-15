import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";
import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { MainScreen } from "../screens/main/MainScreen";

/** Popup that shows win amount after wheel spin */
export class WinPopup extends Container {
  private bg: Sprite;
  private panel: Container;
  private panelBase: RoundedBox;
  private title: Label;
  private winAmountLabel: Label;
  private claimButton: Button;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.alpha = 0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 350 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: `You won`,
      style: { fill: 0xf8d146, fontSize: 50, fontWeight: "bold" }, // Gold color for win
    });
    this.title.y = -100;
    this.panel.addChild(this.title);

    this.winAmountLabel = new Label({
      text: `0.00`,
      style: { fill: 0xf8d146, fontSize: 60, fontWeight: "bold" },
    });
    this.winAmountLabel.y = 0;
    this.panel.addChild(this.winAmountLabel);

    this.claimButton = new Button({
      text: "OK",
    });
    this.claimButton.y = 100;
    this.claimButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
    });
    this.panel.addChild(this.claimButton);
  }

  public setWinAmount(amount: number): void {
    this.winAmountLabel.text = `${amount.toFixed(2)}`;
  }

  public resize(width: number, height: number): void {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );

    engine().navigation.showScreen(MainScreen);
  }
}
