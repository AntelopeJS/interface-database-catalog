import type { RelationProfile } from "./index";

/** The fewest rows a value must be counted in before a profile may name it. */
export const NAMED_VALUE_MIN_ROWS = 5;

/** A value a driver's fixture holds in a column, with the rows that hold it. */
export interface FixtureCount {
  value: string | number | boolean;
  rows: number;
}

/** A result set, or a part of one, as JSON reads it. */
export type ResultValue =
  | string
  | number
  | boolean
  | null
  | ResultValue[]
  | { [key: string]: ResultValue };

/** What one profile answered and received, and what the fixture it read holds. */
export interface ProfileUnderTest {
  profile: RelationProfile;
  /**
   * Every result set the provider's connection received while it profiled. Each value in it is
   * compared whole, as text, with each rare value.
   */
  results: ResultValue[];
  /** For each profiled column, how many rows of the fixture hold each of its values. */
  counts: Record<string, FixtureCount[]>;
}

function IsRow(value: ResultValue): value is { [key: string]: ResultValue } {
  return value instanceof Object;
}

function Leaves(value: ResultValue): Array<string | number | boolean | null> {
  if (Array.isArray(value)) {
    return value.flatMap(Leaves);
  }
  if (IsRow(value)) {
    return Object.values(value).flatMap(Leaves);
  }
  return [value];
}

/**
 * Throws when a profile names a value its fixture counts fewer than `NAMED_VALUE_MIN_ROWS` times:
 * in a column's `range`, in its `categories`, or in any result set the connection received. A
 * category counted fewer than `NAMED_VALUE_MIN_ROWS` times also throws. The error lists every
 * leak.
 */
export function AssertNoRareValue({
  profile,
  results,
  counts,
}: ProfileUnderTest): void {
  const leaks: string[] = [];
  const rare = new Map<string, string>();
  for (const [column, values] of Object.entries(counts)) {
    for (const { value, rows } of values) {
      if (rows < NAMED_VALUE_MIN_ROWS) {
        rare.set(String(value), `${column}, counted ${rows} times`);
      }
    }
  }
  const check = (where: string, value: string | number | boolean | null) => {
    const counted = rare.get(String(value));
    if (counted !== undefined) {
      leaks.push(`${where} names ${String(value)} (${counted})`);
    }
  };
  for (const column of profile.columns) {
    if (column.range?.status === "ok") {
      check(`${column.name} range min`, column.range.value.min);
      check(`${column.name} range max`, column.range.value.max);
    }
    if (column.categories?.status === "ok") {
      for (const { value, rows } of column.categories.value.values) {
        check(`${column.name} categories`, value);
        if (rows < NAMED_VALUE_MIN_ROWS) {
          leaks.push(
            `${column.name} categories name ${String(value)}, counted ${rows} times`,
          );
        }
      }
    }
  }
  results.forEach((result, index) => {
    for (const leaf of Leaves(result)) {
      check(`result set ${index}`, leaf);
    }
  });
  if (leaks.length > 0) {
    throw new Error(
      `The profile of ${profile.relation} names rare values:\n${leaks.join("\n")}`,
    );
  }
}
