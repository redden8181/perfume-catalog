/**
 * Health-check для платформы/мониторинга.
 * force-static — роут корректно собирается и в режиме статического экспорта
 * (GitHub Pages), и в серверном режиме (next start).
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({ ok: true, service: "aromateka" });
}
