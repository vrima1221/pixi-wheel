import { Container, Graphics, Sprite, Text } from "pixi.js";
import { animate } from "motion";
import { waitFor } from "../../../engine/utils/waitFor";
import { engine } from "../../getEngine";

const SEGMENTS = [
  { amount: 2.0, weight: 200 },
  { amount: 50.0, weight: 76 },
  { amount: 500.0, weight: 12 },
  { amount: 2.0, weight: 200 },
  { amount: 100.0, weight: 62 },
  { amount: 50.0, weight: 81 },
  { amount: 2.0, weight: 200 },
  { amount: 75.0, weight: 74 },
];

export class Wheel extends Container {
  private segments: Sprite[] = [];
  private baseContainer: Container;
  private center: Sprite;
  private pointer: Sprite;
  private isSpinning = false;
  private radius: number = 500;

  constructor() {
    super();

    this.baseContainer = new Container();
    this.width = this.radius;
    this.baseContainer.scale = 0.7;
    this.baseContainer.pivot.set(0, 0);

    this.createSegments();

    this.center = Sprite.from("wheelCenter.png");
    this.center.anchor.set(0.5);
    this.baseContainer.addChild(this.center);

    this.pointer = Sprite.from("wheelPointer.png");
    this.pointer.anchor.set(0.5, 0);
    this.pointer.position.set(0, -this.radius * 0.7 + this.pointer.height / 2);

    this.addChild(this.baseContainer);
    this.addChild(this.pointer);
  }

  private createSegments(): void {
    const segmentAngle = (2 * Math.PI) / SEGMENTS.length;

    for (let i = 0; i < SEGMENTS.length; i++) {
      const segment = Sprite.from("wheelSlice.png");
      segment.anchor.set(0.5, 1);
      segment.rotation = i * segmentAngle;
      segment.position.set(0, 0);

      const text = new Text({
        text: `${SEGMENTS[i].amount}`,
        style: {
          fill: 0xffffff,
          fontSize: 32,
          fontWeight: "bold",
          align: "center",
        },
      });
      text.anchor.set(0.5);
      text.zIndex = 1000;

      // Position text in center of segment
      const angle = segmentAngle * i;

      const radiusOffset = this.radius * 0.7;
      text.position.set(
        Math.cos(angle) * radiusOffset,
        Math.sin(angle) * radiusOffset,
      );
      text.rotation = angle + Math.PI / 2;

      this.baseContainer.addChild(text);

      this.segments.push(segment);
      this.baseContainer.addChild(segment);
    }
  }

  public async spin(): Promise<number> {
    if (this.isSpinning) return 0;

    this.isSpinning = true;
    this.interactive = false;

    engine().audio.bgm.setVolume(0);
    engine().audio.sfx.play("main/sounds/ding_b.wav");

    const selectedIndex = this.getWeightedResult();
    console.log(selectedIndex);
    console.log(this.segments[selectedIndex]);

    const segmentAngle = (2 * Math.PI) / SEGMENTS.length;
    const targetRotation = 2 * Math.PI * 5 + selectedIndex * segmentAngle;

    await animate(
      this.baseContainer,
      { rotation: targetRotation },
      {
        duration: 5,
        ease: "easeOut",
        type: "spring",
        bounce: 0.15,
      },
    ).finished;

    engine().audio.sfx.play("main/sounds/final.wav");

    const glow = new Graphics();
    glow.circle(0, 0, this.radius * 1.1).fill(0xffff00, 0.5);
    glow.rotation = selectedIndex * segmentAngle;
    this.baseContainer.addChildAt(glow, 0);
    await animate(glow, { alpha: [0.8, 0] }, { duration: 1.5, ease: "linear" })
      .finished;
    this.baseContainer.removeChild(glow);

    await waitFor(0.3);

    this.isSpinning = false;
    this.interactive = true;

    return SEGMENTS[selectedIndex].amount;
  }

  private getWeightedResult(): number {
    const totalWeight = SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (let i = 0; i < SEGMENTS.length; i++) {
      currentWeight += SEGMENTS[i].weight;
      if (random <= currentWeight) {
        return i;
      }
    }

    return 0;
  }

  public resize(width: number, height: number): void {
    this.position.set(width * 0.5, height * 0.5);
  }
}
