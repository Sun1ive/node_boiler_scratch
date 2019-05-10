import { IConfigInstance, IConfig } from '../interfaces/config.interface';
import { basename } from 'path';

export class Config implements IConfigInstance {
  private static _instance: Config;

  private constructor() {
    console.log(`[${basename(__filename)}] Config \n%o`, this.getConfig());
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new Config();

      return this._instance;
    }

    return this._instance;
  }

  public getConfig(): IConfig {
    return {
      socketOptions: {
        transports: ['websocket'],
        pingInterval: 5000,
        pingTimeout: 25000,
        path: '/'
      },

      serverOptions: {
        HOST: process.env.HOST || '127.0.0.1',
        PORT: process.env.PORT ? +process.env.PORT : 3000
      },

      electronOptions: {
        HOST: process.env.HOST || '127.0.0.1',
        PORT: process.env.PORT ? +process.env.PORT : 3000,
        debugPort: 9229
      }
    };
  }
}
