export interface TableQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | undefined>;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupabaseFilterableQuery<Q> {
  eq: (column: string, value: string) => Q;
  or: (filters: string) => Q;
  order: (column: string, options?: { ascending?: boolean }) => Q;
  range: (from: number, to: number) => Q;
}

export interface ApplyTableQueryConfig {
  searchColumns?: string[];
  allowedSortColumns?: Record<string, string>;
  defaultSortColumn?: string;
  defaultSortDir?: "asc" | "desc";
  filterColumnMap?: Record<string, string>;
  maxPageSize?: number;
}

export function normalizePagination(params?: TableQueryParams, maxPageSize = 50) {
  const page = Math.max(1, Math.floor(params?.page ?? 1));
  const pageSize = Math.min(maxPageSize, Math.max(1, Math.floor(params?.pageSize ?? 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function sanitizePostgrestSearch(raw: string): string {
  return raw.replace(/[,%()*\\]/g, " ").trim().slice(0, 80);
}

export function applyTableQuery<Q extends SupabaseFilterableQuery<Q>>(
  baseQuery: Q,
  params: TableQueryParams | undefined,
  config: ApplyTableQueryConfig,
): { query: Q; page: number; pageSize: number } {
  const { page, pageSize, from, to } = normalizePagination(params, config.maxPageSize ?? 50);
  let query = baseQuery;

  if (params?.filters && config.filterColumnMap) {
    for (const [filterKey, column] of Object.entries(config.filterColumnMap)) {
      const value = params.filters[filterKey];
      if (value && value !== "all") {
        query = query.eq(column, value);
      }
    }
  }

  const cleanedSearch = params?.search ? sanitizePostgrestSearch(params.search) : "";
  if (cleanedSearch && config.searchColumns && config.searchColumns.length > 0) {
    const clauses = config.searchColumns.map((col) => `${col}.ilike.%${cleanedSearch}%`).join(",");
    query = query.or(clauses);
  }

  const mappedSort =
    params?.sortBy && config.allowedSortColumns
      ? config.allowedSortColumns[params.sortBy]
      : undefined;
  const sortColumn = mappedSort ?? config.defaultSortColumn ?? "created_at";
  const sortAsc = (params?.sortDir ?? config.defaultSortDir ?? "desc") === "asc";

  query = query.order(sortColumn, { ascending: sortAsc }).range(from, to);

  return { query, page, pageSize };
}

export function toPaginatedResult<T>(
  rows: T[] | null,
  count: number | null,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const safeRows = rows ?? [];
  const total = count ?? safeRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { rows: safeRows, total, page, pageSize, totalPages };
}
