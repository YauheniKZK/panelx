// src/modules/obstacle.ts
import type { CanvasItem } from './segment'

/** Параметры одного препятствия */
export interface ObstacleOpts {
  x: number
  y: number
  size: number
  color?: string
}

/** Простое статичное препятствие, реализует CanvasItem */
export class Obstacle implements CanvasItem {
  constructor(private opts: ObstacleOpts) {}

  update(dt: number): void {
    // у статичного препятствия нет логики
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.fillStyle = this.opts.color || '#e33'
    ctx.fillRect(
      this.opts.x - this.opts.size / 2,
      this.opts.y - this.opts.size / 2,
      this.opts.size,
      this.opts.size
    )
    ctx.restore()
  }
}
