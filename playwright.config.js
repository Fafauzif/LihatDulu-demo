import { defineConfig } from '@playwright/test';
import { testBrowserPath } from './scripts/test-browser.js';
export default defineConfig({testDir:'./tests',testMatch:'**/inspection-persistence.spec.js',timeout:60000,workers:1,use:{baseURL:'http://127.0.0.1:5183',headless:true,launchOptions:{executablePath:await testBrowserPath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']}},webServer:{command:'npm run dev -- --port 5183',url:'http://127.0.0.1:5183',reuseExistingServer:true},reporter:'list'});
