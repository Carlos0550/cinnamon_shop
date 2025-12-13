export type BusinessData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export const getBusinessInfo = async (): Promise<BusinessData | null> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL
    || (process.env.NEXT_PUBLIC_SITE_URL ? `${new URL(process.env.NEXT_PUBLIC_SITE_URL).origin}/api` : "http://localhost:3000/api");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  let siteHost = "localhost:3001";
  try {
    const u = new URL(siteUrl);
    siteHost = u.host;
  } catch {}
  try {
    const res = await fetch(`${baseUrl}/business/public`, {
      next: { revalidate: 3600 },
      headers: { 'x-forwarded-host': siteHost }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching business info:", error);
    return null;
  }
};
