import path from 'path'
import minimist from 'minimist'
import { createRequire } from 'module'

export const require = createRequire(import.meta.url)

export const $argv = () => minimist(process.argv.slice(2))

// file
export const ROOT_PATH = process.cwd()
export const PACKAGE_PATH = path.join(ROOT_PATH, 'package.json')
export const LOG_PATH = path.join(ROOT_PATH, 'CHANGE_LOG.md')
export const UPDATE_LOG_PATH = path.join(ROOT_PATH, 'updater', 'UPDATE_LOG.md')
export const TAURI_CONF_PATH = path.join(ROOT_PATH, 'src-tauri', 'tauri.conf.json')
export const UPDATER_JSON_PATH = path.join(ROOT_PATH, 'updater', 'update.json')
export const packageJSON = (): Record<string, any> => require(PACKAGE_PATH)
export const tauriConfJSON = (): Record<string, any> => require(TAURI_CONF_PATH)
export const relativePath = (p: string): string => `${p.split(ROOT_PATH)?.[1].substring(1)}` || ''
