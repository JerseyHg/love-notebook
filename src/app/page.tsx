import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/timeline");
}
