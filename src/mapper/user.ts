import { format, OkPacket } from "mysql2";
import { InsertUser, User } from "../po/user";
import { pool } from "../tool/database";

export async function getUserById(id: number) {
  return ((await pool.execute('select * from user where id = ?', [id]))[0] as User[])[0];
}
export async function getUserByEmail(email: string) {
  return ((await pool.execute('select * from user where email = ?', [email]))[0] as User[])[0];
}

export async function insertUser(user: InsertUser) {
  const sql = format('insert into user set ?', user);
  return (await pool.execute(sql))[0] as OkPacket;
}

export async function updateUser(id: number, user: User) {
  const sql = format('update user set ? where id = ?', [user, id]);
  return (await pool.execute(sql))[0] as OkPacket;
}

export async function getUserByUname(uname: string) {
  return ((await pool.execute('select * from user where uname = ?', [uname]))[0] as User[])[0];
}

export async function getUsersOrderByRank(from: number, to: number) {
  return (await pool.query('select id, uname, score, createTime from user order by score desc limit ?, ?', [from, to]))[0] as User[];
}

export async function getRankByUserId(id: number) {
  return (await pool.execute('select count(id) from user where score > (select score from user where id = ?)', [id]))[0] as User[];
}