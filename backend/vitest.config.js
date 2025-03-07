import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      './tests/unit/application/usecases/*.test.js',
      './tests/unit/controllers/*.test.js',
      './tests/unit/domain/models/*.test.js',
      './tests/unit/infrastructure/repositories/*.test.js'
    ],
    // Opcional: añadir más configuraciones según sea necesario
    watchExclude: ['**/node_modules/**', '**/dist/**']
  }
})