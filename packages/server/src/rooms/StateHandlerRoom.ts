import { Room, Client } from "colyseus";
import { TPlayerOptions } from "../entities/Player";
import { State, IState } from "../entities/State";

export class StateHandlerRoom extends Room<State> {
  maxClients = 8;

  onCreate(options: IState) {
    this.setState(new State(options));

    // Here's where we would add handlers for updating state
    this.onMessage("startTalking", (client, _data) => {
      console.log("startTalking");
      this.state.startTalking(client.sessionId);
    });

    this.onMessage("stopTalking", (client, _data) => {
      console.log("stopTalking");
      this.state.stopTalking(client.sessionId);
    });

    this.onMessage("ready", (client, _data) => {
      console.log("ready ", client.sessionId);
      this.state.ready(client.sessionId);
      this.broadcast("messages", `${client.id} готов!`);
    });

    this.onMessage("unready", (client, _data) => {
      console.log("unready ", client.sessionId);
      this.state.unready(client.sessionId);
      this.broadcast("messages", `${client.id} не готов!`);
    });

    this.onMessage("spectate", (client, _data) => {
      console.log("spectate", client.sessionId);
      if (this.state.spectate(client.sessionId)) {
        this.broadcast("messages", `${client.id} теперь спектатор!`);
      }
    });

    this.onMessage("play", (client, _data) => {
      console.log("play", client.sessionId);
      if (this.state.play(client.sessionId)) {
        this.broadcast("messages", `${client.id} в игре!`);
      }
    });

    this.onMessage("start", (client, _data) => {
      console.log("start", client.sessionId);
      if (this.state.start(client.sessionId)) {
        this.broadcast("start");
        this.broadcast("messages", `Игра началась!`);
        this.turn();
      }
    });

    this.onMessage("shot", (client, _data) => {
      console.log(_data);
      console.log(`${client.sessionId} shot to ${_data.targetId}`);
      if (this.state.shot()) {
        this.state.kill(_data.targetId);
        console.log(`${client.sessionId} kill ${_data.targetId}`);
        this.broadcast("messages", `${_data.targetId} был убит!`);
      }
      if (this.state.aliveCount() > 1) {
      }
      this.turn();
    });
  }

  onAuth(_client: any, _options: any, _req: any) {
    return true;
  }

  onJoin(client: Client, options: TPlayerOptions) {
    console.log("onJoin");
    this.state.createPlayer(client.sessionId, options);
    this.broadcast("messages", `${client.id} присоединился к игре!`);
  }

  onLeave(client: Client) {
    console.log("onLeave");
    this.state.removePlayer(client.sessionId);
    this.broadcast("messages", `${client.id} покинул игру!`);
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
  }

  turn() {
    console.log("Turn!");
    var nextUserId = this.state.next();
    if (nextUserId !== false && typeof nextUserId == "string") {
      var sessionId = this.state.players.get(nextUserId)?.sessionId;
      console.log(`turn ${sessionId}`);
      if (sessionId) {
        var client = this.clients.getById(sessionId);
        if (client) {
          this.broadcast("turn", {
            sessionId: sessionId,
          });
          client.send("messages", "Ваш ход!");
        }
      }
    } else {
      console.log("New Round!");
      if (this.state.newRound()) {
        this.turn();
      } else {
        this.broadcast("messages", `Все мертвы, игра окончена!`);
      }
    }
  }
}
