import { ResultCode, ResultMessage } from "./const";

export class Result {
  readonly isResult = true
  static OK = new Result(ResultCode.OK, ResultMessage.OK)
  static withData(data: any) {
    return new Result(ResultCode.OK, ResultMessage.OK, data);
  }
  constructor(public readonly code: number, public readonly message: string = '', public readonly data?: any) { }
}