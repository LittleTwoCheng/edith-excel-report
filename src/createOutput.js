import { createObjectCsvWriter } from "csv-writer";
import readJson from "./readJson";
import { join } from "path";

const getOutputFileName = (name, csvDef) =>
  `${csvDef.fileNamePrefix || ""}${name}${csvDef.fileNameSuffix || ""}.csv`;

export default function createOutput(
  list,
  { jsonSchemaPath, outputPath, outputFileNameBase }
) {
  const outputCsvSchema = readJson(jsonSchemaPath);

  return Promise.all(
    outputCsvSchema.map(async csvDef => {
      return createObjectCsvWriter({
        path: join(outputPath, getOutputFileName(outputFileNameBase, csvDef)),
        header: csvDef.header
      }).writeRecords(list);
    })
  );
}
