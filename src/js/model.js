import { EventEmitter } from 'events'; 
import { basename } from 'path';

export type Suit = 0|1|2|3 ;
export const SuitValues:Array<Suit> = [0,1,2,3];

export type Rank = 0|1|2|3|4|5|6|7|8|9|10|11|12; // ACE->2..10->J->Q->K
export const RankValues:Array<Rank> = [0,1,2,3,4,5,6,7,8,9,10,11,12];

export class Card extends EventEmitter {
    _table: Table; // I am not using private fields because of garbage in the code after the compilation
    _suit: Suit;
    _rank: Rank;
    _stack: Stack;
    _order: number;
    _open: boolean;

    constructor (table: Table, suit: Suit, rank: Rank, stack: Stack, order: number, open: boolean){
        super();
        this._table = table;
        this._suit = suit;
        this._rank = rank;
        this._stack = stack;
        this._order = order;
        this._open = open;        
    }

    get table() { return this._table; }
    get suit() { return this._suit; }
    get rank() { return this._rank; }
    get stack() { return this._stack; }
    get order() { return this._order; }
    get open() { return this._open; }
    get canMove(): boolean {
        if(!this._open) return false;

        if(this._stack instanceof WorkStack) return true;
        return this._stack.cards.length - 1 == this._order;
    }

    _update(value: {stack?: Stack, order?: number, open?: boolean}){
        let changed = false;
        if(value.stack != null && this._stack !== value.stack) {
            this._stack = value.stack;
            changed = true;
        }
        if(value.order != null && this._order !== value.order) {
            this._order = value.order;
            changed = true;
        }
        if(value.open != null && this._open !== value.open) {
            this._open = value.open;
            changed = true;
        }
        if(changed) {
            this.emit("updated", this);
        }
    }
}

export class Stack extends EventEmitter {
    _table: Table;

    constructor(table: Table) {
        super();
        this._table = table;
    }

    _canAdd(card: Card): boolean {
        return false;
    }

    _add(card: Card) {
        card._update({stack: this, order: this.cards.length});
        this.emit("addCard");
    }

    get cards(): Array<Card> {
        const res = this._table.cards.filter(c=>c.stack == this);
        res.sort((a,b)=>a.order-b.order);
        return res;
    }
}

class ResultStack extends Stack {
    _suit: Suit;

    constructor(table:Table, suit: Suit){
        super(table)
        this._suit = suit;
    }

    _canAdd(c: Card):boolean {
        if(!c.open || c.suit != this._suit) return false;
        if(c.stack instanceof WorkStack && c.order != c.stack.cards.length-1) return;
        const cards = this.cards;
        if(cards.length == 0){
            return c.rank == RankValues[0];
         }
         const lastCard = cards[cards.length-1];        
         return c.rank == lastCard.rank + 1;
    }
}

class WorkStack extends Stack {
    constructor(table: Table){
        super(table)
    }
    _canAdd(c: Card){
        if(!c.open ) return false;
        const cards = this.cards;
        if(cards.length == 0){
            return c.rank == RankValues[RankValues.length-1];
        }
        const lastCard = cards[cards.length-1];
        return c.suit % 2 != lastCard.suit % 2 && c.rank == lastCard.rank - 1;
    }
    _add(card: Card) {
        var cardsToAdd = [];
        if(card.stack instanceof WorkStack) {
            cardsToAdd = card.stack.cards.filter(i => i.order >= card.order);
        } else {
            cardsToAdd = [card];
        }
        cardsToAdd.forEach(c => {
            c._update({stack: this, order: this.cards.length});    
        });        
        this.emit("addCard");
    }
}

class UnusedStack extends Stack {
    _open:boolean;
    constructor(table: Table, open: boolean = false){
        super(table);
        this._open = open;
    }
    _add(card: Card) {
        card._update({stack: this, order: this.cards.length, open: this._open});
        this.emit("addCard");
    }
}


export class Table extends EventEmitter {
    _cards: Array<Card>
    _closedUnusedStack: UnusedStack
    _openUnusedStack: UnusedStack
    _workStacks: Array<WorkStack>
    _resultStacks: Array<ResultStack>
    _moves: number

    get moves(): number { return this._moves; }
    get cards(): Array<Card> { return this._cards; }
    get closedUnusedStack() {return this._closedUnusedStack;}
    get openUnusedStack() {return this._openUnusedStack;}
    get workStacks() { return this._workStacks; }
    get resultStacks() { return this._resultStacks; }

    constructor(){
        super()
        this._closedUnusedStack = new UnusedStack(this, false);
        this._openUnusedStack = new UnusedStack(this, true);
        this._workStacks = [...Array(7)].map(i=>new WorkStack(this));
        this._resultStacks = SuitValues.map(i=>new ResultStack(this, i));

        let i = 0;
        this._cards = SuitValues.flatMap(
            s => RankValues.map(
                r => new Card(this, s, r, this._closedUnusedStack, i++, false) 
            )
        );

        this._moves = 0;     
    }

    switchToNextUnusedCard(){
        if(this._closedUnusedStack.cards.length == 0){
            if(this._openUnusedStack.cards.length == 0) {
                return;
            }
            this._openUnusedStack.cards.reverse().forEach( c=> this._closedUnusedStack._add(c));
        }
        var closedCards = this._closedUnusedStack.cards;
        this._openUnusedStack._add(closedCards[closedCards.length-1]);
        this._incMoves();
    }
    
    _incMoves(){
        this._moves++;
        this.emit("move", this);
    }   
    
    _openWorkStack() {
        this._workStacks.forEach(w => {
            var cards = w.cards;
            if(cards.length <= 0) return;
            var lastCard = cards[cards.length-1];
            lastCard._update({open:true});
        });
    }

    _checkWinCondition(){
        let allCardsInResultStacks = true;
        this._cards.forEach(c => {
            if(!(c.stack instanceof ResultStack)) {
                allCardsInResultStacks = false;
            }
        });
        if(allCardsInResultStacks) {
            this.emit("win", this);
            console.log("win");
        }
    }

    restart() {
        this._cards.forEach(c => this._openUnusedStack._add(c));

        // shuffle cards
        var cardsUnsorted = this._cards.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(i=>i[0])

        // add cards to work stacks
        for(let wi = 0; wi < this._workStacks.length; wi++){
            for(let i = 0; i < wi; i++) {
                var c = cardsUnsorted.pop();
                c._update({open: false});
                this.workStacks[wi]._add(c);
            }
            var c = cardsUnsorted.pop();
            c._update({open: true});
            this.workStacks[wi]._add(c);
        }

        // add other cards to unused stack        
        while(cardsUnsorted.length > 0) {
            var c = cardsUnsorted.pop();
            this._closedUnusedStack._add(c);
        }

        this._moves = 0;
        this.emit("start", this);
    }

    move(card, stack): boolean {
        if(stack._canAdd(card)) {
            stack._add(card);
            this._openWorkStack();
            this._incMoves();
            this._checkWinCondition();
            return true;
        } else {
            return false;
        }

    }
}