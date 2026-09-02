type HealthResponse = {
  status: (code: number) => HealthResponse;
  json: (body: { ok: boolean; service: string }) => void;
};

export default function handler(_req: unknown, res: HealthResponse) {
  res.status(200).json({ ok: true, service: "bestiario-cultural-api" });
}
