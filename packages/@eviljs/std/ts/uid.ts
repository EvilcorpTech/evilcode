import {randomInt} from './random.js'

let UidCounter = 0

export function createUid(): string {
  if (UidCounter === Number.MAX_SAFE_INTEGER) {
    UidCounter = 0
  }

  UidCounter += 1

  const timeStamp = new Date().getTime()

  return `${timeStamp}-${UidCounter}-${randomInt()}`
}
