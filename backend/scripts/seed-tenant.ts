import 'dotenv/config'
import { prisma } from "@/config/prisma";

async function main() {
  const slug = "cinnamon-makeup";
  const domainName = "cinnamon-makeup.com";

  console.log("Creando/obteniendo tenant...");
  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: { slug, status: "ACTIVE", plan: "BASIC" },
  });
  console.log("Tenant:", tenant);

  console.log("Creando/actualizando dominio...");
  const domain = await prisma.domain.upsert({
    where: { domain: domainName },
    update: { tenantId: tenant.id },
    create: { domain: domainName, tenantId: tenant.id },
  });
  console.log("Domain:", domain);

  const tenantId = tenant.id;

  console.log("Actualizando registros para asignar tenantId:", tenantId);
  const results: Record<string, any> = {};

  // Modelos con tenantId asignable directamente
  const updates = [
    prisma.user.updateMany({ data: { tenantId } }),
    prisma.admin.updateMany({ data: { tenantId } }),
    prisma.categories.updateMany({ data: { tenantId } }),
    prisma.products.updateMany({ data: { tenantId } }),
    prisma.promos.updateMany({ data: { tenantId } }),
    prisma.sales.updateMany({ data: { tenantId } }),
    prisma.cart.updateMany({ data: { tenantId } }),
    prisma.orderItems.updateMany({ data: { tenantId } }),
    prisma.orders.updateMany({ data: { tenantId } }),
    prisma.fAQ.updateMany({ data: { tenantId } }),
    prisma.colorPalette.updateMany({ data: { tenantId } }),
    prisma.businessBankData.updateMany({ data: { tenantId } }),
    prisma.integration.updateMany({ data: { tenantId } }),
  ];

  for (const [idx, promise] of updates.entries()) {
    try {
      const res = await promise;
      results[`update_${idx}`] = res;
    } catch (err) {
      results[`update_${idx}_error`] = String(err);
      console.warn("Error en actualización:", err);
    }
  }

  try {
    // BusinessData tiene tenantId único: si hay múltiples, evitamos violar la unicidad
    const totalBusiness = await prisma.businessData.count();
    if (totalBusiness <= 1) {
      const res = await prisma.businessData.updateMany({ data: { tenantId } });
      results["businessData_update"] = res;
    } else {
      const res = await prisma.businessData.updateMany({
        where: { tenantId: null },
        data: { tenantId },
      });
      results["businessData_update_partial"] = res;
      console.warn(
        "Se detectaron múltiples registros en BusinessData; solo se actualizaron los que no tenían tenantId para evitar violar unicidad."
      );
    }
  } catch (err) {
    results["businessData_update_error"] = String(err);
    console.warn("Error actualizando BusinessData:", err);
  }

  console.log("Resultados:", results);
  console.log("Listo.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

