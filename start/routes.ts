import router from '@adonisjs/core/services/router'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globalThrottle, createThrottle } from '#start/limiter'

const ItensController = () => import('#controllers/itens_controller')
const ComprasController = () => import('#controllers/compras_controller')
const HealthController = () => import('#controllers/health_controller')

router
  .group(() => {
    router.get('/', [ItensController, 'index']).use(globalThrottle)
    router.post('/', [ItensController, 'store']).use(createThrottle)
  })
  .prefix('/itens')

router
  .group(() => {
    router.get('/', [ComprasController, 'index']).use(globalThrottle)
    router.post('/', [ComprasController, 'store']).use(createThrottle)
  })
  .prefix('/compras')

router.get('/health', [HealthController, 'index'])

router.get('/swagger', async ({ response }) => {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Montree Shop List API - Swagger</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    SwaggerUIBundle({
      url: '/swagger.yml',
      dom_id: '#swagger-ui',
      deepLinking: true,
    })
  </script>
</body>
</html>`

  return response.header('content-type', 'text/html').send(html)
})

router.get('/swagger.yml', async ({ response }) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const yamlPath = path.resolve(dirname, '..', 'docs', 'swagger.yml')
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  return response.header('content-type', 'application/x-yaml').send(yamlContent)
})
