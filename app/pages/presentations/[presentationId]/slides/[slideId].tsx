import { Suspense } from "react"
import { Head, Link, useQuery, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getSlide from "app/slides/queries/getSlide"
import getBlockH1 from "app/block-h1s/queries/getBlockH1"
import getBlockList from "app/block-lists/queries/getBlockList"
// import getPresentation from "app/presentations/queries/getPresentation"

const BlockH1 = ({ block }) => {
  const [buildable] = useQuery(getBlockH1, { id: block.buildableId })
  return <h1>{buildable.text}</h1>
}

const BlockList = ({ block }) => {
  const [buildable] = useQuery(getBlockList, { id: block.buildableId })
  return <li>{buildable.text}</li>
}

export const Slide = () => {
  const slideId = useParam("slideId", "number")
  const [slide] = useQuery(getSlide, { id: slideId })

  return (
    <>
      <Head>
        <title>Slide {slide.id}</title>
      </Head>

      <div>
        {slide.blocks.map((block) => (
          <div key={block.id}>
            {block.buildableType === "BlockH1" ? (
              <BlockH1 block={block} />
            ) : (
              <BlockList block={block} />
            )}
          </div>
        ))}
      </div>
    </>
  )
}

const ShowSlidePage: BlitzPage = () => {
  // const presentationId = useParam("presentationId", "number")
  // const [presentation] = useQuery(getPresentation, { id: presentationId })

  return (
    <div>
      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>
      {/* {presentationId && (
        <p>
          <Link href={Routes.ShowPresentationPage({ presentationId: presentationId })}>
            <a>{presentation.title}</a>
          </Link>
        </p>
      )} */}

      <Suspense fallback={<div>Loading...</div>}>
        <Slide />
      </Suspense>
    </div>
  )
}

ShowSlidePage.authenticate = true
ShowSlidePage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowSlidePage
