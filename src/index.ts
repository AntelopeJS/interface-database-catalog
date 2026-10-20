import { InterfaceFunction } from "@antelopejs/interface-core";

/**
 * What the connected database is, as the provider's own connection sees it.
 */
export interface CatalogInfo {
  /** The engine's name, e.g. `postgresql`. */
  engine: string;
  /** The server's version, e.g. `17.5`. */
  version: string;
  /** The database the connection is on. */
  database: string;
  /** The role the connection runs as. */
  role: string;
}

/** The kinds of relation a catalog lists. */
export type RelationKind =
  | "table"
  | "partitioned"
  | "view"
  | "materialized"
  | "foreign";

/**
 * Where a row estimate came from: the database's statistics, its live-tuple counter for a table
 * never analyzed, or the planner's estimate for a relation that has neither.
 */
export type EstimateSource = "statistics" | "live-tuples" | "plan";

/** Whether a relation's key is its primary key or a unique index that identifies rows as one does. */
export type KeySource = "primary" | "unique";

/**
 * The columns registration aliases `_id` to.
 */
export interface RelationKey {
  columns: string[];
  source: KeySource;
}

/** What the provider's connection may write to a relation. */
export interface RelationWrites {
  insert: boolean;
  update: boolean;
  delete: boolean;
}

/**
 * One relation of the connected database.
 *
 * `key` and `unmappable` are the provider's own registration rules: a relation the summary calls
 * mappable registers, and a relation without a key registers without `_id`.
 */
export interface RelationSummary {
  /** The native schema, used verbatim as the schema id. */
  schema: string;
  /** The native name, used verbatim as the table id. */
  name: string;
  kind: RelationKind;
  estimatedRows: number | null;
  estimate: EstimateSource | null;
  key: RelationKey | null;
  /** Why the relation cannot be registered, when it cannot. */
  unmappable?: string;
  writes: RelationWrites;
  comment: string | null;
}

/** How an identity column takes its values. */
export type IdentityKind = "always" | "by default";

/**
 * A field type a column may be declared as, in the spelling `@Field` takes (`"string"`,
 * `"number"`, `"date"`, `"boolean"`, `"object"`, `"string[]"`, …), with the reason it does not
 * round-trip when it does not.
 */
export interface DeclaredReading {
  declared: string;
  lossy?: string;
}

/**
 * One column of a relation.
 */
export interface ColumnDescription {
  /** The native name, used verbatim as the field name. */
  name: string;
  /** The native type with its modifiers, e.g. `character varying(200)`. */
  native: string;
  nullable: boolean;
  hasDefault: boolean;
  generated: boolean;
  identity: IdentityKind | null;
  /** An enum's labels, in their sort order. */
  enumLabels?: string[];
  /**
   * The declarations registration accepts for this column, the one a generator should propose
   * first. Empty when the native type is not supported, and then `unsupported` says why.
   */
  accepts: DeclaredReading[];
  unsupported?: string;
  /** Why a write never assigns this column, when it never does. */
  readOnly?: string;
  comment: string | null;
}

/** Columns of one relation, named `"schema.name"`. */
export interface RelationColumns {
  relation: string;
  columns: string[];
}

/** A declared foreign key. */
export interface Reference {
  name: string;
  from: RelationColumns;
  to: RelationColumns;
}

/** An index the database holds on a relation. */
export interface IndexDescription {
  name: string;
  columns: string[];
  unique: boolean;
}

/**
 * A relation in full: its columns, its indexes, and the foreign keys out of it and into it.
 */
export interface RelationDescription extends RelationSummary {
  columns: ColumnDescription[];
  indexes: IndexDescription[];
  references: Reference[];
  referencedBy: Reference[];
}

/** A measure that did not finish in its time. */
export interface MeasureTimeout {
  status: "timeout";
}

/** A measure the database refused, by its error code only. */
export interface MeasureError {
  status: "error";
  code: string;
}

/** A measure's value. */
export interface MeasureValue<T> {
  status: "ok";
  value: T;
}

/**
 * The outcome of one measure. A measure that times out or fails leaves the others standing.
 */
export type Measure<T> = MeasureValue<T> | MeasureTimeout | MeasureError;

/** How a profile sampled its relation, when it did. */
export interface SampleInfo {
  percent: number;
  rows: number;
}

/** A row count, and whether it was counted or estimated. */
export interface RowCount {
  rows: number;
  exact: boolean;
}

/** The ends of a number, date or enum column. Dates are ISO strings. */
export interface ValueRange {
  min: number | string;
  max: number | string;
}

/** Rows in one calendar month, `YYYY-MM`, in UTC. */
export interface MonthCount {
  month: string;
  rows: number;
}

/** One category of a column, with its rows. */
export interface CategoryCount {
  value: string | number | boolean;
  rows: number;
}

/**
 * The categories of a column with few distinct values. Values counted too rarely to be a
 * category are folded into `other`, and never named.
 */
export interface Categories {
  values: CategoryCount[];
  other: number;
}

/** Lengths of a text column's values. */
export interface LengthStats {
  min: number;
  avg: number;
  max: number;
}

/**
 * What a profile concludes about a column, from its measures:
 * - `enum-like`: an enum, or few distinct values over enough rows;
 * - `identifier-like`: one distinct value per row, never null;
 * - `label-candidate`: text that is nearly unique and short enough to show;
 * - `time-axis`: a date column filled enough and spread over enough months;
 * - `measure`: a number column that is neither a key nor a reference.
 */
export type ColumnTrait =
  | "enum-like"
  | "identifier-like"
  | "label-candidate"
  | "time-axis"
  | "measure";

/**
 * One column's profile. Only measures that apply to the column's type are present.
 */
export interface ColumnProfile {
  name: string;
  nulls?: Measure<number>;
  /** A lower bound when the profile is sampled. */
  distinct?: Measure<number>;
  range?: Measure<ValueRange>;
  months?: Measure<MonthCount[]>;
  categories?: Measure<Categories>;
  length?: Measure<LengthStats>;
  traits: ColumnTrait[];
}

/** How many children each referenced parent has, over a declared foreign key out of the relation. */
export interface FanOut {
  average: number;
  max: number;
  parentsWithoutChildren: number;
}

/** A declared foreign key out of the profiled relation, with its fan-out. */
export interface ReferenceProfile {
  reference: Reference;
  fanOut: Measure<FanOut>;
}

/** A declared foreign key into the profiled relation, with the referring relation's size. */
export interface InboundProfile {
  reference: Reference;
  estimatedRows: number | null;
}

/** The relation and columns to profile; every column when `columns` is absent. */
export interface ProfileRequest {
  relation: string;
  columns?: string[];
}

/**
 * Aggregates over a relation. It carries no row: values appear only as enum labels and as
 * categories.
 */
export interface RelationProfile {
  relation: string;
  rows: Measure<RowCount>;
  sample: SampleInfo | null;
  columns: ColumnProfile[];
  references: ReferenceProfile[];
  inbound: InboundProfile[];
}

/** One column of one relation, the relation named `"schema.name"`. */
export interface ColumnReference {
  relation: string;
  column: string;
}

/** A column that may refer to another without a declared foreign key. */
export interface ReferenceCheck {
  from: ColumnReference;
  to: ColumnReference;
}

/**
 * How much of a column's non-null values the other column holds, and whether that other column
 * is its relation's key.
 */
export interface ReferenceMatch {
  containment: number;
  checkedRows: number;
  sampled: boolean;
  targetIsKey: boolean;
}

/** The most rows a sample answers. */
export const SAMPLE_ROWS_LIMIT = 20;

/** The most characters a sampled value answers before it is cut. */
export const SAMPLE_TEXT_LENGTH = 200;

/** The relation, columns and number of rows to sample; every column when `columns` is absent. */
export interface SampleRequest {
  relation: string;
  columns?: string[];
  /** At most `SAMPLE_ROWS_LIMIT`. */
  limit: number;
}

/** A sampled value as text, cut at `SAMPLE_TEXT_LENGTH` characters. */
export interface SampledText {
  text: string;
  truncated: boolean;
}

/** A binary value, answered by its length only. */
export interface SampledBinary {
  bytes: number;
}

export type SampledValue = SampledText | SampledBinary | null;

/** Rows of a relation, each value in the order of `columns`. */
export interface RowSample {
  relation: string;
  columns: string[];
  rows: SampledValue[][];
  /** How the relation was sampled before its first rows were read, when it was. */
  sample: SampleInfo | null;
}

/**
 * The connected database: engine, version, database and role.
 *
 * Every function of this interface refuses outside development, and on a provider instance that
 * owns its tables rather than describing a database it was pointed at.
 */
export const Info = InterfaceFunction<() => Promise<CatalogInfo>>();

/**
 * Every relation the connection can see, in the given schemas or in all of them, partitions left
 * out: their parent is the table.
 */
export const ListRelations =
  InterfaceFunction<(schemas?: string[]) => Promise<RelationSummary[]>>();

/** The named relations, `"schema.name"`, in full. */
export const DescribeRelations =
  InterfaceFunction<(relations: string[]) => Promise<RelationDescription[]>>();

/**
 * Aggregates over one relation, read without writing anything and within a time bound per
 * measure. A large relation is sampled, and the answer says so.
 */
export const Profile =
  InterfaceFunction<(request: ProfileRequest) => Promise<RelationProfile>>();

/**
 * Whether one column's values are found in another's, for a reference the database does not
 * declare.
 */
export const CheckReference =
  InterfaceFunction<
    (check: ReferenceCheck) => Promise<Measure<ReferenceMatch>>
  >();

/**
 * A few rows of a relation, for a person to look at. Unlike every other function, it answers
 * row values: a consumer shows them to the project's owner and passes them to nothing else.
 */
export const SampleRows =
  InterfaceFunction<(request: SampleRequest) => Promise<RowSample>>();
