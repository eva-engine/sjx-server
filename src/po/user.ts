import { Nullable } from "../tool/type";

export interface User {
  id: number
  custom: string
  createTime: number
  updateTime: number
  email: string
  score: number
  uname: string
  upass?: string
}
export type InsertUser = Nullable<User, 'id' | 'score'>;
export type TempleteUser = Nullable<InsertUser, 'email'>;
