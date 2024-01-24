import { _decorator, Component, Input, Node, Sprite, SpriteAtlas, SpriteFrame, Tween, tween, UITransform, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export type TCard = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

interface Fliped {
    node: Node
    value: number
}

@ccclass('CardManager')
export class CardManager extends Component {
    @property([SpriteFrame])
    sfCards: SpriteFrame[] = []

    @property(Node)
    pointer: Node = null

    points: Node[] = []

    cards = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]

    lastFliped: Fliped = null

    isChecking = false

    onLoad() {
        this.points = this.pointer.children
    }

    init() {
        this.shuffle()
        this.prepare()
    }

    restart() {
        this.node.removeAllChildren()
        this.init()
    }

    shuffle() {
        this.cards = this.cards.sort(() => Math.random() > 0.5 ? 1 : -1)
        this.cards = this.cards.sort(() => Math.random() > 0.5 ? 1 : -1)
        this.cards = this.cards.sort(() => Math.random() > 0.5 ? 1 : -1)
        return this.cards
    }

    getCardById(id: number) {
        return this.sfCards[id]
    }

    getBackCard() {
        return this.sfCards[0]
    }

    async prepare() {
        this.points.forEach((point: Node, i: number) => {
            const id = this.cards[i]
            const node = new Node()
            node.name = id + ''
            this.node.addChild(node)
            const sp = node.addComponent(Sprite)
            sp.sizeMode = Sprite.SizeMode.CUSTOM
            sp.spriteFrame = this.getCardById(id)
            const ui = node.getComponent(UITransform)
            ui.setContentSize(112, 180)
        })
        await Promise.all(this.node.children.map(
            (node: Node, i: number) => this.moveTo(node, this.points[i].position, i))
        )
        await this.sleep()
        await Promise.all(this.node.children.map((node: Node) => this.flipCard(node, false)))
        this.initListener()
    }

    sleep(duration = 2) {
        return new Promise(r => setTimeout(r, duration * 1000))
    }

    moveTo(node: Node, pos: Vec3, id: number) {
        return new Promise(resolve => {
            new Tween(node)
                .delay(id * .1)
                .to(.5, {
                    position: pos
                })
                .call(resolve)
                .start()
        })
    }

    initListener() {
        this.node.children.forEach((node: Node) => {
            node.on(Input.EventType.TOUCH_END, async () => {
                if (this.isChecking) return
                const value = +node.name
                this.flipCard(node)
                if (this.lastFliped) {
                    if (this.lastFliped.node === node) return
                    this.isChecking = true
                    if (this.lastFliped.value === value) {
                        this.isChecking = false
                        this.lastFliped.node.off(Input.EventType.TOUCH_END)
                        node.off(Input.EventType.TOUCH_END)
                    } else {
                        await this.sleep(1)
                        this.flipCard(this.lastFliped.node, false)
                        this.flipCard(node, false)
                        this.isChecking = false
                    }
                    this.lastFliped = null
                } else {
                    this.lastFliped = { node, value }
                }
            })
        })
    }

    handleClick() {
        
    }

    flipCard(node: Node, show = true) {
        return new Promise((resolve) => {
            const tw = new Tween(node)
                .to(.2, { scale: v3(.5, 1, 1) })
                .call(() => {
                    node.getComponent(Sprite).spriteFrame = show ? this.getCardById(+node.name) : this.getBackCard()
                })
                .to(.2, { scale: v3(1, 1, 1) })
                .call(resolve)
                .start()
        })
    }
}

