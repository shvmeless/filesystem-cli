// IMPORTS
import { logger } from '../common/Logger'
import { rmdir } from 'fs/promises'

// TYPE
export type EmptyDirectoryStatus = 'default' | 'deleting' | 'deleted' | 'error'

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

  // PROPERTIES
  private readonly _directories: Array<EmptyDirectoryManagerItem> = []
  private _current: number = 0

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

  // METHOD
  public delete (onDelete: () => void = () => {}): void {

    const item = this._directories[this._current]
    if (item === undefined) return
    if (item.status !== 'default') return

    item.status = 'deleting'
    logger.info(`Trying to delete the empty directory: ${item.path}`)

    rmdir(item.path).then(() => {
      item.status = 'deleted'
      onDelete()
      logger.info(`Deleted the empty directory: ${item.path}`)
    }).catch((error) => {
      item.status = 'error'
      logger.error(error)
    })

  }

}
