// PostgreSQL metadata queries for Supabase
export const listTablesSql = (schemas?: string[]) => {
  const schemaFilter =
    schemas && schemas.length > 0
      ? `AND schemaname = ANY(ARRAY[${schemas.map((s) => `'${s}'`).join(", ")}])`
      : `AND schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')`;

  return `
    SELECT 
      schemaname as schema,
      tablename as name,
      tableowner as owner,
      hasindexes,
      hasrules,
      hastriggers,
      rowsecurity
    FROM pg_tables 
    WHERE 1=1 ${schemaFilter}
    ORDER BY schemaname, tablename;
  `;
};

export const getTableDetailsSql = (schema: string, table: string) => `
  SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
  FROM information_schema.columns 
  WHERE table_schema = '${schema}' AND table_name = '${table}'
  ORDER BY ordinal_position;
`;

export const getTableRowCountSql = (schema: string, table: string) => `
  SELECT COUNT(*) as count FROM "${schema}"."${table}";
`;
