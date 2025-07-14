import { createInstance } from "@featurevisor/sdk";

const DATAFILE_URL =
  "https://featurevisor-example-cloudflare.pages.dev/production/featurevisor-tag-all.json";

export const f = createInstance({});

let initialFetchCompleted = false;

export async function getInstance() {
  if (initialFetchCompleted) {
    return f;
  }

  await fetch(DATAFILE_URL)
    .then((response) => response.json())
    .then((datafile) => {
      f.setDatafile(datafile);
    })
    .catch((error) => {
      console.error("Error fetching datafile:", error);
    });

  return f;
}
