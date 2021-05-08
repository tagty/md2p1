import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetBlockList = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetBlockList), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const blockList = await db.blockList.findFirst({ where: { id } })

  if (!blockList) throw new NotFoundError()

  return blockList
})
