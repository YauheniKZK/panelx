// src/modules/car.ts

import type { CanvasItem } from './segment'

export interface CarOptions {
  width: number
  height: number
  canvasWidth: number
  canvasHeight: number

  baseSpeed?: number
  acceleration?: number
  maxSpeed?: number

  longFriction?: number

  driftStep?: number       // radians per tap for container
  driftSmoothRate?: number // rate for container smoothing (rad/s)
  driftDecayRate?: number  // rate for container decay (rad/s)

  initialAngle?: number
  color?: string
  imageUrl?: string
}

type Conf = Required<Pick<CarOptions,
  'width'|'height'|'canvasWidth'|'canvasHeight'
  |'baseSpeed'|'acceleration'|'maxSpeed'
  |'longFriction'
  |'driftStep'|'driftSmoothRate'|'driftDecayRate'|'initialAngle'
>> & { color?:string; imageUrl?:string }

export class Car implements CanvasItem {
  private x = 0
  private y = 0

  // Movement container
  private containerAngle = 0       // current container angle
  private targetContainer = 0      // desired container angle
  private readonly maxContainer = Math.PI/4  // ±45°

  // Inner model
  private innerAngle = 0           // current inner model angle
  private targetInner = 0          // desired inner angle
  private readonly innerExtra = Math.PI/36   // extra 5° on tap

  private speed = 0
  private boosting = false

  private cfg: Conf
  private image = new Image()
  private ready = false

  constructor(opts: CarOptions){
    this.cfg = {
      width: opts.width, height: opts.height,
      canvasWidth: opts.canvasWidth,
      canvasHeight: opts.canvasHeight,
      baseSpeed: opts.baseSpeed ?? 200,
      acceleration: opts.acceleration ?? 300,
      maxSpeed: opts.maxSpeed ?? 600,
      longFriction: opts.longFriction ?? 0.98,
      driftStep: opts.driftStep ?? Math.PI/36,
      driftSmoothRate: opts.driftSmoothRate ?? Math.PI,
      driftDecayRate: opts.driftDecayRate ?? Math.PI/2,
      initialAngle: opts.initialAngle ?? -Math.PI/2,
      color: opts.color, imageUrl: opts.imageUrl
    }

    this.containerAngle = this.cfg.initialAngle
    this.innerAngle = this.containerAngle
    this.targetContainer = 0
    this.targetInner = this.containerAngle

    if(this.cfg.imageUrl){
      this.image.src = this.cfg.imageUrl
      this.image.onload = ()=>this.ready=true
    } else {
      this.ready = true
    }
  }

  setPosition(x:number,y:number){ this.x=x; this.y=y }
  start(){ if(!this.speed) this.speed=this.cfg.baseSpeed }
  enableBoost(){ this.boosting=true }
  disableBoost(){ this.boosting=false }

  setTurnDir(dir:-1|1){
    // tap: change container target and inner target
    this.targetContainer += dir * this.cfg.driftStep
    this.targetContainer = Math.max(-this.maxContainer,
      Math.min(this.maxContainer, this.targetContainer))
    this.targetInner = this.targetContainer + dir * this.innerExtra
  }

  commitDrift(){
    // reset container, align inner to container
    this.targetContainer = 0
    this.targetInner = this.containerAngle
  }

  update(dt:number){
    const c=this.cfg
    // boost/brake
    if(this.boosting){
      this.speed += c.acceleration*dt
      if(this.speed>c.maxSpeed) this.speed=c.maxSpeed
    } else {
      this.speed*=c.longFriction
      if(this.speed<c.baseSpeed) this.speed=c.baseSpeed
    }
    // smooth container
    let d=this.targetContainer-this.containerAngle
    let rate=this.targetContainer===0 ? c.driftDecayRate : c.driftSmoothRate
    this.containerAngle += Math.sign(d)*Math.min(Math.abs(d),rate*dt)
    // smooth inner
    let di=this.targetInner-this.innerAngle
    this.innerAngle += Math.sign(di)*Math.min(Math.abs(di),c.driftSmoothRate*dt)
    // move by container
    const ca=Math.cos(this.containerAngle),
          sa=Math.sin(this.containerAngle)
    this.x+=ca*this.speed*dt
    this.y+=sa*this.speed*dt
    // bounds
    const hw=c.width/2, hh=c.height/2
    this.x=Math.min(Math.max(this.x,hw),c.canvasWidth-hw)
    this.y=Math.min(Math.max(this.y,hh),c.canvasHeight-hh)
  }

  draw(ctx:CanvasRenderingContext2D){
    if(!this.ready && this.cfg.imageUrl) return
    const w=this.cfg.width, h=this.cfg.height
    ctx.save()
    ctx.translate(this.x,this.y)
    // container
    ctx.rotate(this.containerAngle)
    // inner model
    ctx.save()
    ctx.rotate(this.innerAngle-this.containerAngle)
    if(this.cfg.imageUrl){
      ctx.drawImage(this.image,-w/2,-h/2,w,h)
    } else {
      ctx.fillStyle=this.cfg.color||'#0af'
      ctx.fillRect(-w/2,-h/2,w,h)
    }
    ctx.restore()
    ctx.restore()
  }
}
