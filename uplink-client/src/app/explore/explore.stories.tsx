import SessionDecorator from "../../../.storybook/decorators/SessionDecorator";
import { AllSpaces } from "./data";
import Layout from "./layout";

export default {
  title: "ui/explore",
  component: AllSpaces,
  decorators: [SessionDecorator],
};

const Template = (args: any) => (
  <Layout>
    <AllSpaces {...args} />
  </Layout>
);

export const Default = Template.bind({});
Default.args = {
  spaces: { data: { spaces: [{ name: "test", id: "test" }] } },
};

export const TenSpaces = Template.bind({});
TenSpaces.args = {
  spaces: {
    data: {
      spaces: [
        { name: "test", id: "test" },
        { name: "nouns", id: "test" },
        { name: "shark", id: "test" },
        { name: "links", id: "test" },
        { name: "test", id: "test" },
        { name: "test", id: "test" },
        { name: "test", id: "test" },
        { name: "test", id: "test" },
        { name: "test", id: "test" },
        { name: "test", id: "test" },
      ],
    },
  },
};