import { State } from "@serverless-stack/core";
import fs from "fs-extra";
import * as url from "url";
const __dirname = url.fileURLToPath(new url.URL(".", import.meta.url));
import * as sst from "@serverless-stack/resources";
import sstJson from "../sst.json" assert { type: "json" };
const serviceName = sstJson.name;
import path from "path";

export function Service2Stack({ stack, app }: sst.StackContext) {
  const isCurrentLocal = app.name === serviceName;
  const srcPath = path.relative(app.appPath, path.join(__dirname, "../../"));
  if (!isCurrentLocal) {
    console.log("app path", app.appPath);
    console.log("srcPath might be", srcPath);
    stack.setDefaultFunctionProps({
      srcPath: srcPath,
      timeout: 60,
    });
  }

  const artifactPath = (id: string) =>
    State.Function.artifactsPath(app.appPath, id);

  const handlerName = "src/service2LambdaHandler.handler";
  const dir = path.dirname(handlerName);
  const base = path.basename(handlerName).split(".")[0];
  const file = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]
    .map((ext) => path.join(dir, base + ext))
    .find((file) => {
      const p = path.join(srcPath, file);
      return fs.existsSync(p);
    });

  const replacedSrcPath = srcPath.replaceAll("..", ".");
  console.log("replaced srcPath", replacedSrcPath);
  console.log("computed file", file);
  console.log("join parts", [
    artifactPath(stack.stackName + "service-2-function"),
    path
      .relative(app.appPath, path.resolve(replacedSrcPath))
      .split(path.sep)
      .filter((x) => x !== "node_modules")
      .join(path.sep),
    path.dirname(file!),
    base + ".js",
  ]);

  const target = path.join(
    artifactPath(stack.stackName + "service-2-function"),
    path
      .relative(app.appPath, path.resolve(replacedSrcPath))
      .split(path.sep)
      .filter((x) => x !== "node_modules")
      .join(path.sep),
    path.dirname(file!),
    base + ".js"
  );

  const func = new sst.Function(stack, "service-2-function", {
    handler: handlerName,
    bundle: {
      commandHooks: {
        beforeBundling: (inputDir, outputDir) => {
          return ["echo beforeBundle"];
        },
        beforeInstall: (inputDir, outputDir) => {
          return ["echo beforeInstall"];
        },
        afterBundling: (inputDir, outputDir) => {
          console.log("afterBundling outputDir", outputDir);
          return ["echo afterBundle"];
        },
      },
    },
  });

  console.log("funcId", func.node.id);
  console.log("stackId", stack.stackName);
  console.log(
    "func artifact path",
    artifactPath(stack.stackName + func.node.id)
  );
  console.log("computed target path", target);

  const handler = path
    .join(
      path
        .relative(app.appPath, path.resolve(replacedSrcPath))
        .split(path.sep)
        .filter((x) => x !== "node_modules")
        .join(path.sep),
      handlerName
    )
    .replace(/\\/g, "/");
  console.log("computed handler", handler);
}
