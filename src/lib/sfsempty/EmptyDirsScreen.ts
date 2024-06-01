// IMPORTS
import { formatEmptyDirectory } from './EmptyDirsScreen.utils'
import { type EmptyDirsManager } from './EmptyDirsManager'
import { logger } from '../common/Logger'
import blessed from 'blessed'

// CLASS
export class EmptyDirsScreen {

  // PROPERTIES
  private readonly screen: blessed.Widgets.Screen
  private readonly info: blessed.Widgets.BoxElement
  private readonly main: blessed.Widgets.BoxElement
  private readonly manager: EmptyDirsManager

  // CONSTRUCTOR
  constructor (manager: EmptyDirsManager) {

    this.manager = manager

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'my window title',
    })

    this.info = blessed.box({
      left: 0,
      top: 0,
      width: '100%',
      height: 9,
    })

    this.screen.append(this.info)

    this.main = blessed.box({
      left: 0,
      top: this.info.height,
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
      this.manager.click({
        onDelete: () => { this.render() },
        onRestore: () => { this.render() },
      })
      this.render()
    })

    // RENDER
    this.render()

  }

  // METHOD
  public refreshInfo (): void {
    try {

      this.info.setContent('')
      this.info.children.forEach((child) => {
        child.destroy()
      })

      this.info.append(blessed.text({
        left: 0,
        top: 1,
        content: `Target: {bold}${this.manager.path}{/bold}`,
        tags: true,
      }))

      this.info.append(blessed.text({
        left: 0,
        top: 3,
        padding: { left: 1 },
        content: `Directories analyzed: {bold}${this.manager.analyzed}{/bold}`,
        tags: true,
        style: {},
      }))

      this.info.append(blessed.text({
        left: 0,
        top: 4,
        padding: { left: 1 },
        content: `Empty directories found: {bold}${this.manager.size}{/bold}`,
        tags: true,
        style: {},
      }))

      this.info.append(blessed.text({
        left: 0,
        top: 5,
        padding: { left: 1 },
        content: `Deleted directories: {bold}${this.manager.deleted}{/bold}`,
        tags: true,
        style: {},
      }))

      this.info.append(blessed.text({
        left: 0,
        top: 7,
        content: (this.manager.searching ? 'Searching...' : '{bold}Search completed!{/bold}'),
        tags: true,
      }))

    } catch (error) { logger.error(error) }
  }

  // METHOD
  public refreshMain (): void {
    try {

      this.main.setContent('')

      const current = this.manager.getCurrent()

      this.manager.iterate((item) => {

        const isCurrent = (item.index === current?.index)
        const isWorking = (item.status === 'deleting' || item.status === 'restoring')
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
            inverse: isCurrent,
            fg: isWorking ? 'yellow' : (isDeleted || isError) ? 'red' : '',
          },
        })

        this.main.append(line)

      })

    } catch (error) { logger.error(error) }
  }

  // METHOD
  public render (): void {
    this.refreshInfo()
    this.refreshMain()
    this.screen.render()
  }

}
