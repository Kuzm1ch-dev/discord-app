import {Schema, type} from '@colyseus/schema';

export type TPlayerOptions = Pick<Player, 'sessionId' | 'userId' | 'name' | 'avatarUri' | 'talking' | 'ready' | 'master' | 'alive' | 'state'>;

export class Player extends Schema {
  @type('string')
  public sessionId: string;

  @type('string')
  public userId: string;

  @type('string')
  public avatarUri: string;

  @type('string')
  public name: string;

  @type('boolean')
  public talking: boolean = false;

  @type('boolean')
  public ready: boolean = false;

  @type('boolean')
  public master: boolean = false;

  @type('boolean')
  public alive: boolean = true;

  @type('number')
  public state: number = 1;

  // Init
  constructor({name, userId, avatarUri, sessionId}: TPlayerOptions) {
    super();
    this.userId = userId;
    this.avatarUri = avatarUri;
    this.name = name;
    this.sessionId = sessionId;
  }
}
