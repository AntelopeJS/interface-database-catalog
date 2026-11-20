import { expect } from "chai";

import type { ColumnProfile, RelationProfile } from "../index";
import { AssertNoRareValue, type ProfileUnderTest } from "../testing";

const COUNTS = {
  level: [
    { value: 7001, rows: 4 },
    { value: 7002, rows: 5 },
    { value: 7008, rows: 5 },
  ],
} satisfies ProfileUnderTest["counts"];

function Profiled(column: Partial<ColumnProfile>): RelationProfile {
  return {
    relation: "sales.grades",
    rows: { status: "ok", value: { rows: 14, exact: true } },
    sample: null,
    columns: [{ name: "level", traits: [], ...column }],
    references: [],
    inbound: [],
  };
}

function Checked(
  column: Partial<ColumnProfile>,
  results: ProfileUnderTest["results"] = [],
): () => void {
  return () =>
    AssertNoRareValue({ profile: Profiled(column), results, counts: COUNTS });
}

describe("AssertNoRareValue", () => {
  it("fails a range that ends at a value counted 4 times", () => {
    expect(
      Checked({ range: { status: "ok", value: { min: 7001, max: 7008 } } }),
    ).to.throw("level range min names 7001 (level, counted 4 times)");
  });

  it("passes a range that ends at values counted 5 times", () => {
    expect(
      Checked({ range: { status: "ok", value: { min: 7002, max: 7008 } } }, [
        [{ min: 7002, max: 7008 }],
      ]),
    ).to.not.throw();
  });

  it("fails a result set that holds a value counted 4 times, read as text", () => {
    expect(
      Checked({}, [[{ value: "7002", rows: 5 }], [{ value: "7001", rows: 4 }]]),
    ).to.throw("result set 1 names 7001");
  });

  it("passes a result set whose values only contain a rare value's digits", () => {
    expect(
      Checked({}, [[{ value: 17001 }, { value: "70010" }]]),
    ).to.not.throw();
  });

  it("fails a category counted 4 times, even one the fixture does not count", () => {
    expect(
      Checked({
        categories: {
          status: "ok",
          value: { values: [{ value: "gold", rows: 4 }], other: 0 },
        },
      }),
    ).to.throw("level categories name gold, counted 4 times");
  });

  it("passes a category counted 5 times", () => {
    expect(
      Checked({
        categories: {
          status: "ok",
          value: { values: [{ value: 7002, rows: 5 }], other: 4 },
        },
      }),
    ).to.not.throw();
  });
});
