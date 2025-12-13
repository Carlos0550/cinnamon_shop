import { prisma } from '@/config/prisma'
import { IntegrationType } from '@prisma/client'

export async function getIntegrationSecret(tenantId: string, type: IntegrationType) {
  const integ = await prisma.integration.findFirst({
    where: { tenantId, type }
  })
  return integ?.secret || null
}

export async function hasIntegration(tenantId: string, type: IntegrationType) {
  const count = await prisma.integration.count({ where: { tenantId, type } })
  return count > 0
}
