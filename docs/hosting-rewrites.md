# Vercel / Netlify SPA rewrite configs

- Netlify: See public/_redirects (all routes -> /index.html 200)
- Vercel: See vercel.json rewrites

If you are self-hosting with Nginx, add:

server {
  listen 80;
  server_name yourdomain.com;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
