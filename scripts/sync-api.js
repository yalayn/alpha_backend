#!/usr/bin/env node

'use strict';

/**
 * sync-api.js
 *
 * Copia el openapi.yaml desde alpha_spec/ (ruta local) a docs/openapi.yaml.
 *
 * Prerequisito: los tres repos deben ser hermanos bajo el mismo directorio padre:
 *   /[raíz]/
 *   ├── alpha_spec/
 *   ├── alpha_backend/   ← este repo
 *   └── alpha_frontend/
 *
 * El archivo copiado se agrega al .gitignore — es un artefacto local,
 * no se versiona en este repo.
 *
 * Uso: npm run sync-api
 */

const fs   = require('fs');
const path = require('path');

// ─── Configuración ────────────────────────────────────────────────────────────
const SOURCE_PATH = path.resolve(__dirname, '..', '..', 'alpha_spec', 'docs', 'openapi.yaml');
const DEST_PATH   = path.resolve(__dirname, '..', 'docs', 'openapi.yaml');
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n🔄  Sincronizando openapi.yaml...');
  console.log(`    Fuente  : ${SOURCE_PATH}`);
  console.log(`    Destino : ${DEST_PATH}\n`);

  if (!fs.existsSync(SOURCE_PATH)) {
    console.error('❌  No se encontró el openapi.yaml en alpha_spec/docs/.');
    console.error('    Verifica que alpha_spec/ es hermano de alpha_backend/ en el mismo directorio.\n');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(DEST_PATH), { recursive: true });

  try {
    fs.copyFileSync(SOURCE_PATH, DEST_PATH);
    console.log('✅  openapi.yaml sincronizado correctamente.\n');
  } catch (err) {
    console.error(`❌  Error al copiar el archivo: ${err.message}\n`);
    process.exit(1);
  }
}

main();
