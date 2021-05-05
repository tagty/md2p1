import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetSlidesInput
  extends Pick<Prisma.SlideFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSlidesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const { items: slides, hasMore, nextPage, count } = await paginate({
      skip,
      take,
      count: () => db.slide.count({ where }),
      query: (paginateArgs) => db.slide.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      slides,
      nextPage,
      hasMore,
      count,
    }
  }
)
