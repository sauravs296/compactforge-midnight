import { config } from 'dotenv'
config()

async function main() {
  const { default: prisma } = await import('../src/lib/prisma')
  console.log('Seeding database with demo data...')

  await prisma.deployment.deleteMany()
  await prisma.benchmark.deleteMany()
  await prisma.cIRun.deleteMany()
  await prisma.circuit.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.project.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // 1. Create a dummy organization and user
  const org = await prisma.organization.create({
    data: {
      name: 'Midnight Demo Org',
      projects: {
        create: {
          name: 'Midnight Hackathon Demo',
          repository: 'sauravs296/compactforge-midnight',
          contracts: {
            create: {
              name: 'token_ledger',
              circuits: {
                create: [
                  { name: 'mint' },
                  { name: 'transfer' },
                  { name: 'deposit' },
                  { name: 'burn' },
                  { name: 'pause' },
                  { name: 'unpause' },
                ]
              }
            }
          }
        }
      }
    }
  })

  const project = await prisma.project.findFirst({ where: { organizationId: org.id } })
  const contract = await prisma.contract.findFirst({ where: { projectId: project?.id } })
  const circuits = await prisma.circuit.findMany({ where: { contractId: contract?.id } })

  const user = await prisma.user.create({
    data: {
      email: 'demo@compactforge.app',
      name: 'Demo User',
      organizationId: org.id,
      wallets: {
        create: {
          address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        }
      }
    }
  })

  // 2. Create sample deployments
  await prisma.deployment.create({
    data: {
      network: 'preprod',
      txHash: '505092cdae10713eeb5a4f47af05da3414b92afa7a81a8c1b7153d47e68e090f',
      status: 'confirmed',
      contractId: contract!.id,
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    }
  })

  await prisma.deployment.create({
    data: {
      network: 'preprod',
      txHash: 'a7eccdd4b6027d1a222ef43a40de1dce6cbf56ecadaa0d93093b7b9ffdc02406',
      status: 'confirmed',
      contractId: contract!.id,
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  })

  // 3. Create CI Runs
  const shas = ['a3f9c2d', '9b1e4fa', 'c82d7e0', 'e5a1b3c', 'f8aa2d4']
  let timeOffset = 1000 * 60 * 60 * 24 * 5 // 5 days ago

  for (let i = 0; i < shas.length; i++) {
    await prisma.cIRun.create({
      data: {
        commitSha: shas[i],
        status: i === 2 ? 'failed' : 'success', // Make one fail for realism
        duration: Math.floor(Math.random() * 20) + 40, // 40-60s
        logsUrl: `https://github.com/sauravs296/compactforge-midnight/actions/runs/${1000000 + i}`,
        createdAt: new Date(Date.now() - timeOffset)
      }
    })
    timeOffset -= 1000 * 60 * 60 * 24 // +1 day
  }

  // 4. Create Benchmarks showing performance improvement over time
  timeOffset = 1000 * 60 * 60 * 24 * 5
  for (let i = 0; i < shas.length; i++) {
    // We only create benchmarks for successful runs (skip index 2)
    if (i !== 2) {
      for (const circuit of circuits) {
        // Base time depends on circuit
        let baseTime = 1000
        if (circuit.name === 'transfer') baseTime = 1800
        if (circuit.name === 'pause') baseTime = 600

        // Simulate optimization over time (later commits are faster)
        const optimizationFactor = 1 - (i * 0.05) // 5% faster each commit
        const randomNoise = (Math.random() * 0.1) + 0.95 // +/- 5% noise
        
        await prisma.benchmark.create({
          data: {
            circuitId: circuit.id,
            commitSha: shas[i],
            provingTimeMs: Math.floor(baseTime * optimizationFactor * randomNoise),
            createdAt: new Date(Date.now() - timeOffset)
          }
        })
      }
    }
    timeOffset -= 1000 * 60 * 60 * 24
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
