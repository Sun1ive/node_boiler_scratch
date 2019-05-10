export type ConnectionOptions = {
  HOST: string;
  PORT: number;
  debugPort?: number;
};

export interface IConfig {
  socketOptions: {
    transports: string[];
    pingInterval: number;
    pingTimeout: number;
    path?: string;
  };
  serverOptions: ConnectionOptions;
  electronOptions: ConnectionOptions;
}

export interface IConfigInstance {
  getConfig(): IConfig;
}
