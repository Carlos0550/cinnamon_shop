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
  const baseUrl = (() => {
    const rawApi = (process.env.NEXT_PUBLIC_API_URL || "").trim();
    if (rawApi) {
      const api = rawApi.replace(/^"+|"+$/g, "").replace(/\/+$/, "");
      return api.endsWith("/api") ? api : `${api}/api`;
    }
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
    try {
      const origin = site ? new URL(site).origin : "http://localhost:3001";
      return `${origin.replace(/\/+$/, "")}/api`;
    } catch {
      return "http://localhost:3000/api";
    }
  })();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").trim();
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
