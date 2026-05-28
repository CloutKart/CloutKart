// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { writeFileSync } from "fs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var SITE_URL = "https://clout-kart.com";
var sections = ["about", "services", "process", "pricing", "portfolio", "contact"];
function sitemapPlugin() {
  return {
    name: "generate-sitemap",
    closeBundle() {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const urls = [
        { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
        ...sections.map((s) => ({
          loc: `${SITE_URL}/#${s}`,
          priority: s === "services" || s === "pricing" ? "0.9" : "0.8",
          changefreq: s === "pricing" || s === "portfolio" ? "weekly" : "monthly"
        }))
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
      writeFileSync(resolve(__vite_injected_original_dirname, "dist/sitemap.xml"), xml, "utf-8");
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), sitemapPlugin()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcblxuY29uc3QgU0lURV9VUkwgPSAnaHR0cHM6Ly9jbG91dC1rYXJ0LmNvbSc7XG5cbmNvbnN0IHNlY3Rpb25zID0gWydhYm91dCcsICdzZXJ2aWNlcycsICdwcm9jZXNzJywgJ3ByaWNpbmcnLCAncG9ydGZvbGlvJywgJ2NvbnRhY3QnXTtcblxuZnVuY3Rpb24gc2l0ZW1hcFBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdnZW5lcmF0ZS1zaXRlbWFwJyxcbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG5cbiAgICAgIGNvbnN0IHVybHMgPSBbXG4gICAgICAgIHsgbG9jOiBgJHtTSVRFX1VSTH0vYCwgcHJpb3JpdHk6ICcxLjAnLCBjaGFuZ2VmcmVxOiAnd2Vla2x5JyB9LFxuICAgICAgICAuLi5zZWN0aW9ucy5tYXAocyA9PiAoe1xuICAgICAgICAgIGxvYzogYCR7U0lURV9VUkx9LyMke3N9YCxcbiAgICAgICAgICBwcmlvcml0eTogcyA9PT0gJ3NlcnZpY2VzJyB8fCBzID09PSAncHJpY2luZycgPyAnMC45JyA6ICcwLjgnLFxuICAgICAgICAgIGNoYW5nZWZyZXE6IHMgPT09ICdwcmljaW5nJyB8fCBzID09PSAncG9ydGZvbGlvJyA/ICd3ZWVrbHknIDogJ21vbnRobHknLFxuICAgICAgICB9KSksXG4gICAgICBdO1xuXG4gICAgICBjb25zdCB4bWwgPSBgPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+XG48dXJsc2V0IHhtbG5zPVwiaHR0cDovL3d3dy5zaXRlbWFwcy5vcmcvc2NoZW1hcy9zaXRlbWFwLzAuOVwiXG4gICAgICAgIHhtbG5zOnhzaT1cImh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlXCJcbiAgICAgICAgeHNpOnNjaGVtYUxvY2F0aW9uPVwiaHR0cDovL3d3dy5zaXRlbWFwcy5vcmcvc2NoZW1hcy9zaXRlbWFwLzAuOVxuICAgICAgICAgIGh0dHA6Ly93d3cuc2l0ZW1hcHMub3JnL3NjaGVtYXMvc2l0ZW1hcC8wLjkvc2l0ZW1hcC54c2RcIj5cbiR7dXJscy5tYXAodSA9PiBgICA8dXJsPlxuICAgIDxsb2M+JHt1LmxvY308L2xvYz5cbiAgICA8bGFzdG1vZD4ke3RvZGF5fTwvbGFzdG1vZD5cbiAgICA8Y2hhbmdlZnJlcT4ke3UuY2hhbmdlZnJlcX08L2NoYW5nZWZyZXE+XG4gICAgPHByaW9yaXR5PiR7dS5wcmlvcml0eX08L3ByaW9yaXR5PlxuICA8L3VybD5gKS5qb2luKCdcXG4nKX1cbjwvdXJsc2V0PmA7XG5cbiAgICAgIHdyaXRlRmlsZVN5bmMocmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0L3NpdGVtYXAueG1sJyksIHhtbCwgJ3V0Zi04Jyk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHNpdGVtYXBQbHVnaW4oKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBaUM7QUFDblEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsZUFBZTtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFdBQVc7QUFFakIsSUFBTSxXQUFXLENBQUMsU0FBUyxZQUFZLFdBQVcsV0FBVyxhQUFhLFNBQVM7QUFFbkYsU0FBUyxnQkFBd0I7QUFDL0IsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sY0FBYztBQUNaLFlBQU0sU0FBUSxvQkFBSSxLQUFLLEdBQUUsWUFBWSxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFFbkQsWUFBTSxPQUFPO0FBQUEsUUFDWCxFQUFFLEtBQUssR0FBRyxRQUFRLEtBQUssVUFBVSxPQUFPLFlBQVksU0FBUztBQUFBLFFBQzdELEdBQUcsU0FBUyxJQUFJLFFBQU07QUFBQSxVQUNwQixLQUFLLEdBQUcsUUFBUSxLQUFLLENBQUM7QUFBQSxVQUN0QixVQUFVLE1BQU0sY0FBYyxNQUFNLFlBQVksUUFBUTtBQUFBLFVBQ3hELFlBQVksTUFBTSxhQUFhLE1BQU0sY0FBYyxXQUFXO0FBQUEsUUFDaEUsRUFBRTtBQUFBLE1BQ0o7QUFFQSxZQUFNLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS2hCLEtBQUssSUFBSSxPQUFLO0FBQUEsV0FDTCxFQUFFLEdBQUc7QUFBQSxlQUNELEtBQUs7QUFBQSxrQkFDRixFQUFFLFVBQVU7QUFBQSxnQkFDZCxFQUFFLFFBQVE7QUFBQSxTQUNqQixFQUFFLEtBQUssSUFBSSxDQUFDO0FBQUE7QUFHZixvQkFBYyxRQUFRLGtDQUFXLGtCQUFrQixHQUFHLEtBQUssT0FBTztBQUFBLElBQ3BFO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFBQSxFQUNsQyxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
