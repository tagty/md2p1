import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetBlockCode = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetBlockCode), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const blockCode = await db.blockCode.findFirst({ where: { id } })

  if (!blockCode) throw new NotFoundError()

  return blockCode
})
