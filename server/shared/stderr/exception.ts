import { XRPC } from '../schemas/x-rpc.schema';

export class Exception extends Error implements XRPC.ErrorObject {
  public code: string;
  public extendedCode: number | undefined;
  public data?: XRPC.Params;

  public constructor(
    name: string,
    message: string,
    code: string,
    extendedCode?: number,
    data?: XRPC.Params
  ) {
    super(message);
    this.name = name;
    this.code = code;
    this.extendedCode = extendedCode;
    this.data = data;
  }

  public toString(): string {
    const { name, code, message, extendedCode, data, stack } = this;
    if (extendedCode) {
      return `Error ${name}[${code}/${extendedCode}]: ${message} (${JSON.stringify(
        data
      )})\n${stack}`;
    } else {
      return `Error ${name}[${code}]: ${message} (${JSON.stringify(
        data
      )})\n${stack}`;
    }
  }

  public toJSON(): XRPC.ErrorObject {
    const { name, code, message, data, extendedCode } = this;
    return { name, code, message, data, extendedCode };
  }
}
