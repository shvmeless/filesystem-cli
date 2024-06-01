// IMPORTS
import { FileSystem } from '../common/Filesystem'
import { mkdir, rmdir } from 'fs/promises'
import { logger } from '../common/Logger'

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
  private readonly _path: string
  private readonly _exclude: Array<string>

  private _directories: Array<EmptyDirectoryManagerItem>
  private _current: number

  private _analyzed: number
  private _searching: boolean
  private _deleted: number

  // CALLBACKS
  private readonly _onSearch: (path: string) => void = () => {}
  private readonly _onComplete: () => void = () => {}

  // CONSTRUCTOR
  constructor (options: {
    path: string
    exclude: Array<string>
    onSearch?: (path: string) => void
    onComplete?: () => void
  }) {

    this._path = options.path
    this._exclude = options.exclude
    this._onSearch = options.onSearch ?? (() => {})
    this._onComplete = options.onComplete ?? (() => {})

    this._analyzed = 0
    this._searching = true
    this._deleted = 0
    this._directories = []
    this._current = 0

  }

  // GETTERS
  public get path (): string { return this._path }
  public get analyzed (): number { return this._analyzed }
  public get searching (): boolean { return this._searching }
  public get deleted (): number { return this._deleted }
  public get size (): number { return this._directories.length }

  // ITEMS
  public reset (): void {
    this._analyzed = 0
    this._searching = true
    this._deleted = 0
    this._directories = []
    this._current = 0
  }

  // ITEMS
  public search (): void {

    FileSystem.searchEmptyDirs({
      origin: this._path,
      exclude: this._exclude,
      callback: (path, empty): void => {
        this._analyzed++
        if (!empty) return
        this.addItem(path)
        this._onSearch(path)
      },
    }).then((): void => {
      this._searching = false
      this._onComplete()
    }).catch((error) => { logger.error(error) })

  }

  // ITEMS
  public forEach (callback: (item: EmptyDirItemOutput) => void): void {
    for (let i = 0; i < this._directories.length; i++) {
      const item = this._directories[i]
      callback({ ...item, index: i })
    }
  }

  // ITEMS
  public getCurrentItem (): EmptyDirItemOutput | undefined {
    if (this._current < 0) return undefined
    if (this._current >= this._directories.length) return undefined
    const current = this._directories[this._current]
    if (current === undefined) return undefined
    return { ...current, index: this._current }
  }

  // ITEMS
  public addItem (path: string): EmptyDirItemOutput | undefined {
    const status = 'default'
    const index = this._directories.push({ path, status }) - 1
    logger.info(`Found empty directory: ${path}`)
    return { index, path, status }
  }

  // ITEMS
  private deleteItem (item: EmptyDirectoryManagerItem, callback: () => void): void {

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

  // ITEMS
  private restoreItem (item: EmptyDirectoryManagerItem, callback: () => void): void {

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

  // NAVIGATION
  private setCurrentIndex (current: number): EmptyDirItemOutput | undefined {

    if (current < 0) current = 0
    if (current >= this._directories.length) current = this._directories.length - 1
    this._current = current

    return this.getCurrentItem()

  }

  // NAVIGATION
  public previousItem (): EmptyDirItemOutput | undefined {
    return this.setCurrentIndex(this._current - 1)
  }

  // NAVIGATION
  public nextItem (): EmptyDirItemOutput | undefined {
    return this.setCurrentIndex(this._current + 1)
  }

  // NAVIGATION
  public clickCurrentItem ({
    onDelete = () => {},
    onRestore = () => {},
  }: {
    onDelete: () => void
    onRestore: () => void
  }): void {

    const item = this._directories[this._current]
    if (item === undefined) return

    if (item.status === 'default') this.deleteItem(item, onDelete)
    else if (item.status === 'restored') this.deleteItem(item, onDelete)
    else if (item.status === 'deleted') this.restoreItem(item, onRestore)

  }

}
