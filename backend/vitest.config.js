import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      './tests/unit/application/usecases/*.test.js',
      './tests/unit/controllers/*.test.js',
      './tests/unit/domain/models/*.test.js',
      './tests/unit/infrastructure/repositories/*.test.js',
      './tests/unit/infrastructure/cache/*.test.js',
      './tests/unit/infrastructure/database/*.test.js',
      './tests/unit/infrastructure/database/models/*.test.js',
      './tests/unit/infrastructure/container/*.test.js',
      './tests/unit/routes/*.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['json','text', ['text-summary', { file: './text-summary.txt' }]],
      include: ['src/**/*.js'],
      exclude: ['node_modules/**', 'tests/**'],
      threshold: { // Umbrales de cobertura
        statements: 80, // Cobertura mínima de declaraciones
        branches: 75, // Cobertura mínima de ramas
        functions: 85, // Cobertura mínima de funciones
        lines: 80, // Cobertura mínima de líneas
      },
    },
    // Opcional: añadir más configuraciones según sea necesario
    watchExclude: ['**/node_modules/**', '**/dist/**']
  }
})


