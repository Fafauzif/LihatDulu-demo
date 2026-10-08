import { chromium as playwrightChromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createBrotliDecompress } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { extract } from 'tar-fs';

export async function testBrowserPath(){
  if(process.env.CHROMIUM_PATH)return process.env.CHROMIUM_PATH;
  if(process.platform!=='linux')return playwrightChromium.executablePath();
  const bin=fileURLToPath(new URL('../bin/',import.meta.resolve('@sparticuz/chromium')));
  // Large unpacked executables can lose bytes in a persisted scratch snapshot.
  // Unpack the compact package into this process's temporary directory each run.
  const destination=fs.mkdtempSync(path.join(os.tmpdir(),'reform-browser-'));
  // Each invocation owns its extracted files. Browser callers close before exit.
  process.once('exit',()=>{try{fs.rmSync(destination,{recursive:true,force:true});}catch{}});
  const executable=path.join(destination,'chromium');
  if(!fs.existsSync(executable))await pipeline(fs.createReadStream(path.join(bin,'chromium.br')),createBrotliDecompress(),fs.createWriteStream(executable,{mode:0o755}));
  if(!fs.existsSync(path.join(destination,'libGLESv2.so')))await pipeline(fs.createReadStream(path.join(bin,'swiftshader.tar.br')),createBrotliDecompress(),extract(destination,{chown:false}));
  if(!fs.existsSync(path.join(destination,'fonts')))await pipeline(fs.createReadStream(path.join(bin,'fonts.tar.br')),createBrotliDecompress(),extract(destination,{chown:false}));
  return executable;
}
