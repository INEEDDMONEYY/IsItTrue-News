/**
 * Backend CRUD templates. Output mirrors backend/modules/promotionalCodes:
 * model, validation, repository, service, controller, routes.
 */
import { singularCamel, singularPascal, toPascal, toCamel } from '../lib/names.js'

export const BACKEND_SCOPES = ['admin', 'public-read']

const MONGOOSE_TYPES = { string: 'String', number: 'Number', boolean: 'Boolean', date: 'Date' }
const TS_TYPES = { string: 'string', number: 'number', boolean: 'boolean', date: 'Date' }

function zodFor(type) {
  if (type === 'number') return 'z.coerce.number()'
  if (type === 'boolean') return 'z.boolean()'
  if (type === 'date') return 'z.coerce.date()'
  return 'z.string().trim().min(1).max(500)'
}

/**
 * @param {{ name: string, fields: Array<{name: string, type: string}>, scope: string }} options
 * @returns {Record<string, string>} relative file path (inside the module directory) -> content
 */
export function backendFiles({ name, fields, scope }) {
  const Pascal = toPascal(name)
  const Model = singularPascal(name)
  const model = singularCamel(name)
  const Routes = `${toCamel(name)}Routes`
  const schemaFields = fields
    .map((field) => `    ${field.name}: { type: ${MONGOOSE_TYPES[field.type]}, required: true${field.type === 'string' ? ', trim: true' : ''} },`)
    .join('\n')
  const zodFields = fields.map((field) => `  ${field.name}: ${zodFor(field.type)},`).join('\n')
  const writeGuard = scope === 'admin'
    ? "router.use(authenticate, authorize(ROLES.ADMIN))\n\nrouter.get('/', controller.list)\nrouter.get('/:id', controller.get)\nrouter.post('/', validate(inputSchema), controller.create)\nrouter.put('/:id', validate(inputSchema), controller.update)\nrouter.delete('/:id', controller.remove)"
    : "const adminOnly = [authenticate, authorize(ROLES.ADMIN)]\n\nrouter.get('/', controller.list)\nrouter.get('/:id', controller.get)\nrouter.post('/', ...adminOnly, validate(inputSchema), controller.create)\nrouter.put('/:id', ...adminOnly, validate(inputSchema), controller.update)\nrouter.delete('/:id', ...adminOnly, controller.remove)"

  return {
    [`models/${Model}.ts`]: [
      "import mongoose, { Schema } from 'mongoose'",
      '',
      `const ${model}Schema = new Schema(`,
      '  {',
      schemaFields,
      '  },',
      '  { timestamps: true },',
      ')',
      '',
      `${model}Schema.set('toJSON', {`,
      '  transform(_doc, ret: Record<string, unknown>) {',
      '    ret.id = String(ret._id)',
      '    delete ret._id',
      '    delete ret.__v',
      '    return ret',
      '  },',
      '})',
      '',
      `export const ${Model}Model = mongoose.model('${Model}', ${model}Schema)`,
      '',
    ].join('\n'),

    [`validations/${name}.validation.ts`]: [
      "import { z } from 'zod'",
      '',
      `const inputSchema = z.object({`,
      zodFields,
      '})',
      '',
      `export const ${model}InputSchema = inputSchema`,
      `export type ${Model}Input = z.infer<typeof inputSchema>`,
      '',
    ].join('\n'),

    [`repositories/${name}.repository.ts`]: [
      `import { ${Model}Model } from '../models/${Model}.js'`,
      `import type { ${Model}Input } from '../validations/${name}.validation.js'`,
      '',
      `export const ${toCamel(name)}Repository = {`,
      `  findAll: () => ${Model}Model.find().sort({ createdAt: -1 }).exec(),`,
      `  findById: (id: string) => ${Model}Model.findById(id).exec(),`,
      `  create: (input: ${Model}Input) => ${Model}Model.create(input),`,
      `  updateById: (id: string, input: ${Model}Input) =>`,
      `    ${Model}Model.findByIdAndUpdate(id, input, { new: true, runValidators: true }).exec(),`,
      `  deleteById: (id: string) => ${Model}Model.findByIdAndDelete(id).exec(),`,
      '}',
      '',
    ].join('\n'),

    [`services/${name}.service.ts`]: [
      "import mongoose from 'mongoose'",
      `import { AppError } from '../../../shared/errors/AppError.js'`,
      `import { ${toCamel(name)}Repository } from '../repositories/${name}.repository.js'`,
      `import type { ${Model}Input } from '../validations/${name}.validation.js'`,
      '',
      'function assertValidId(id: string): void {',
      '  if (!mongoose.isValidObjectId(id)) {',
      `    throw new AppError('${Model} not found.', 404)`,
      '  }',
      '}',
      '',
      `export const ${toCamel(name)}Service = {`,
      `  async list() {`,
      `    const docs = await ${toCamel(name)}Repository.findAll()`,
      '    return docs.map((doc) => doc.toJSON())',
      '  },',
      '',
      '  async get(id: string) {',
      '    assertValidId(id)',
      `    const doc = await ${toCamel(name)}Repository.findById(id)`,
      `    if (!doc) throw new AppError('${Model} not found.', 404)`,
      '    return doc.toJSON()',
      '  },',
      '',
      `  async create(input: ${Model}Input) {`,
      `    const doc = await ${toCamel(name)}Repository.create(input)`,
      '    return doc.toJSON()',
      '  },',
      '',
      `  async update(id: string, input: ${Model}Input) {`,
      '    assertValidId(id)',
      `    const doc = await ${toCamel(name)}Repository.updateById(id, input)`,
      `    if (!doc) throw new AppError('${Model} not found.', 404)`,
      '    return doc.toJSON()',
      '  },',
      '',
      '  async remove(id: string) {',
      '    assertValidId(id)',
      `    const doc = await ${toCamel(name)}Repository.deleteById(id)`,
      `    if (!doc) throw new AppError('${Model} not found.', 404)`,
      '  },',
      '}',
      '',
    ].join('\n'),

    [`controllers/${name}.controller.ts`]: [
      "import type { Request, Response } from 'express'",
      "import { asyncHandler } from '../../../utils/asyncHandler.js'",
      `import { ${toCamel(name)}Service } from '../services/${name}.service.js'`,
      `import type { ${Model}Input } from '../validations/${name}.validation.js'`,
      '',
      `export const ${toCamel(name)}Controller = {`,
      '  list: asyncHandler(async (_req: Request, res: Response) => {',
      `    const items = await ${toCamel(name)}Service.list()`,
      '    res.status(200).json({ items })',
      '  }),',
      '',
      '  get: asyncHandler(async (req: Request, res: Response) => {',
      `    const item = await ${toCamel(name)}Service.get(String(req.params.id))`,
      '    res.status(200).json({ item })',
      '  }),',
      '',
      '  create: asyncHandler(async (req: Request, res: Response) => {',
      `    const item = await ${toCamel(name)}Service.create(req.body as ${Model}Input)`,
      `    res.status(201).json({ message: '${Pascal} created successfully.', item })`,
      '  }),',
      '',
      '  update: asyncHandler(async (req: Request, res: Response) => {',
      `    const item = await ${toCamel(name)}Service.update(String(req.params.id), req.body as ${Model}Input)`,
      `    res.status(200).json({ message: '${Pascal} updated successfully.', item })`,
      '  }),',
      '',
      '  remove: asyncHandler(async (req: Request, res: Response) => {',
      `    await ${toCamel(name)}Service.remove(String(req.params.id))`,
      `    res.status(200).json({ message: '${Pascal} deleted successfully.' })`,
      '  }),',
      '}',
      '',
    ].join('\n'),

    [`routes/${name}.routes.ts`]: [
      "import { Router } from 'express'",
      "import { authenticate } from '../../../middleware/authenticate.js'",
      "import { authorize } from '../../../middleware/authorize.js'",
      "import { validate } from '../../../middleware/validate.js'",
      "import { ROLES } from '../../../shared/constants/roles.js'",
      `import { ${toCamel(name)}Controller as controller } from '../controllers/${name}.controller.js'`,
      `import { ${model}InputSchema as inputSchema } from '../validations/${name}.validation.js'`,
      '',
      'const router = Router()',
      '',
      writeGuard,
      '',
      `export const ${Routes} = router`,
      '',
    ].join('\n'),
  }
}
