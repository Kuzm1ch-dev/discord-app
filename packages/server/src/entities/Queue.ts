export class Queue implements Iterator<string> {
    private pointer = 0;
  
    constructor(
        public players: string[],
    ) {}
  
    public next(): IteratorResult<string> {
        if (this.pointer < this.players.length) {
            return {
                done: false,
                value: this.players[this.pointer++],
            };
        } else {
            return {
                done: true,
                value: null,
            };
        }
    }
  }