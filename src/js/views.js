import Phaser from "phaser";
import { Card, RankValues, Stack, SuitValues } from "./model";

export class CardView extends Phaser.GameObjects.Container {
    _model: Card;
    _stackViews: Array<StackView>;
    _cardViews: Array<CardView>
    _prevTweens: Array<Phaser.Tweens.Tween>;
    _dragging: boolean
    _following: boolean

    _stackView: StackView;
    _prevCardView: CardView;

    constructor(card: Card, scene: Phaser.Scene, stackViews:Array<StackView>, cardViews: Array<CardView>, atlas: string, face: string, back: string, x:integer = 0, y: integer = 0) {
        super(scene);
        this.scene.add.existing(this);
        this.scene = scene;

        this._prevTweens = [];
        this._stackViews = stackViews;
        this._cardViews = cardViews;
        this._model = card;
        this._dragging = false;
        this._following = false;
        this._prevCardView = null; 

        this.face = this.scene.add.image(0, 0, atlas, face);
        this.back = this.scene.add.image(0, 0, atlas, back);
        this.face.setOrigin(0.5,0.5);
        this.back.setOrigin(0.5,0.5);

        this.add(this.face);
        this.add(this.back);

        this.face.scaleX = 1;
        this.back.scaleX = 0;

        this.x = x;
        this.y = y;

        this._model.on("updated", this._updateState.bind(this));

        this.setInteractive(new Phaser.Geom.Rectangle(-this.face.width/2, -this.face.height/2, this.face.width, this.face.height), Phaser.Geom.Rectangle.Contains);
        this.scene.input.setDraggable(this);    

        this.scene.input.on('dragstart', (pointer, gameObject) => {
            if(gameObject != this) return;
            this._dragstart();
        });

        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if(gameObject != this) return;
            this._drag(dragX, dragY);                           
        });

        this.scene.input.on('dragend', (pointer, gameObject) => {
            if(gameObject != this) return;
            this._dragend();
        });

        var lastClickTime = 0;
        this.on('pointerdown', (pointer) => {
            var clickTime = this.scene.time.now;
            if(clickTime-lastClickTime < 350) {
                this._doubleclick();
            }
            lastClickTime = clickTime;
        });    

       this._updateState();       
    }

    get model() { return this._model; }
   

    _updateState() {
        if(this._model.canMove) {           
            this.setInteractive();
        } else {  
            this.disableInteractive();
        }
        this._stackView = this._stackViews.find(i=>i.model == this._model.stack);

        var prevCards = this._stackView.model.cards.filter(i => i.order < this._model.order).sort((a,b)=>-(a.order-b.order));
        var prevCard = prevCards.length > 0 ? prevCards[0] : null;
        this._prevCardView = this._cardViews.find(i=>i.model == prevCard);


        var targetX = this._stackView.x; 
        var targetY = this._stackView.y + (this._stackView.cardOffset * this._model.order);

        this._following = false;

        this._prevTweens.forEach(i => i.remove());
        this._prevTweens.length = 0;

        var flightDuration = Phaser.Math.Distance.BetweenPoints(this, {x:targetX, y:targetY})/2000 * 1000;

        this.depth = this._model.order;

        if(this.x != targetX || this.y != targetY) {
            this.depth = this._model.order + 100;
            this._prevTweens.push(this.scene.tweens.add({
                targets: this, 
                ease: 'Linear',
                x: targetX,
                y: targetY,
                duration: flightDuration,
                repeat: 0
            }));
            this._prevTweens.push(this.scene.tweens.add({
                targets: this, 
                ease: 'Linear',
                depth: this._model.order,
                duration: 0,
                delay: flightDuration,
                repeat: 0
            }));
        }

        var backScale = this._model.open ? 0 : 1;
        var faceScale = this._model.open ? 1 : 0;
       

        if(this.face.scaleX != faceScale || this.back.scaleX != backScale) {
            this._prevTweens.push(this.scene.tweens.add({
                targets: this.face,
                ease: 'Linear',
                scaleX: faceScale,
                duration: 250,
                delay: faceScale > 0 ? 250 : 0,
                repeat: 0
            }));
            this._prevTweens.push(this.scene.tweens.add({
                targets: this.back,
                ease: 'Linear',
                scaleX: backScale,
                duration: 250,
                delay: backScale > 0 ? 250 : 0,
                repeat: 0
            }));
        }

    }

    _doubleclick(){
        if(this._dragging) this._dragend();
        
        for(let i = 0; i < this._prevTweens[i]; i++) {
            if(this._prevTweens[i].isPlaying) return;
        }
        var dstStacks = this._model.table.resultStacks.concat(this._model.table.workStacks);
        for(var i = 0; i < dstStacks.length; i++) {
            if(this._model.table.move(this._model, dstStacks[i])) {
                return;
            }
        }
    }

    _dragstart() {
        this._dragging = true;
        this.depth = this._model.order + 100;
    }

    _drag(x, y) {
        if(!this._dragging) return;
        this.x = x;
        this.y = y;
    }

    _dragend() {
        if(!this._dragging) return;
        this._dragging = false;
        this.depth = this._model.order;

        let nearestStackView = this._stackViews.sort((a,b) => Phaser.Math.Distance.BetweenPoints(a, this) - Phaser.Math.Distance.BetweenPoints(b, this))[0];
        if(this._model.stack == nearestStackView.model) {
            this._updateState();
            return;
        }

        var res = this._model.table.move(this.model, nearestStackView.model);
        if(!res) {
            this._updateState();
        }
    }

    update() {
        if(this._dragging) return;
        for(let i = 0; i < this._prevTweens[i]; i++) {
            if(this._prevTweens[i].isPlaying) return;
        }
        if(this._prevCardView != null && (this._prevCardView._dragging || this._prevCardView._following) ) {
            this._following = true;
        } else if (this._following && !this._dragging) {
            this._updateState(); // resets following flag and move to proper position
            return;
        }
        if(this._following) {            
            var targetX = this._prevCardView.x;
            var targetY = this._prevCardView.y + this._stackView.cardOffset;
            this.x = targetX;
            this.y = targetY;            
            this.depth = this._prevCardView.depth + 1;
        }
    }
}


export class StackView extends Phaser.GameObjects.Container {
    _model: Stack;
    _cardOffset: integer;    

    constructor( stack: Stack, scene: Phaser.Scene, atlas: string, back: string, cardOffset:integer = 0,  x:integer = 0, y: integer = 0) {
        super(scene);
        this.scene.add.existing(this);
        this.scene = scene;

        this._model = stack;
        this._cardOffset = cardOffset;
        
        this.back = this.scene.add.image(0,0, atlas, back);
        this.back.setOrigin(0.5,0.5);
        this.back.alpha = 0.25;
        this.back.depth = -1;
        this.add(this.back);

        this.setInteractive(new Phaser.Geom.Rectangle(-this.back.width/2, -this.back.height/2, this.back.width, this.back.height), Phaser.Geom.Rectangle.Contains);

        this.x = x;
        this.y = y;
    }

    get model(){
        return this._model;
    }

    get cardOffset() {
        return this._cardOffset;
    }
}
