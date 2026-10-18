import type { Adapter } from "flags";
import { createFeaturevisor, type Featurevisor } from "@featurevisor/sdk";

export interface FeaturevisorAdapterOptions {
  datafileUrl: string;
  refreshInterval?: number;
  instance?: Featurevisor;
}

export interface FeaturevisorEntitiesType {
  userId?: string;
  // ...more properties for your context can be added here
}

export function createFeaturevisorAdapter(options: FeaturevisorAdapterOptions) {
  const f = options.instance ?? createFeaturevisor();
  let initialFetchCompleted = false;
  let pendingFetch: Promise<void> | undefined;

  // datafile fetcher
  function fetchAndSetDatafile() {
    if (pendingFetch) {
      return pendingFetch;
    }

    console.log("[Featurevisor] Fetching datafile from:", options.datafileUrl);

    pendingFetch = fetch(options.datafileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
      })
      .then((datafile) => {
        if (!f.setDatafile(datafile, true)) {
          throw new Error("Datafile was rejected");
        }

        initialFetchCompleted = true;
      })
      .catch((error) =>
        console.error("[Featurevisor] Error fetching datafile:", error)
      )
      .finally(() => {
        pendingFetch = undefined;
      });

    return pendingFetch;
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
      async decide({ key, entities }): Promise<ValueType> {
        // ensure the datafile is fetched before making decisions
        if (!initialFetchCompleted) {
          await fetchAndSetDatafile();
        }

        const context = {
          userId: entities?.userId,
        };

        // Map the passed key to Featurevisor SDK methods:
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
