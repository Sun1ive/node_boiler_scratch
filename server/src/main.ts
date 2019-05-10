import SocketIO from 'socket.io';
import { config } from 'dotenv';
import * as IO from 'socket.io-client';
import { basename, resolve } from 'path';
import 'source-map-support/register';
import { ExpressServer } from './providers/express/server';
import { Config } from './config/config';
import { SwitchBoard } from './providers/switch.board/switch.board';
import { ConnectionOptions } from './interfaces/config.interface';
import { ClientEPExtension } from './extensions/client.ep.extension';

const isProduction = process.env.NODE_ENV === 'production';

config({
  path: isProduction ? resolve('.env.production') : resolve('.env.development')
});

function createClient(
  serverOpt: ConnectionOptions,
  socketOptions: SocketIO.ServerOptions
): SocketIOClient.Socket {
  return IO.connect(
    `http://${serverOpt.HOST}:${serverOpt.PORT}/`,
    socketOptions
  );
}

(async () => {
  console.log(`[${basename(__filename)}] Started`);
  const config = Config.instance;
  const server = ExpressServer.instance;
  const { socketOptions, serverOptions } = config.getConfig();

  const io = SocketIO(server.server, socketOptions);
  const switchBoard = new SwitchBoard(io.of('/'));

  ClientEPExtension.create(createClient(serverOptions, socketOptions));
  const onStop = (signal: string) => {
    console.log('Process exit by %s', signal);
    switchBoard.stop();
    ClientEPExtension.instance.stop();
    server.stop();
  };

  process.on('SIGTERM', onStop);
  process.on('SIGINT', onStop);
})();
