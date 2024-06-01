// IMPORTS
import { logger } from '../common/Logger'
import { mkdir, rmdir } from 'fs/promises'

// TYPE
export type EmptyDirectoryStatus = 'default' | 'deleting' | 'deleted' | 'restoring' | 'restored' | 'error'

// INTERFACE
export interface EmptyDirectoryManagerItem {
  path: string
  status: EmptyDirectoryStatus
}

// TYPE
export interface EmptyDirItemOutput {
  index: number
  path: string
  status: EmptyDirectoryStatus
}

// CLASS
export class EmptyDirsManager {

  // PROPS
  private readonly _path: string = ''
  private _searching: boolean = true
  private _deleted: number = 0
  private _analyzed: number = 0
  private readonly _directories: Array<EmptyDirectoryManagerItem> = []
  private _current: number = 0

  // CONSTRUCTOR
  constructor (path: string) {
    this._path = path
  }

  // GETTER
  public get searching (): boolean {
    return this._searching
  }

  // SETTER
  public set searching (value: boolean) {
    this._searching = value
  }

  // GETTER
  public get path (): string {
    return this._path
  }

  // GETTER
  public get deleted (): number {
    return this._deleted
  }

  // GETTER
  public get analyzed (): number {
    return this._analyzed
  }

  // GETTER
  public get size (): number {
    return this._directories.length
  }

  // METHOD
  public getCurrent (): EmptyDirItemOutput | undefined {
    if (this._current < 0) return undefined
    if (this._current >= this._directories.length) return undefined
    const current = this._directories[this._current]
    if (current === undefined) return undefined
    return { ...current, index: this._current }
  }

  // METHOD
  public increaseAnalyzed (): void {
    this._analyzed++
  }

  // METHOD
  public iterate (callback: (item: EmptyDirItemOutput) => void): void {
    for (let i = 0; i < this._directories.length; i++) {
      const item = this._directories[i]
      callback({ ...item, index: i })
    }
  }

  // METHOD
  public add (path: string): EmptyDirItemOutput | undefined {
    const status = 'default'
    const index = this._directories.push({ path, status }) - 1
    logger.info(`Found empty directory: ${path}`)
    return { index, path, status }
  }

  // PRIVATE
  private setCurrentIndex (current: number): EmptyDirItemOutput | undefined {

    if (current < 0) current = 0
    if (current >= this._directories.length) current = this._directories.length - 1
    this._current = current

    return this.getCurrent()

  }

  // METHOD
  public previous (): EmptyDirItemOutput | undefined {
    return this.setCurrentIndex(this._current - 1)
  }

  // METHOD
  public next (): EmptyDirItemOutput | undefined {
    return this.setCurrentIndex(this._current + 1)
  }

  // PRIVATE
  private delete (item: EmptyDirectoryManagerItem, callback: () => void): void {

    item.status = 'deleting'
    logger.info(`Trying to delete the empty directory: ${item.path}`)

    rmdir(item.path).then(() => {

      item.status = 'deleted'
      this._deleted++
      callback()
      logger.info(`Deleted the empty directory: ${item.path}`)

    }).catch((error) => {

      item.status = 'error'
      logger.error(error)

    })

  }

  // PRIVATE
  private restore (item: EmptyDirectoryManagerItem, callback: () => void): void {

    item.status = 'restoring'
    logger.info(`Restoring the empty directory: ${item.path}`)

    mkdir(item.path, { recursive: true }).then(() => {

      item.status = 'restored'
      this._deleted--
      callback()
      logger.info(`Restored the empty directory: ${item.path}`)

    }).catch((error) => {

      item.status = 'error'
      logger.error(error)

    })

  }

  // METHOD
  public click ({
    onDelete = () => {},
    onRestore = () => {},
  }: {
    onDelete: () => void
    onRestore: () => void
  }): void {

    const item = this._directories[this._current]
    if (item === undefined) return

    if (item.status === 'default') this.delete(item, onDelete)
    else if (item.status === 'restored') this.delete(item, onDelete)
    else if (item.status === 'deleted') this.restore(item, onRestore)

  }

}
