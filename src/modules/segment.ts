// src/modules/segment.ts
export interface CanvasItem {
  update(dt: number): void
  draw(ctx: CanvasRenderingContext2D): void
}

export interface SegmentOptions {
  id: string
  x: number
  y: number
  width: number
  height: number
  createItems: (opts: {
    x: number; y: number; width: number; height: number
  }) => CanvasItem[]
}

export class Segment {
  items: CanvasItem[]
  constructor(private opts: SegmentOptions) {
    this.items = opts.createItems({
      x: opts.x, y: opts.y, width: opts.width, height: opts.height
    })
  }
  update(dt: number) {
    this.items.forEach(item => item.update(dt))
  }
  draw(ctx: CanvasRenderingContext2D) {
    // рамка сегмента (по желанию)
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.strokeRect(this.opts.x, this.opts.y, this.opts.width, this.opts.height)
    ctx.restore()
    this.items.forEach(item => item.draw(ctx))
  }
}
