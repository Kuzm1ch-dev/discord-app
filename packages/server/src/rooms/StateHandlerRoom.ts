import {Room, Client} from 'colyseus';
import {TPlayerOptions} from '../entities/Player';
import {State, IState} from '../entities/State';

export class StateHandlerRoom extends Room<State> {
  maxClients = 1000;

  onCreate(options: IState) {
    this.setState(new State(options));

    // Here's where we would add handlers for updating state
    this.onMessage('startTalking', (client, _data) => {
      console.log("startTalking")
      this.state.startTalking(client.sessionId);
    });

    this.onMessage('stopTalking', (client, _data) => {
      console.log("stopTalking")
      this.state.stopTalking(client.sessionId);
    });

    this.onMessage('ready', (client, _data) => {
      console.log("ready ", client.sessionId)
      this.state.ready(client.sessionId);
    });

    this.onMessage('unready', (client, _data) => {
      console.log("unready ", client.sessionId)
      this.state.unready(client.sessionId);
    });

    this.onMessage('start', (client, _data) => {
      console.log("start ", client.sessionId)
      this.state.start(client.sessionId);
    });

    this.onMessage("spectate", (client, _data) => {
      console.log("spectate ", client.sessionId)
      this.state.spectate(client.sessionId);
    });
  }

  onAuth(_client: any, _options: any, _req: any) {
    return true;
  }

  onJoin(client: Client, options: TPlayerOptions) {
    console.log("onJoin")
    this.state.createPlayer(client.sessionId, options);
  }

  onLeave(client: Client) {
    console.log("onLeave")
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log('Dispose StateHandlerRoom');
  }
}
