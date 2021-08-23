import absoluteUrl from 'absolute-url'
import rewrite from 'camouflage-rewrite'
import cottonCandy from 'cotton-candy'
import express from 'express'
import SparqlClient from 'sparql-http-client/ParsingClient.js'
import listArticles from './lib/listArticles.js'

function mapUrlFactory ({ baseURL }) {
  return url => {
    return url.startsWith(baseURL) ? url.slice(baseURL.length - 1) : url
  }
}

async function main ({ baseURL, endpointUrl }) {
  const mapUrl = mapUrlFactory({ baseURL })
  const client = new SparqlClient({ endpointUrl })
  const app = express()

  app.engine('es6.html', cottonCandy())
  app.set('views', './views')
  app.set('view engine', 'es6.html')

  app.use(absoluteUrl())
  app.use(rewrite({ url: baseURL }))

  app.get('/', async (req, res, next) => {
    try {
      const articles = await listArticles({ client })

      res.render('index', { articles, mapUrl })
    } catch (err) {
      next(err)
    }
  })

  app.get(/\/article\/.*/, async (req, res, next) => {
    try {
      const url = req.absoluteUrl()
      const article = (await listArticles({ article: url, client }))[0]

      res.render('article', { article, mapUrl })
    } catch (err) {
      next(err)
    }
  })

  app.get(/\/channel\/.*/, async (req, res, next) => {
    try {
      const url = req.absoluteUrl()
      const articles = await listArticles({ channel: url, client })

      res.render('index', { articles, mapUrl })
    } catch (err) {
      next(err)
    }
  })

  app.listen(4000)
}

main({
  baseURL: 'http://localhost/',
  endpointUrl: 'http://localhost:3030/news/query'
})
