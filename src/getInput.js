import readXlsxFile from "read-excel-file/node";
import readJson from "./readJson";
import { join } from "path";

const patchSchema = schema =>
  schema.map(entry => {
    entry.schema = Object.entries(entry.schema).reduce(
      (merged, [colName, def]) => {
        switch (def.type) {
          case "String":
            def.type = String;
            break;
          case "Number":
            def.type = Number;
            break;
          case "Boolean":
            def.type = Boolean;
            break;
          case "Date":
            def.type = Date;
            break;
          default:
            if (!def.type) def.type = String;
            break;
        }
        merged[colName] = def;
        return merged;
      },
      {}
    );
    return entry;
  });

export default function getInput({
  jsonSchemaPath,
  inputPath,
  excelFileName,
  excelSheetName
}) {
  const dataSetSchema = readJson(jsonSchemaPath);

  return Promise.all(
    patchSchema(dataSetSchema).map(data =>
      readXlsxFile(join(inputPath, excelFileName), {
        sheet: excelSheetName,
        schema: data.schema
      }).then(({ rows, errors }) => {
        if (errors.length) {
          console.error(errors);
          throw Error(`fail to parse ${excelFileName} - ${data.schema}`);
        }
        return [data.name, rows];
      })
    )
  ).then(dataSetEntries =>
    dataSetEntries.reduce((merged, [name, rows]) => {
      merged[name] = rows;
      return merged;
    }, {})
  );
}
