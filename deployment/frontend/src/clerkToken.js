export const getToken = async () => {
  try {
    const w = typeof window !== "undefined" ? window : undefined;
    const clerk = w && w.Clerk;
    if (clerk && clerk.session && typeof clerk.session.getToken === "function") {
      const token = await clerk.session.getToken({ template: "default" });
      return token || "";
    }
    return "";
  } catch (e) {
    return "";
  }
};


