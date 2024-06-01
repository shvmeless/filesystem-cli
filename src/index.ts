#!/usr/bin/env node
import { EmptyDirsManager } from './lib/sfsempty/EmptyDirsManager'
import { EmptyDirsScreen } from './lib/sfsempty/EmptyDirsScreen'
import { FileSystem } from './lib/common/Filesystem'
import { program } from 'commander'
import { resolve } from 'path'
import { cwd } from 'process'

// PROGRAM
program
  .version('0.1.0')
  .option('-d, --directory <dir>', 'Path to the directory to start the search.', cwd())
  .option('--exclude [dirs...]', 'Directories to exclude from the search.', [])
  .action((options) => {

    const origin = resolve(cwd(), options.directory as string)
    const exclude = options.exclude as Array<string>

    const manager = new EmptyDirsManager(origin)
    const screen = new EmptyDirsScreen(manager)

    const callback = (path: string, empty: boolean): void => {

      manager.increaseAnalyzed()

      if (!empty) return

      manager.add(path)
      screen.render()

    }

    FileSystem.searchEmptyDirs({ origin, exclude, callback }).then(() => {
      manager.searching = false
      screen.render()
    }).catch(console.error)

  })
  .parse(process.argv)
