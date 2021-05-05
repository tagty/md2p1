import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetSlide = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetSlide), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const slide = await db.slide.findFirst({ where: { id } })

  if (!slide) throw new NotFoundError()

  return slide
})
