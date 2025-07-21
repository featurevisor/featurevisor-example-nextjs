import { flag } from "flags/next";
import { createFeaturevisorAdapter } from "./featurevisor";

const featurevisorAdapter = createFeaturevisorAdapter({
  datafileUrl:
    "https://featurevisor-example-cloudflare.pages.dev/production/featurevisor-tag-all.json",
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  // f: existingFeaturevisorInstance, // pass an existing Featurevisor SDK instance if any
});

export const myFeatureFlag = flag({
  // "<featureKey>" as the feature key alone to get its flag (boolean) status
  // "<featureKey>:variation" is to get the variation (string) of the feature
  // "<featureKey>:<variableKey>" is to get the variable value of the feature
  key: "my_feature",
  adapter: featurevisorAdapter(),
});

export const myFeatureVariation = flag({
  key: "my_feature:variation",
  adapter: featurevisorAdapter(),
});

export const myFeatureVariable = flag({
  key: "my_feature:variableKeyHere",
  adapter: featurevisorAdapter(),
});
