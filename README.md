# SaavnDL

Get direct download links for songs from JioSaavn, powered by a lightweight vanilla Node.js server.

## 🚀 Overview

SaavnDL is a simple, no-framework solution to fetch JioSaavn song download URLs by providing a song query. It's built entirely with native Node.js HTTP and `fetch` APIs, demonstrating a minimalist approach to web service development.

## ✨ Features

  * **Direct Download Links:** Retrieves the highest quality available download URLs for a given song query.
  * **Simple API:** A straightforward HTTP GET endpoint that accepts a `query` parameter.
  * **Vanilla Node.js:** Built without any external web frameworks, showcasing direct Node.js server capabilities.
  * **Lightweight:** Minimal dependencies and overhead.

## 🛠️ How it Works

The server listens for HTTP GET requests on the root path (`/`). It expects a `query` URL parameter (e.g., `/?query=faded`).

1.  It takes your `query` (e.g., "faded").
2.  It sends a search request to JioSaavn's API to find songs matching your query.
3.  From the search results, it extracts the ID of the first relevant song.
4.  It then uses that song ID to fetch the detailed song information, including the download URLs, from a third-party Saavn API (e.g., `saavn.dev`).
5.  Finally, it returns the available download URLs as a JSON response.

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18.x or higher recommended for native `fetch` API)

### Installation

1.  **Clone the repository (or create the file):**

    ```bash
    git clone https://github.com/your-username/SaavnDL.git # Replace with your repo URL
    cd SaavnDL
    ```

    (If you're just creating the file, skip cloning and save the code directly as `saavnServer.mjs`)

2.  **Save the server code:**
    Create a file named `saavnServer.mjs` (or similar) and paste the server code into it.

    ```javascript
    // saavnServer.mjs
    import http from 'http';
    import { URL } from 'url';

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
        const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
        const queryParam = requestUrl.searchParams.get('query');

        if (req.method === 'GET' && requestUrl.pathname === '/') {
            const { status, headers, body } = await handleSaavnSearch(queryParam);

            res.writeHead(status, headers);
            res.end(body);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found. Use /?query=your_song_name' }));
        }
    });

    server.listen(PORT, () => {
        console.log(`SaavnDL server running on http://localhost:${PORT}`);
        console.log(`Try: http://localhost:${PORT}/?query=faded`);
        console.log(`Try: http://localhost:${PORT}/?query=dil%20diyan%20gallan`);
    });
    ```

### Running the Server

Open your terminal in the directory where `saavnServer.mjs` is located and run:

```bash
node saavnServer.mjs
```

You should see output similar to:

```
SaavnDL server running on http://localhost:3000
Try: http://localhost:3000/?query=faded
Try: http://localhost:3000/?query=dil%20diyan%20gallan
```

## 💡 Usage

Once the server is running, you can make HTTP GET requests to `http://localhost:3000/` with a `query` parameter:

**Example (using a web browser or `curl`):**

```bash
curl "http://localhost:3000/?query=faded"
```

**Expected JSON Response (example - actual URLs will vary):**

```json
[
  {
    "quality": "12kbps",
    "url": "https://abc.xyz/12kbps_faded.mp3"
  },
  {
    "quality": "48kbps",
    "url": "https://abc.xyz/48kbps_faded.mp3"
  },
  {
    "quality": "96kbps",
    "url": "https://abc.xyz/96kbps_faded.mp3"
  },
  {
    "quality": "160kbps",
    "url": "https://abc.xyz/160kbps_faded.mp3"
  },
  {
    "quality": "320kbps",
    "url": "https://abc.xyz/320kbps_faded.mp3"
  }
]
```

**Error Responses:**

  * **Missing Query:**
    ```json
    {"error": "Missing query parameter"}
    ```
    (Status: 400 Bad Request)
  * **No Results Found:**
    ```json
    {"error": "No results found on JioSaavn"}
    ```
    (Status: 404 Not Found)
  * **Download URL Not Found:**
    ```json
    {"error": "Download URL not found for this song"}
    ```
    (Status: 404 Not Found)
  * **Internal Server Error:**
    ```json
    {"error": "Failed to fetch download URLs"}
    ```
    (Status: 500 Internal Server Error)

## ⚠️ Disclaimer

This project uses public APIs for JioSaavn and a third-party API (`saavn.dev`). The availability and stability of these external APIs are beyond the control of this project. Use responsibly and respect the terms of service of any third-party services.
