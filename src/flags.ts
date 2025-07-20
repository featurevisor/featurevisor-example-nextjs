import { flag } from "flags/next";
import { getInstance } from "./featurevisor";

export const exampleFlag = flag({
  key: "exampleFlag",
  identify: ({ headers, cookies }) => {
    return {
      userId: "123", // Replace with actual user ID
      // ...additional context
    };
  },
  async decide({ entities }) {
    const featureKey = "my_feature"; // Replace with your feature key
    const f = await getInstance();

    return f.isEnabled(featureKey, {
      userId: entities?.userId,
    });
  },
});
