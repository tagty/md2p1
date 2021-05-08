import { Suspense } from "react"
import { Head, Link, useQuery, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPresentation from "app/presentations/queries/getPresentation"
import getSlides from "app/slides/queries/getSlides"

export const Presentation = () => {
  const presentationId = useParam("presentationId", "number")
  const [presentation] = useQuery(getPresentation, { id: presentationId })
  const [{ slides }] = useQuery(getSlides, {
    where: { presentation: { id: presentationId } },
    orderBy: { id: "asc" },
  })
  const slideId = slides[0]?.id

  return (
    <>
      <Head>
        <title>Presentation {presentation.id}</title>
      </Head>

      <div>
        <h1>Presentation {presentation.id}</h1>
        <pre>{JSON.stringify(presentation, null, 2)}</pre>

        <Link href={Routes.EditPresentationPage({ presentationId: presentation.id })}>
          <a>Edit</a>
        </Link>
      </div>

      {presentationId && slideId && (
        <p>
          <Link href={Routes.ShowSlidePage({ presentationId: presentationId, slideId: slideId })}>
            <a>Slide</a>
          </Link>
        </p>
      )}

      <p>
        <Link href={Routes.SlidesPage({ presentationId: presentationId })}>
          <a>Slides</a>
        </Link>
      </p>
    </>
  )
}

const ShowPresentationPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Presentation />
      </Suspense>
    </div>
  )
}

ShowPresentationPage.authenticate = true
ShowPresentationPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowPresentationPage
