const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log(Object.keys(p).sort());
p.$disconnect();
