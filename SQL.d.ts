declare interface User {
  id: number
  uname: string
  email: string
  score: number
  custom: string //JSON.stringify(CustomData)
}

declare interface IRecord {
  id:number
  masterId: number
  users: string
  costTime: number
  createTime: number
  winnerGroup: number
}
declare interface CustomData {
  level: number
  bag:[
    //TODO...
  ]
}