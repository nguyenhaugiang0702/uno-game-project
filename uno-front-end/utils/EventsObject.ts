export class EventsObject {
  events: { [key: string]: Function[] } = {}

  addEventListener = function (name: string, handler: Function) {
    if (this.events.hasOwnProperty(name)) this.events[name].push(handler)
    else this.events[name] = [handler]
  }

  removeEventListener = function (name: string, handler: Function) {
    if (!this.events.hasOwnProperty(name)) return

    const index = this.events[name].indexOf(handler)
    if (index !== -1) this.events[name].splice(index, 1)
  }

  removeAllListeners() {
    this.events = {}
  }

  fireEvent(name: string, ...args: any[]) {
    if (!this.events.hasOwnProperty(name)) return

    if (!args) args = []

    const evs = this.events[name]
    const l = evs.length

    for (let i = 0; i < l; i++) {
      evs[i](...args)
    }
  }
}

