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
  .action((options) => {

    const path = resolve(cwd(), options.directory as string)

    const manager = new EmptyDirsManager(path)
    const screen = new EmptyDirsScreen(manager)

    FileSystem.searchEmptyDirs(path, (path, empty) => {

      manager.increaseAnalyzed()

      if (!empty) return

      manager.add(path)
      screen.render()

    }).then(() => {
      manager.searching = false
      screen.render()
    }).catch(console.error)

  })
  .parse(process.argv)
