export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard", "/submit", "/stories/new", "/projects/new"],
};
