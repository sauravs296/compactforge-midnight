require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const url = process.env.DATABASE_URL || '';
const connectionString = url.includes('?') ? `${url}&uselibpqcompat=true` : `${url}?uselibpqcompat=true`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function seed() {
  let org = await db.organization.findFirst();
  if (!org) org = await db.organization.create({ data: { name: 'CompactForge Demo' } });
  let project = await db.project.findFirst({ where: { organizationId: org.id } });
  if (!project) project = await db.project.create({ data: { name: 'token_ledger', repository: 'https://github.com/sauravs296/CompactForge', organizationId: org.id } });
  let contract = await db.contract.findFirst({ where: { name: 'token_ledger' } });
  if (!contract) contract = await db.contract.create({ data: { name: 'token_ledger', projectId: project.id } });
  const CIRCUITS = ['mint', 'transfer', 'deposit', 'burn', 'pause', 'unpause'];
  for (const name of CIRCUITS) {
    const exists = await db.circuit.findFirst({ where: { name, contractId: contract.id } });
    if (!exists) await db.circuit.create({ data: { name, contractId: contract.id } });
  }
  const commits = [['a3f9c2d','success',58],['9b1e4fa','success',62],['c82d7e0','success',55],['e7f1b3a','failed',41],['4d2a8c1','success',67]];
  for (const [commitSha, status, duration] of commits) {
    const existing = await db.cIRun.findFirst({ where: { commitSha } });
    if (!existing) await db.cIRun.create({ data: { commitSha, status, duration, logsUrl: 'https://github.com/sauravs296/compactforge-midnight/actions' } });
  }
  const circuits = await db.circuit.findMany({ where: { contractId: contract.id } });
  const times = { mint:[1280,1265,1290], transfer:[1140,1155,1130], deposit:[920,935,910], burn:[1050,1040,1060], pause:[880,875,890], unpause:[875,868,882] };
  const bCommits = ['a3f9c2d','9b1e4fa','4d2a8c1'];
  for (const c of circuits) {
    const t = times[c.name] || [1000,1000,1000];
    for (let i = 0; i < bCommits.length; i++) {
      const exists = await db.benchmark.findFirst({ where: { circuitId: c.id, commitSha: bCommits[i] } });
      if (!exists) await db.benchmark.create({ data: { circuitId: c.id, commitSha: bCommits[i], provingTimeMs: t[i] } });
    }
  }
  console.log('Done seeding CI runs and benchmarks');
  await db.$disconnect();
  await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });