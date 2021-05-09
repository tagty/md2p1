import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetBlockImage = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetBlockImage), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const blockImage = await db.blockImage.findFirst({ where: { id } })

  if (!blockImage) throw new NotFoundError()

  return blockImage
})
