#!/usr/bin/env node

'use strict';

/**
 * sync-api.js
 *
 * Descarga el openapi.yaml desde alpha_ia_spec vía GitHub Raw,
 * apuntando automáticamente a la rama activa del repo (feat/SPE-XXX).
 *
 * Convención: si la rama actual sigue el patrón feat/SPE-XXX,
 * se consume esa misma rama en alpha_ia_spec. De lo contrario, se usa main.
 *
 * Requiere: variable de entorno GITHUB_TOKEN (repo privado).
 *
 * Uso: npm run sync-api
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Configuración ────────────────────────────────────────────────────────────
const SPEC_OWNER     = 'yalayn';
const SPEC_REPO      = 'alpha_ia_spec';
const SPEC_FILE_PATH = 'docs/openapi.yaml';
const DEST_PATH      = path.resolve(__dirname, '..', 'docs', 'openapi.yaml');
const BRANCH_PATTERN = /^feat\/spe-/i;
// ─────────────────────────────────────────────────────────────────────────────

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('❌  Variable de entorno GITHUB_TOKEN no encontrada.');
    console.error('    Agrega tu Personal Access Token (read:contents) al .env:');
    console.error('    GITHUB_TOKEN=ghp_xxxxxxxxxxxx\n');
    process.exit(1);
  }
  return token;
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch {
    console.error('❌  Error al leer la rama actual de git.');
    process.exit(1);
  }
}

function resolveSpecBranch(currentBranch) {
  if (BRANCH_PATTERN.test(currentBranch)) {
    return currentBranch;
  }
  console.log(`ℹ️   Rama "${currentBranch}" no sigue la convención feat/SPE-XXX → usando main`);
  return 'main';
}

function downloadFile(url, dest, token) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const options = {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent':    'alpha-backend-sync-api',
      },
    };

    const file = fs.createWriteStream(dest);

    const request = https.get(url, options, (res) => {
      // Seguir redirecciones
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location, dest, token).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode === 401 || res.statusCode === 403) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Sin acceso (HTTP ${res.statusCode}). Verifica que el GITHUB_TOKEN tiene permisos de lectura sobre el repo.`));
        return;
      }

      if (res.statusCode === 404) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Archivo no encontrado (HTTP 404). Verifica que la rama y el archivo existen en ${SPEC_REPO}.`));
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${res.statusCode} inesperado.`));
        return;
      }

      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const token         = getToken();
  const currentBranch = getCurrentBranch();
  const specBranch    = resolveSpecBranch(currentBranch);
  const url           = `https://raw.githubusercontent.com/${SPEC_OWNER}/${SPEC_REPO}/${specBranch}/${SPEC_FILE_PATH}`;

  console.log(`\n🔄  Sincronizando openapi.yaml...`);
  console.log(`    Spec branch : ${specBranch}`);
  console.log(`    Fuente      : ${url}`);
  console.log(`    Destino     : docs/openapi.yaml\n`);

  try {
    await downloadFile(url, DEST_PATH, token);
    console.log(`✅  openapi.yaml sincronizado correctamente.\n`);
  } catch (err) {
    console.error(`❌  Error al sincronizar: ${err.message}\n`);
    console.error(`    Verifica:`);
    console.error(`      · Que GITHUB_TOKEN está definido en .env`);
    console.error(`      · Que la rama "${specBranch}" existe en ${SPEC_REPO}`);
    console.error(`      · Que docs/openapi.yaml existe en esa rama`);
    console.error(`      · Que tienes conexión a internet\n`);
    process.exit(1);
  }
}

main();
