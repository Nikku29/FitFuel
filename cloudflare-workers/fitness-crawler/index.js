export default {
  /**
   * FitFuel Edge Crawler
   * A high-speed serverless web scraper deployed on Cloudflare Workers.
   * Uses HTMLRewriter to stream-parse DOM and extract fitness articles or recipe metadata.
   */
  async fetch(request, env, ctx) {
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Fetch the target webpage
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'FitFuel-Edge-Crawler/1.0',
          'Accept': 'text/html'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch target URL: ${response.status}`);
      }

      // We will extract data using HTMLRewriter
      const data = {
        title: '',
        metaDescription: '',
        paragraphs: [],
        images: []
      };

      // Stream the response through HTMLRewriter for ultra-fast DOM parsing at the edge
      const rewriter = new HTMLRewriter()
        .on('title', {
          text(text) {
            data.title += text.text;
          }
        })
        .on('meta[name="description"]', {
          element(element) {
            data.metaDescription = element.getAttribute('content') || '';
          }
        })
        .on('p', {
          text(text) {
            if (text.text.trim().length > 0) {
              data.paragraphs.push(text.text.trim());
            }
          }
        })
        .on('img', {
          element(element) {
            const src = element.getAttribute('src');
            if (src && !src.startsWith('data:')) {
              data.images.push(src);
            }
          }
        });

      // Process the stream
      await rewriter.transform(response).text();

      // Clean up the data
      const cleanedData = {
        title: data.title.trim(),
        description: data.metaDescription,
        // Send up to 5 paragraphs of main content
        contentSnippet: data.paragraphs.join(' ').substring(0, 1000) + '...',
        heroImage: data.images.length > 0 ? data.images[0] : null,
        source: targetUrl,
        crawledAt: new Date().toISOString()
      };

      // CORS headers allowing our main frontend to call this crawler
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
      };

      return new Response(JSON.stringify(cleanedData, null, 2), {
        status: 200,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
