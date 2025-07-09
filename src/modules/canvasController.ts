// src/modules/canvasController.ts
export type ColorOptions    = { type: 'color';    color: string }
export type GradientOptions = { type: 'gradient'; colors: string[] }
export type ImageOptions    = { type: 'image';    imageUrl: string }
export type BackgroundOptions = ColorOptions | GradientOptions | ImageOptions

export class CanvasController {
  public ctx: CanvasRenderingContext2D

  constructor(public canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context not found')
    this.ctx = context
  }

  resizeCanvas() {
    this.canvas.width  = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
  }

  setBackground(opts: BackgroundOptions) {
    this.resizeCanvas()
    switch (opts.type) {
      case 'color':
        this.ctx.fillStyle = opts.color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        break
      case 'gradient':
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height)
        opts.colors.forEach((c, i) => grad.addColorStop(i/(opts.colors.length-1), c))
        this.ctx.fillStyle = grad
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        break
      case 'image':
        const img = new Image()
        img.src = opts.imageUrl
        img.onload = () => this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
        break
    }
  }
}
