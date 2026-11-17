/**
 * Frontend CRUD templates. Output follows the advertisement feature layout:
 * types, api client, react-query hook, and a list page. Route registration is
 * intentionally not generated; the toolkit prints guidance instead.
 */
import { singularCamel, singularPascal, toCamel, toPascal } from '../lib/names.js'

const TS_TYPES = { string: 'string', number: 'number', boolean: 'boolean', date: 'string' }

/** Maps a backend scope to the mounted API base path. */
export function apiBasePath(name, scope) {
  return scope === 'admin' ? `/api/admin/${name}` : `/api/${name}`
}

/**
 * @param {{ name: string, fields: Array<{name: string, type: string}>, scope: string }} options
 * @returns {Record<string, string>} relative file path (inside the feature directory) -> content
 */
export function frontendFiles({ name, fields, scope }) {
  const Pascal = toPascal(name)
  const Model = singularPascal(name)
  const model = singularCamel(name)
  const camel = toCamel(name)
  const base = apiBasePath(name, scope)
  const typeFields = fields.map((field) => `  ${field.name}: ${TS_TYPES[field.type]}`).join('\n')

  return {
    [`types/${name}.types.ts`]: [
      `export interface ${Model} {`,
      '  id: string',
      typeFields,
      '  createdAt?: string',
      '  updatedAt?: string',
      '}',
      '',
      `export type ${Model}Input = Omit<${Model}, 'id' | 'createdAt' | 'updatedAt'>`,
      '',
    ].join('\n'),

    [`api/${name}.api.ts`]: [
      "import { apiClient } from '@/api/client'",
      `import type { ${Model}, ${Model}Input } from '../types/${name}.types'`,
      '',
      `// Matches the routes mounted at ${base} on the backend.`,
      `const BASE = '${base}'`,
      '',
      `export const ${camel}Api = {`,
      `  list: async (): Promise<${Model}[]> => {`,
      `    const { data } = await apiClient.get<{ items: ${Model}[] }>(BASE)`,
      '    return data.items',
      '  },',
      '',
      `  create: async (input: ${Model}Input): Promise<${Model}> => {`,
      `    const { data } = await apiClient.post<{ item: ${Model} }>(BASE, input)`,
      '    return data.item',
      '  },',
      '',
      `  update: async (id: string, input: ${Model}Input): Promise<${Model}> => {`,
      `    const { data } = await apiClient.put<{ item: ${Model} }>(BASE + '/' + id, input)`,
      '    return data.item',
      '  },',
      '',
      '  remove: async (id: string): Promise<void> => {',
      "    await apiClient.delete(BASE + '/' + id)",
      '  },',
      '}',
      '',
    ].join('\n'),

    [`hooks/use${Pascal}.ts`]: [
      "import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'",
      `import { ${camel}Api } from '../api/${name}.api'`,
      `import type { ${Model}Input } from '../types/${name}.types'`,
      '',
      `const QUERY_KEY = ['${name}']`,
      '',
      `/** Loads ${name} from the backend and exposes create, update, and remove mutations. */`,
      `export function use${Pascal}() {`,
      '  const queryClient = useQueryClient()',
      '',
      '  const query = useQuery({',
      `    queryKey: QUERY_KEY,`,
      `    queryFn: ${camel}Api.list,`,
      '  })',
      '',
      '  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })',
      '',
      '  const createMutation = useMutation({',
      `    mutationFn: (input: ${Model}Input) => ${camel}Api.create(input),`,
      '    onSuccess: invalidate,',
      '  })',
      '',
      '  const updateMutation = useMutation({',
      `    mutationFn: ({ id, input }: { id: string; input: ${Model}Input }) => ${camel}Api.update(id, input),`,
      '    onSuccess: invalidate,',
      '  })',
      '',
      '  const removeMutation = useMutation({',
      `    mutationFn: (id: string) => ${camel}Api.remove(id),`,
      '    onSuccess: invalidate,',
      '  })',
      '',
      '  return {',
      '    items: query.data ?? [],',
      '    isLoading: query.isLoading,',
      '    error: query.error,',
      '    createItem: createMutation,',
      '    updateItem: updateMutation,',
      '    removeItem: removeMutation,',
      '  }',
      '}',
      '',
    ].join('\n'),

    [`pages/${Pascal}Page.tsx`]: [
      "import { getErrorMessage } from '@/lib/getErrorMessage'",
      `import { use${Pascal} } from '../hooks/use${Pascal}'`,
      '',
      `export function ${Pascal}Page() {`,
      `  const { items, isLoading, error } = use${Pascal}()`,
      '',
      '  if (isLoading) return <p className="p-6 text-sm text-slate-500">Loading...</p>',
      '  if (error) return <p className="p-6 text-sm text-red-600">{getErrorMessage(error)}</p>',
      '',
      '  return (',
      '    <section className="p-6">',
      `      <h1 className="text-xl font-semibold text-slate-900">${Pascal}</h1>`,
      '      <table className="mt-4 w-full text-left text-sm">',
      '        <thead>',
      '          <tr>',
      '            <th className="px-3 py-2">ID</th>',
      ...fields.map((field) => `            <th className="px-3 py-2">${field.name}</th>`),
      '          </tr>',
      '        </thead>',
      '        <tbody>',
      '          {items.map((item) => (',
      '            <tr key={item.id} className="border-t border-slate-200">',
      '              <td className="px-3 py-2">{item.id}</td>',
      ...fields.map((field) => `              <td className="px-3 py-2">{String(item.${field.name} ?? '')}</td>`),
      '            </tr>',
      '          ))}',
      '        </tbody>',
      '      </table>',
      '    </section>',
      '  )',
      '}',
      '',
    ].join('\n'),
  }
}
