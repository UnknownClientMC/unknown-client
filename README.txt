UNKNOWN CLIENT — AI Mod Finder backend

IMPORTANT:
- GitHub Pages is static hosting. It cannot run /api/find-mod by itself.
- This backend must be deployed to a server host (for example, Render or another Node.js host).
- Add OPENAI_API_KEY as a secret/environment variable in that host's dashboard. NEVER put the API key in index.html or any public GitHub file.
- Image understanding and Hinglish intent interpretation require an OpenAI API account with API access/billing configured; usage may cost money.
- Current index.html uses a relative /api/find-mod endpoint. After deploying the backend, update the frontend fetch URL to your backend URL, and configure CORS if frontend and backend are on different domains.

Local test:
1. Install Node.js LTS.
2. In this folder run: npm install
3. Set OPENAI_API_KEY in your terminal environment.
4. Run: npm start
5. Open http://localhost:3000 (put the website index.html in a public folder for local serving, or deploy the existing GitHub Pages frontend separately).

For production, deploy server.js/package.json to a Node-compatible host. Keep the secret key only in the host's environment variables.
