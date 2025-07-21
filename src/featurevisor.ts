import type { Adapter } from "flags";
import { createInstance, FeaturevisorInstance } from "@featurevisor/sdk";

export interface FeaturevisorAdapterOptions {
  datafileUrl: string;
  refreshInterval?: number;
  f?: FeaturevisorInstance;
}

export interface FeaturevisorEntitiesType {
  userId?: string;
  // ...more properties for your context can be added here
}

export function createFeaturevisorAdapter(options: FeaturevisorAdapterOptions) {
  const f = options.f || createInstance({});
  let initialFetchCompleted = false;

  // datafile fetcher
  function fetchAndSetDatafile() {
    console.log("[Featurevisor] Fetching datafile from:", options.datafileUrl);

    const result = fetch(options.datafileUrl)
      .then((response) => response.json())
      .then((datafile) => {
        f.setDatafile(datafile);
        initialFetchCompleted = true;
      })
      .catch((error) =>
        console.error("[Featurevisor] Error fetching datafile:", error)
      );

    return result;
  }

  // datafile refresher (periodic update)
  if (options.refreshInterval) {
    setInterval(async () => {
      await fetchAndSetDatafile();
    }, options.refreshInterval);
  }

  // adapter
  return function featurevisorAdapter<
    ValueType,
    EntitiesType extends FeaturevisorEntitiesType
  >(): Adapter<ValueType, EntitiesType> {
    return {
      async decide({ key, entities, headers, cookies }): Promise<ValueType> {
        // ensure the datafile is fetched before making decisions
        if (!initialFetchCompleted) {
          await fetchAndSetDatafile();
        }

        const context = {
          userId: entities?.userId,
        };

        // mapping passed key to Featurevisor SDK methods:
        //
        //   - "<featureKey>"               => f.isEnabled(key, context)
        //   - "<featureKey>:variation"     => f.getVariation(key, context)
        //   - "<featureKey>:<variableKey>" => f.getVariable(key, variableKey, context)
        const [featureKey, variableKey] = key.split(":");

        if (variableKey) {
          if (variableKey === "variation") {
            // variation
            return f.getVariation(featureKey, context) as ValueType;
          } else {
            // variable
            return f.getVariable(featureKey, variableKey, context) as ValueType;
          }
        }

        // flag
        return f.isEnabled(featureKey, context) as ValueType;
      },
    };
  };
}
