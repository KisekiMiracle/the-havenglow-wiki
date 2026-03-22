// src/lib/db.ts
// Thin wrapper around Turso's HTTP API — no SDK, no Node.js deps, pure fetch.

const TURSO_URL = import.meta.env.TURSO_DATABASE_URL; // https://your-db.turso.io
const TURSO_TOKEN = import.meta.env.TURSO_AUTH_TOKEN;

interface TursoResult {
  rows: unknown[][];
  columns: string[];
}

export async function execute(
  sql: string,
  args: unknown[] = [],
): Promise<TursoResult> {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: { sql, args: args.map((value) => toTursoArg(value)) },
        },
        { type: "close" },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  const result = data.results?.[0]?.response?.result;

  return {
    columns: result?.cols?.map((c: any) => c.name) ?? [],
    rows: result?.rows ?? [],
  };
}

// Turso's HTTP API needs typed arg objects
function toTursoArg(value: unknown): object {
  if (value === null || value === undefined) return { type: "null" };
  if (typeof value === "number")
    return Number.isInteger(value)
      ? { type: "integer", value: String(value) }
      : { type: "float", value };
  return { type: "text", value: String(value) };
}

// Helper to turn row arrays into objects using column names
export function toObjects<T>(result: TursoResult): T[] {
  return result.rows.map((row) =>
    Object.fromEntries(
      result.columns.map((col, i) => [col, (row[i] as any)?.value ?? null]),
    ),
  ) as T[];
}
