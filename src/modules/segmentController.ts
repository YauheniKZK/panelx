// src/modules/segmentController.ts
import { Segment, SegmentOptions } from './segment'

export class SegmentController {
  private segments = new Map<string, Segment>()
  addSegment(opts: SegmentOptions) {
    this.segments.set(opts.id, new Segment(opts))
  }
  removeSegment(id: string) {
    this.segments.delete(id)
  }
  update(dt: number) {
    this.segments.forEach(seg => seg.update(dt))
  }
  draw(ctx: CanvasRenderingContext2D) {
    this.segments.forEach(seg => seg.draw(ctx))
  }
}
