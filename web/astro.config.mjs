// @ts-check
import { defineConfig } from 'astro/config';

// Static (SSG) by default — content is fetched at build time from Strapi
// (or from local fixtures when STRAPI_API_URL is unset; see src/lib/strapi.ts).
// Output deploys as static assets on Netlify (feature 004).
export default defineConfig({
  site: 'https://brisjs.org',
  output: 'static',
});
