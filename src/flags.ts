import { flag } from "flags/next";
import { createInstance } from "@featurevisor/sdk";

/**
 * Constants
 */
const DATAFILE_URL =
  "https://featurevisor-example-cloudflare.pages.dev/production/featurevisor-tag-all.json";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Featurevisor specific functions
 */
export const f = createInstance({});

let initialFetchCompleted = false;

export function fetchAndSetDatafile() {
  console.log("[Featurevisor] Fetching datafile from:", DATAFILE_URL);

  const result = fetch(DATAFILE_URL)
    .then((response) => response.json())
    .then((datafile) => f.setDatafile(datafile))
    .catch((error) =>
      console.error("[Featurevisor] Error fetching datafile:", error)
    );

  initialFetchCompleted = true;

  return result;
}

export async function getInstance() {
  if (initialFetchCompleted) {
    return f;
  }

  await fetchAndSetDatafile();

  if (REFRESH_INTERVAL > 0) {
    setInterval(async () => {
      await fetchAndSetDatafile();
    }, REFRESH_INTERVAL);
  }

  return f;
}

/**
 * Application flags
 */
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
