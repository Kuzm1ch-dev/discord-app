export class Queue implements Iterator<String> {
    private pointer = 0;
  
    constructor(
        public players: String[],
    ) {}
  
    public next(): IteratorResult<String> {
        if (this.pointer < this.players.length) {
            return {
                done: false,
                value: this.players[this.pointer],
            };
        } else {
            return {
                done: true,
                value: null,
            };
        }
    }
  }