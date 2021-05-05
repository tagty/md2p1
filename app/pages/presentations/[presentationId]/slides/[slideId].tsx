import { Suspense } from "react"
import { Head, Link, useQuery, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSlide from "app/slides/queries/getSlide"
import getPresentation from "app/presentations/queries/getPresentation"
import getBlockH1 from "app/block-h1s/queries/getBlockH1"

export const Slide = () => {
  const slideId = useParam("slideId", "number")
  const [slide] = useQuery(getSlide, { id: slideId })

  const block = slide?.blocks[0]
  const [blockH1] = useQuery(getBlockH1, { id: block.id })

  return (
    <>
      <Head>
        <title>Slide {slide.id}</title>
      </Head>

      <div>
        <h1>Slide {slide.id}</h1>
        <pre>{JSON.stringify(slide, null, 2)}</pre>
      </div>

      <div>
        <h1>{blockH1.text}</h1>
      </div>
    </>
  )
}

const ShowSlidePage: BlitzPage = () => {
  const presentationId = useParam("presentationId", "number")
  const [presentation] = useQuery(getPresentation, { id: presentationId })

  return (
    <div>
      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>
      {presentationId && (
        <p>
          <Link href={Routes.ShowPresentationPage({ presentationId: presentationId })}>
            <a>{presentation.title}</a>
          </Link>
        </p>
      )}

      <Suspense fallback={<div>Loading...</div>}>
        <Slide />
      </Suspense>
    </div>
  )
}

ShowSlidePage.authenticate = true
ShowSlidePage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowSlidePage
