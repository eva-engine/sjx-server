import { format, OkPacket } from "mysql2";
import { InsertUser, User } from "../po/user";
import { pool } from "../tool/database";

export async function getUserById(id: number) {
  return ((await pool.execute('select * from user_base where id = ?', [id]))[0] as User[])[0];
}
export async function getUserByEmail(email: string) {
  return ((await pool.execute('select * from user where email = ?', [email]))[0] as User[])[0];
}

export async function insertUser(user: InsertUser) {
  const sql = format('insert into user_base set ?', user);
  return (await pool.execute(sql))[0] as OkPacket;
}

export async function updateUser(id: number, user: User) {
  const sql = format('update user set ? where id = ?', [user, id]);
  return (await pool.execute(sql))[0] as OkPacket;
}