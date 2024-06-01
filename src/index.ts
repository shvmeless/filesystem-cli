#!/usr/bin/env node
import { EmptyDirsManager } from './lib/sfsempty/EmptyDirsManager'
import { EmptyDirsScreen } from './lib/sfsempty/EmptyDirsScreen'
import { logger } from './lib/common/Logger'
import { program } from 'commander'
import { resolve } from 'path'
import { cwd } from 'process'

// PROGRAM
program
  .version('0.1.0')
  .option('-d, --directory <dir>', 'Path of the directory from where to start the search.', cwd())
  .option('--exclude [dirs...]', 'Directories to exclude from the search.', [])
  .action((options) => {
    try {

      const path = resolve(cwd(), options.directory as string)
      const exclude = options.exclude as Array<string>
      const onSearch = (): void => { screen.render() }
      const onComplete = (): void => { screen.render() }

      const manager = new EmptyDirsManager({ path, exclude, onSearch, onComplete })
      const screen = new EmptyDirsScreen(manager)

      manager.search()

    } catch (error) { logger.error(error) }
  })
  .parse(process.argv)
