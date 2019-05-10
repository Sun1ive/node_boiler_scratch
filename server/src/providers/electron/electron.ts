import { app } from 'electron';
import { Config } from '../../config/config';
import { createMainWindow } from './create.main.window';
console.log(`[ELECTRON] Open electron window.`);

async function main(): Promise<void> {
  console.log(`[ELECTRON] main()`);
  app.disableHardwareAcceleration();
  app.once('window-all-closed', () => {
    app.exit(0);
  });

  const config = Config.instance;
  const { electronOptions } = config.getConfig();
  if (electronOptions.debugPort) {
    // console.log(`[ELECTRON] 'remote-debugging-port'`, electronOpt.debugPort);
    app.commandLine.appendSwitch(
      'remote-debugging-port',
      electronOptions.debugPort.toString()
    );
  }

  console.log(`[ELECTRON] is ready`, app.isReady());
  if (app.isReady()) {
    return;
  }

  console.log(`[ELECTRON] wait for ready`);
  return await new Promise((res, rej) => {
    app.on('ready', async () => {
      console.log(`[ELECTRON] Ready.`);
      await createMainWindow();
      res();
    });

    setTimeout(() => {
      rej(`[ELECTRON] Ready timeout`);
    }, 20 * 1000);
  });
}

async function stop() {
  console.log(`[ELECTRON] stop()`);
  app.exit(2);
}

if (require.main === module) {
  process.on('SIGTERM', stop);
  process.on('SIGQUIT', stop);
  process.on('SIGINT', stop);
  main().catch(error => {
    console.error('[UNHANDLED]', error);
    app.exit(1);
  });
}
