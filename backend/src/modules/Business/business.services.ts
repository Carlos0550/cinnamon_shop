import { prisma } from "@/config/prisma";
import { BusinessDataRequest } from "./schemas/business.schemas";
import { Prisma } from "@prisma/client";

class BusinessServices {
    async createBusiness(tenantId: string, payload: BusinessDataRequest) {
        const business_data: Prisma.BusinessDataCreateInput = {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            bankData: Array.isArray(payload.bankData) && payload.bankData.length > 0
                ? {
                    create: payload.bankData.map(b => ({
                        bank_name: b.bank_name,
                        account_number: b.account_number,
                        account_holder: b.account_holder,
                    }))
                }
                : undefined,
            tenant: { connect: { id: tenantId } },
        };

        const business = await prisma.businessData.create({
            data: business_data,
            include: { bankData: true }
        });
        return business;
    }

    async updateBusiness(tenantId: string, id: string, payload: BusinessDataRequest) {
        const existing = await prisma.businessData.findUnique({
            where: { id, tenantId },
            include: { bankData: true }
        });
        if (!existing) {
            throw new Error("BUSINESS_NOT_FOUND");
        }

        const updated = await prisma.businessData.update({
            where: { id, tenantId },
            data: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                address: payload.address,
                city: payload.city,
                state: payload.state,
                bankData: Array.isArray(payload.bankData) && payload.bankData.length > 0
                    ? {
                        deleteMany: {},
                        create: payload.bankData.map(b => ({
                            bank_name: b.bank_name,
                            account_number: b.account_number,
                            account_holder: b.account_holder,
                        }))
                    }
                    : { deleteMany: {} },
            },
            include: { bankData: true }
        });

        return updated;
    }

    async getBusiness(tenantId: string) {
        const business = await prisma.businessData.findFirst({
            where: { tenantId },
            include: { bankData: true },
            orderBy: { id: 'asc' }
        });
        return business;
    }
}

export default new BusinessServices();
