import {Schema, MapSchema, type} from '@colyseus/schema';
import {TPlayerOptions, Player} from './Player';

export interface IState {
  roomName: string;
  channelId: string;
}

export class State extends Schema {
  @type({map: Player})
  players = new MapSchema<Player>();

  @type('number')
  public state: number;
  /*
    0 - Ожидание игроков
    1 - Игра идет
    2 - Игра завершена
  */

  @type('string')
  public roomName: string;

  @type('string')
  public channelId: string;

  serverAttribute = 'this attribute wont be sent to the client-side';

  // Init
  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
    this.state = 0;
  }

  private _getPlayer(sessionId: string): Player | undefined {
    return Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
  }

  createPlayer(sessionId: string, playerOptions: TPlayerOptions) {
    console.log("createPlayer");
    var master = false;
    if (Object.keys(this.players.values()).length == 0){
      console.log("This is master", sessionId)
      master = true
    }
    const existingPlayer = Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
    if (existingPlayer == null) {
      var player = this.players.set(playerOptions.userId, new Player({...playerOptions, sessionId})).get(playerOptions.userId);
      if(master && player){
        player.master = true
        player.ready = true
      }
    }
  }

  removePlayer(sessionId: string) {
    const player = Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
    if (player != null) {
      this.players.delete(player.userId);
      if (player.master){
        if (Object.keys(this.players).length > 0){
          var newMaster = this.players.get(Object.keys(this.players)[0])
          if (newMaster){
            newMaster.master = true
          }
        }
      }
    }
  }

  startTalking(sessionId: string) {
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.talking = true;
    }
  }

  stopTalking(sessionId: string) {
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.talking = false;
    }
  }

  ready( sessionId: string){
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.ready = true;
    }
  }
}
