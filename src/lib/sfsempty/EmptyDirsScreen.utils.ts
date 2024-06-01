// IMPORTS
import { type EmptyDirectoryStatus } from './EmptyDirsManager'

// FUNCTION
export function formatEmptyDirectory (args: {
  path: string
  status: EmptyDirectoryStatus
  width: number
}): string {

  const status = (args.status === 'default') ? '' : args.status
  const separation = 2
  const diff = args.width - args.path.length - status.length - separation

  const padding = (diff > 0) ? ' '.repeat(diff) : ''

  return `${args.path}${padding}${status}`

}
