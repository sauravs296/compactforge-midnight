import prisma from "../src/lib/prisma";

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      users: {
        create: {
          email: "dev@acmecorp.com",
          name: "Developer",
        },
      },
    },
    include: {
      users: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Midnight Token",
      organizationId: org.id,
    },
  });

  const contract = await prisma.contract.create({
    data: {
      name: "token_ledger",
      projectId: project.id,
    },
  });

  const circuit = await prisma.circuit.create({
    data: {
      name: "transfer",
      contractId: contract.id,
    },
  });

  await prisma.benchmark.create({
    data: {
      circuitId: circuit.id,
      commitSha: "a1b2c3d",
      provingTimeMs: 1200,
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
