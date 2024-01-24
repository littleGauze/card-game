import { _decorator, Component, Node } from 'cc';
import { CardManager } from './CardManager';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {
    @property(CardManager)
    cardManager: CardManager = null

    
    start() {
        this.cardManager.init()
    }

    update(deltaTime: number) {
        
    }
}

