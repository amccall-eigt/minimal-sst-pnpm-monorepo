import * as sst from "@serverless-stack/resources";
import { Service2Stack } from "./index.js";
/** This app is for local development of the constructs and should not be imported into anything */
export default function main(app: sst.App): void {
  app.setDefaultRemovalPolicy("destroy");
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
  });

  app.stack(Service2Stack);
}
