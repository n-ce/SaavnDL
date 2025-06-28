// saavnServer.mjs
import http from 'http';
import { URL } from 'url'; // Import URL for easy query parameter parsing

const PORT = process.env.PORT || 3000;

async function handleSaavnSearch(query) {
    if (!query) {
        return {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing query parameter' })
        };
    }

    try {
        const saavnSearchUrl = `https://www.jiosaavn.com/api.php?p=1&_format=json&__call=search.getResults&q=${encodeURIComponent(query)}`;

        const searchRes = await fetch(saavnSearchUrl);
        const searchData = await searchRes.json();

        if (!searchData.results || searchData.results.length === 0) {
            return {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'No results found on JioSaavn' })
            };
        }

        const songId = searchData.results[0].id;
        const saavnSongUrl = `https://saavn.dev/api/songs/${songId}`;

        const songRes = await fetch(saavnSongUrl);
        const songData = await songRes.json();

        if (!songData.data || songData.data.length === 0 || !songData.data[0].downloadUrl) {
            return {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Download URL not found for this song' })
            };
        }

        const downloadUrls = songData.data[0].downloadUrl;

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(downloadUrls)
        };

    } catch (error) {
        console.error('Error fetching JioSaavn data:', error);
        return {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to fetch download URLs' })
        };
    }
}

const server = http.createServer(async (req, res) => {
    // Parse the URL to get query parameters
    const requestUrl = new URL(req.url, `http://localhost:${PORT}`); // Base URL needed for URL constructor
    const queryParam = requestUrl.searchParams.get('query'); // Get the 'query' parameter

    // Only respond to GET requests for the root path
    if (req.method === 'GET' && requestUrl.pathname === '/') {
        const { status, headers, body } = await handleSaavnSearch(queryParam);

        res.writeHead(status, headers);
        res.end(body);
    } else {
        // Handle other methods or paths with a 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found. Use /?query=your_song_name' }));
    }
});

server.listen(PORT, () => {
    console.log(`Vanilla Node.js (ESM) Saavn server running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/?query=faded`);
    console.log(`Try: http://localhost:${PORT}/?query=dil%20diyan%20gallan`);
});
