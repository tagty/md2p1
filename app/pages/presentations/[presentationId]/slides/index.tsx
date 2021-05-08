import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSlides from "app/slides/queries/getSlides"

const ITEMS_PER_PAGE = 1

export const SlidesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const presentationId = useParam("presentationId", "number")
  const [{ slides, hasMore }] = usePaginatedQuery(getSlides, {
    where: { presentation: { id: presentationId } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () =>
    router.push({ query: { presentationId: presentationId, page: page - 1 } })
  const goToNextPage = () =>
    router.push({ query: { presentationId: presentationId, page: page + 1 } })

  return (
    <div>
      <ul>
        {slides.map((slide) => (
          <div key={slide.id}>{slide.text}</div>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const SlidesPage: BlitzPage = () => {
  const presentationId = useParam("presentationId", "number")

  return (
    <>
      <Head>
        <title>Slides</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewSlidePage({ presentationId })}>
            <a>Create Slide</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <SlidesList />
        </Suspense>
      </div>
    </>
  )
}

SlidesPage.authenticate = true
SlidesPage.getLayout = (page) => <Layout>{page}</Layout>

export default SlidesPage
