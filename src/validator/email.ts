import { expect } from "../tool/validate";

export const emailCodeValidator = expect({
  email: [
    ['regexp', /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/]
  ]
});