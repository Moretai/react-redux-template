export const timeStampToString = (time) => {
  const datetime = new Date()
  datetime.setTime(time)
  const year = datetime.getFullYear()
  const month = datetime.getMonth() + 1
  const date = datetime.getDate()
  const hour = datetime.getHours() >= 10 ? datetime.getHours() : `0${datetime.getHours()}`
  const minute = datetime.getMinutes() >= 10 ? datetime.getMinutes() : `0${datetime.getMinutes()}`
  const second = datetime.getSeconds() >= 10 ? datetime.getSeconds() : `0${datetime.getSeconds()}`
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}
