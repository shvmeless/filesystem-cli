// IMPORTS
import { logger } from '../common/Logger'
import { existsSync, statSync } from 'fs'
import { readdir } from 'fs/promises'
import { basename, join } from 'path'

// FUNCTION
async function searchEmptyDirs (options: {
  origin: string
  exclude?: Array<string>
  callback: (path: string, empty: boolean) => void
}): Promise<void> {

  const { origin, callback } = options
  const exclude = new Set(options.exclude ?? [])

  const targets: Array<string> = [origin]
  while (targets.length > 0) {
    try {

      const target = targets.shift()

      if (target === undefined) break
      if (exclude.has(basename(target))) continue
      if (!existsSync(target)) continue
      if (!statSync(target).isDirectory()) continue

      const content = await readdir(target)
      callback(target, (content.length === 0))

      for (const item of content) {
        const path = join(target, item)
        targets.push(path)
      }
    } catch (error) { logger.error(error) }
  }

}

// MODULE
export const FileSystem = {
  searchEmptyDirs,
}
