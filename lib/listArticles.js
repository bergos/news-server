async function listArticles ({ article, channel, client }) {
  const query = `
    PREFIX rss: <http://purl.org/rss/1.0/>
    PREFIX schema: <http://schema.org/>
    
    SELECT * WHERE {
      GRAPH ?g0 {
        ?channel rss:items ?item.
        ?item
          rss:link ?link;
          rss:title ?rssTitle;
          rss:description ?rssAbstract;
          rss:pubDate ?rssDate.
      }
    
      GRAPH ?g1 {
        ?link schema:sameAs ?article.
        ?article
          schema:about ?about;
          schema:title ?title;
          schema:abstract ?abstract;
          schema:content ?content.
      }

      OPTIONAL {
        GRAPH ?g2 {
          SELECT * WHERE {
            ?article schema:image ?image.
          } LIMIT 1
        }
      }

      ${article ? `FILTER(?article = <${article}>)` : ''}
      ${channel ? `FILTER(?channel = <${channel}>)` : ''}
    } ORDER BY DESC(?rssDate)
  `

  return client.query.select(query)
}

export default listArticles
