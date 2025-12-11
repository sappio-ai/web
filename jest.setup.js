// Jest setup file
import { config } from 'dotenv'
import { resolve } from 'path'
import '@testing-library/jest-dom'

// Load .env.local for tests
config({ path: resolve(process.cwd(), '.env.local') })
