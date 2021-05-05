import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetBlockH1 = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetBlockH1), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const blockH1 = await db.blockH1.findFirst({ where: { id } })

  if (!blockH1) throw new NotFoundError()

  return blockH1
})
