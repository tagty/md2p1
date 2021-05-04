import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextArea } from "app/core/components/LabeledTextArea"
import * as z from "zod"
export { FORM_ERROR } from "app/core/components/Form"

export function PresentationForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="title" label="Title" placeholder="Title" />
      <LabeledTextArea name="text" label="Text" placeholder="Text" />
    </Form>
  )
}
