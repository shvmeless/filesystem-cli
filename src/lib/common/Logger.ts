// IMPORTS
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// CLASS
class Logger {

  // PROPS
  private readonly path: string
  private queue: Array<string>

  // CONSTRUCTOR
  constructor () {

    this.path = join(tmpdir(), '@shvmeless', 'filesystem-empty-dirs', 'logs')
    this.queue = []

    if (!existsSync(this.path)) mkdirSync(this.path, { recursive: true })

    setInterval(() => {
      this.write()
    }, 100)

  }

  // PRIVATE
  private write (): void {

    if (this.queue.length === 0) return

    const date = new Date()
    const filename = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`
    const path = join(this.path, filename)

    if (!existsSync(this.path)) mkdirSync(this.path, { recursive: true })
    if (!existsSync(path)) writeFileSync(path, '')

    const logs = readFileSync(path, 'utf8')
    const content = this.queue.map((current) => {
      return `[${date.toLocaleString()}] ${current}`
    }).join('\n')

    writeFileSync(path, `${logs}\n${content}`)
    this.queue = []

  }

  // METHOD
  public info (data: string): void {
    this.queue.push(`INFO ${data}`)
  }

  // METHOD
  public error (error: unknown): void {
    if (error instanceof Error) this.queue.push(`ERROR ${error.message}`)
    if (typeof error === 'string') this.queue.push(`ERROR ${error}`)
    else this.queue.push('ERROR Unknown error occurred.')
  }

}

// EXPORT
export const logger = new Logger()
