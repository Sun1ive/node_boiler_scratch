import express from 'express';
import { createServer, Server } from 'http';
import compression from 'compression';
import { join, basename } from 'path';
import { Config } from '../../config/config';

export class ExpressServer {
  private static _instance: ExpressServer;
  private _server: Server | undefined;
  private readonly _app: express.Application;

  private constructor() {
    console.log(`[${basename(__filename)}] Create express app.`);
    const app = express();
    const config = Config.instance;
    const { serverOptions } = config.getConfig();
    const { HOST, PORT } = serverOptions;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(compression());
    app.use(express.static(join(__dirname, '../../../../client/build')));
    this._app = app;
    this._server = createServer(app);
    this._server.listen(PORT, HOST, () => {
      console.log(`Application listening on http://${HOST}:${PORT}`);
    });
  }

  public static get instance(): ExpressServer {
    if (!this._instance) {
      this._instance = new ExpressServer();

      return this._instance;
    }
    return this._instance;
  }

  public get app(): express.Application {
    return this._app;
  }

  public get server(): Server {
    if (!this._server) {
      throw new Error('Illegal usage: not initialized');
    }
    return this._server;
  }

  public stop() {
    console.info(`[${basename(__filename)}] SERVER IS GOING TO STOP`);
    if (this._server) {
      this._server.removeAllListeners();
    }

    this._server = undefined;
    console.info(`[${basename(__filename)}] SERVER COMPLETELY STOPPED!`);
    process.exit(0);
  }
}
