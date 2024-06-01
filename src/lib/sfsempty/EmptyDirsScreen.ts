// IMPORTS
import { formatEmptyDirectory } from './EmptyDirsScreen.utils'
import { type EmptyDirsManager } from './EmptyDirsManager'
import { logger } from '../common/Logger'
import blessed from 'blessed'

// CLASS
export class EmptyDirsScreen {

  // PROPERTIES
  private readonly screen: blessed.Widgets.Screen
  private readonly main: blessed.Widgets.BoxElement
  private readonly manager: EmptyDirsManager

  // CONSTRUCTOR
  constructor (manager: EmptyDirsManager) {

    this.manager = manager

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'my window title',
    })

    this.main = blessed.box({
      left: 0,
      top: 0,
      width: '100%',
      scrollable: true,
    })

    this.screen.append(this.main)

    // EVENTS

    this.screen.key(['q', 'C-c'], () => {
      return process.exit(0)
    })

    this.screen.key(['up', 'k'], () => {
      const current = this.manager.getCurrent()
      const previous = this.manager.previous()
      if (current?.index === previous?.index) return
      if (previous !== undefined) this.main.scrollTo(previous.index)
      this.render()
    })

    this.screen.key(['down', 'j'], () => {
      const current = this.manager.getCurrent()
      const next = this.manager.next()
      if (current?.index === next?.index) return
      if (next !== undefined) this.main.scrollTo(next.index)
      this.render()
    })

    this.screen.key(['space'], () => {
      this.manager.delete(() => {
        this.render()
      })
      this.render()
    })

    // RENDER
    this.render()

  }

  // METHOD
  public refreshMain (): void {
    try {

      this.main.setContent('')

      const current = this.manager.getCurrent()

      this.manager.iterate((item) => {

        const isCurrent = (item.index === current?.index)
        const isDeleting = (item.status === 'deleting')
        const isDeleted = (item.status === 'deleted')
        const isError = (item.status === 'error')

        const content = formatEmptyDirectory({
          path: item.path,
          status: item.status,
          width: parseInt(this.main.width.toString()),
        })

        const line = blessed.box({
          top: item.index,
          left: 0,
          width: '100%',
          height: 1,
          content,
          tags: true,
          style: {
            fg: isCurrent ? 'white' : isDeleting ? 'yellow' : (isDeleted || isError) ? 'red' : '',
            bg: isCurrent ? 'black' : '',
          },
        })

        this.main.append(line)

      })

    } catch (error) { logger.error(error) }
  }

  // METHOD
  public render (): void {
    this.refreshMain()
    this.screen.render()
  }

}
