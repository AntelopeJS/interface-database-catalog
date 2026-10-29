import { equal, interrupted } from "@antelopejs/tooling-configs/verify";
import type { CallRequest, Journey, VerifyConfig } from "@antelopejs/tooling-configs/verify";

/** A consumer call of one catalog function and the arguments it sends. */
interface Call {
  name: string;
  args: NonNullable<CallRequest["args"]>;
}

/** Loads the packed catalog next to a stub provider and calls each function through core: the stub must answer, with the arguments it received. */
function throughCore(title: string, calls: Call[]): Journey {
  return {
    title,
    entryPoint: "a consumer module calling the packed catalog in `ajs project dev`",
    async run(context) {
      const app = await context.dev("ajs project dev", context.fixture());
      for (const { name, args } of calls) {
        const result = await context.call(`call ${name}`, app, { path: [name], args });
        context.expect(result.folder, [
          { name: `${name} resolved through core`, pass: result.ok, detail: JSON.stringify(result.value) },
          equal(`${name} reached the provider with its arguments`, result.value, { stub: `.:${name}`, args }),
        ]);
      }
      const stopped = await context.stop("SIGINT", app);
      context.expect(stopped.folder, [interrupted(stopped)]);
    },
  };
}

/** The checks every probe shares: `Assert<Same<A, B>>` fails to compile when A and B are not assignable both ways. */
const PROBE_HEADER = `
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
type Answer<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>>;
`;

/** Compiles a probe against the packed declarations, in the consumer's strict mode: the structure each function answers is read back, not assumed. */
function answerTypes(title: string, probe: string): Journey {
  return {
    title,
    entryPoint: "a TypeScript consumer compiling against the packed declarations",
    async run(context) {
      const file = `${context.work}/probe.ts`;
      context.edit("write the shape probe", file, `import type * as Api from "${context.repo}/dist/index";\n${PROBE_HEADER}\n${probe}`);
      const compiled = await context.command("compile the shape probe", "node", [
        `${context.repo}/node_modules/typescript/bin/tsc`,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--target",
        "es2022",
        "--module",
        "commonjs",
        "--moduleResolution",
        "node",
        "--typeRoots",
        `${context.repo}/node_modules/@types`,
        "--types",
        "node",
        file,
      ]);
      context.expect(compiled.folder, [
        { name: "every answer has the documented structure", pass: compiled.exitCode === 0, detail: compiled.stdout.slice(0, 400) },
      ]);
    },
  };
}

const MEASURE = `type Measure<T> = { status: "ok"; value: T } | { status: "timeout" } | { status: "error"; code: string };`;
const SUMMARY = `{ schema: string; name: string; kind: "table" | "partitioned" | "view" | "materialized" | "foreign"; estimatedRows: number | null; estimate: "statistics" | "live-tuples" | "plan" | null; key: { columns: string[]; source: "primary" | "unique" } | null; unmappable?: string; writes: { insert: boolean; update: boolean; delete: boolean }; comment: string | null }`;
const REFERENCE = `{ name: string; from: { relation: string; columns: string[] }; to: { relation: string; columns: string[] } }`;
const SAMPLE_INFO = `{ percent: number; rows: number } | null`;

const INSPECT_ANSWERS = `
type Summary = ${SUMMARY};
type Reference = ${REFERENCE};
type Column = { name: string; native: string; nullable: boolean; hasDefault: boolean; generated: boolean; identity: "always" | "by default" | null; enumLabels?: string[]; accepts: { declared: string; lossy?: string }[]; unsupported?: string; readOnly?: string; comment: string | null };
type Description = Summary & { columns: Column[]; indexes: { name: string; columns: string[]; unique: boolean }[]; references: Reference[]; referencedBy: Reference[] };
type _Info = Assert<Same<Answer<typeof Api.Info>, { engine: string; version: string; database: string; role: string }>>;
type _List = Assert<Same<Answer<typeof Api.ListRelations>, Summary[]>>;
type _Describe = Assert<Same<Answer<typeof Api.DescribeRelations>, Description[]>>;
`;

const PROFILE_ANSWERS = `
${MEASURE}
type Reference = ${REFERENCE};
type Column = { name: string; nulls?: Measure<number>; distinct?: Measure<number>; range?: Measure<{ min: number | string; max: number | string }>; months?: Measure<{ month: string; rows: number }[]>; categories?: Measure<{ values: { value: string | number | boolean; rows: number }[]; other: number }>; length?: Measure<{ min: number; avg: number; max: number }>; traits: ("enum-like" | "identifier-like" | "label-candidate" | "time-axis" | "measure")[] };
type _Profile = Assert<Same<Answer<typeof Api.Profile>, { relation: string; rows: Measure<{ rows: number; exact: boolean }>; sample: ${SAMPLE_INFO}; columns: Column[]; references: { reference: Reference; fanOut: Measure<{ average: number; max: number; parentsWithoutChildren: number }> }[]; inbound: { reference: Reference; estimatedRows: number | null }[] }>>;
type _Check = Assert<Same<Answer<typeof Api.CheckReference>, Measure<{ containment: number; checkedRows: number; sampled: boolean; targetIsKey: boolean }>>>;
`;

const SAMPLE_ANSWERS = `
type _Rows = Assert<Same<Answer<typeof Api.SampleRows>, { relation: string; columns: string[]; rows: ({ text: string; truncated: boolean } | { bytes: number } | null)[][]; sample: ${SAMPLE_INFO} }>>;
`;

const config: VerifyConfig = {
  doors: {
    data: null,
    format: null,
    contract: {
      globs: ["src/index.ts", "package.json"],
      funnels: [],
      containments: [],
      why: "the six functions and the types they answer are what the DMS builder and every other consumer import",
    },
    outbound: null,
    exposure: {
      globs: ["src/index.ts"],
      funnels: [],
      containments: [],
      why: "SampleRows answers row values and SAMPLE_ROWS_LIMIT and SAMPLE_TEXT_LENGTH bound how much of them a consumer sees",
    },
    publish: {
      globs: ["package.json", ".release-it.json", "changelogen.config.json", ".github/workflows/release.yml"],
      funnels: [],
      containments: [],
      why: "the package name and release workflow claim @antelopejs/interface-database-catalog on npm",
    },
  },
  journeys: {
    "inspect-calls": throughCore("Info, ListRelations and DescribeRelations reach the provider", [
      { name: "Info", args: [] },
      { name: "ListRelations", args: [["public"]] },
      { name: "DescribeRelations", args: [["public.orders"]] },
    ]),
    "profile-calls": throughCore("Profile and CheckReference reach the provider", [
      { name: "Profile", args: [{ relation: "public.orders", columns: ["status"] }] },
      {
        name: "CheckReference",
        args: [{ from: { relation: "public.orders", column: "customer_id" }, to: { relation: "public.customers", column: "id" } }],
      },
    ]),
    "sample-calls": throughCore("SampleRows reaches the provider", [
      { name: "SampleRows", args: [{ relation: "public.orders", limit: 5 }] },
    ]),
    "inspect-shapes": answerTypes("Info, ListRelations and DescribeRelations answer the documented structure", INSPECT_ANSWERS),
    "profile-shapes": answerTypes("Profile and CheckReference answer the documented structure", PROFILE_ANSWERS),
    "sample-shapes": answerTypes("SampleRows answers rows of sampled values, one array per row", SAMPLE_ANSWERS),
    "sample-limits": {
      title: "the packed interface exports the documented sample limits",
      entryPoint: "the packed interface required from a consumer",
      async run(context) {
        const loaded = await context.command("read the exported limits", "node", [
          "-e",
          'const c = require(process.argv[1]); console.log(JSON.stringify({ rows: c.SAMPLE_ROWS_LIMIT, text: c.SAMPLE_TEXT_LENGTH }));',
          `${context.repo}/dist/index.js`,
        ]);
        context.expect(loaded.folder, [
          equal("SAMPLE_ROWS_LIMIT is 20 and SAMPLE_TEXT_LENGTH is 200, as docs/index.md states", loaded.stdout.trim(), '{"rows":20,"text":200}'),
        ]);
      },
    },
  },
};

export default config;
