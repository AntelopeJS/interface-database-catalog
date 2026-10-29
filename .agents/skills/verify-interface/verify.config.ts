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
