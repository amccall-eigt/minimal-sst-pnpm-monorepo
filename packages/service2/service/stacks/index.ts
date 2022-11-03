import * as url from "url";
const __dirname = url.fileURLToPath(new url.URL(".", import.meta.url));
import * as sst from "@serverless-stack/resources";
import sstJson from "../sst.json" assert { type: "json" };
const serviceName = sstJson.name;
import path from "path";

export function Service2Stack({ stack, app }: sst.StackContext) {
  const isCurrentLocal = app.name === serviceName;
  if (!isCurrentLocal) {
    const srcPath = path.relative(app.appPath, path.join(__dirname, "../../"));
    stack.setDefaultFunctionProps({
      srcPath: srcPath,
      timeout: 60,
    });
  }

  new sst.Function(stack, "service-2-function", {
    handler: "src/service2LambdaHandler.handler",
    bundle: {
      format: "esm",
      sourcemap: true,
      minify: false,
    },
  });
}
