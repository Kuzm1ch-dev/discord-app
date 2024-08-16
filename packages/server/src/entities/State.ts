import {Schema, MapSchema, type} from '@colyseus/schema';
import { boolean } from '@colyseus/schema/lib/encoding/decode';
import { throws } from 'assert';
import {TPlayerOptions, Player} from './Player';
import {Queue} from "./Queue";

export interface IState {
  roomName: string;
  channelId: string;
}

export class State extends Schema {
  @type({map: Player})
  players = new MapSchema<Player>();

  /*
    0 - Ожидание игроков
    1 - Игра идет
    2 - Игра завершена
  */
  @type('number')
  public stage: number;

  @type('number')
  public round: number = 0;

  @type('string')
  public roomName: string;

  @type('string')
  public channelId: string;

  serverAttribute = 'this attribute wont be sent to the client-side';
  queue: Queue = new Queue([]);

  // Init
  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
    this.stage = 0;
  }

  private _getPlayer(sessionId: string): Player | undefined {
    return Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
  }

  private _getPlayersCount(): number{
    return Array.from(this.players.values()).filter((p) => p.mode == 1).length
  }

  private _changeMaster(){
    if (this._getPlayersCount() > 0){
      var newMaster = this.players.get(this.players.keys().next().value)
      if (newMaster){
        newMaster.master = true
        newMaster.ready = true
        newMaster.mode = 1
      }
    }
  }

  createPlayer(sessionId: string, playerOptions: TPlayerOptions) {
    console.log("createPlayer");
    var master = false;
    console.log(this._getPlayersCount());
    if (this._getPlayersCount() == 0){
      console.log("This is master", sessionId)
      master = true
    }
    const existingPlayer = Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
    if (existingPlayer == null) {
      var player = this.players.set(playerOptions.userId, new Player({...playerOptions, sessionId})).get(playerOptions.userId);
      if(player){
        if(master){
          player.master = true
          player.ready = true
        }
        if(this.stage > 0){
          player.alive = false
          player.mode = 0
        }
      }
    }
  }

  removePlayer(sessionId: string) {
    const player = Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
    if (player != null) {
      this.players.delete(player.userId);
      if (player.master){
        this._changeMaster()
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

  unready( sessionId: string){
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.ready = false;
    }
  }

  spectate( sessionId: string): boolean{
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.mode = 0;
      player.alive = false;
      player.ready = false;
      return true;
    }
    return false;
  }

  play( sessionId: string): boolean{
    const player = this._getPlayer(sessionId);
    if (player != null) {
      player.mode = 1;
      if (this.stage > 0) player.alive = false;
      player.ready = false;
      return true;
    }
    return false;
  }

  start( sessionId: string): boolean{
    const player = this._getPlayer(sessionId);
    const allPlayersReady = Array.from(this.players.values()).filter((p) => p.ready == true && p.mode == 1).length  == this._getPlayersCount()
    if (player != null && player.master && allPlayersReady) {
      this.stage = 1
      this.newRound();
      return true
    }
    return false
  }

  next(): string | boolean{
    var player = this.queue.next()
    if (!player.done){
      return player.value;
    }
    return true
  }

  newRound(){
    this.round += 1;
    this.queue = new Queue(Array.from(this.players.keys()).filter((k) => this.players.get(k)?.alive && this.players.get(k)?.mode == 1));
  }

  shot(): boolean {
    var min = 1
    var max = 6
    return (Math.random() * (max - min) + min) == min;
  }

  kill( userId: string) {
    const player = this.players.get(userId)
    if (player != null) {
      player.alive = false;
      console.log(`${player.sessionId} killed!`)
    }
  }
}
