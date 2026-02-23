import { redirect } from "next/navigation";

export default function Home() {
  // Since this is an Admin Panel, we redirect root traffic directly to login.
  // Later, we can add logic here to check:
  // If user is logged in -> Redirect to /dashboard
  // If user is NOT logged in -> Redirect to /auth/login
  
  redirect("/auth/login");
}