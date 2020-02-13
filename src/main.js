import { join, parse } from "path";

import getInput from "./getInput";
import handleCore from "./handleCore";
import createOutput from "./createOutput";

import minimist from "minimist";
import chalk from "chalk";

import inquirer from "inquirer";
import inquirerFuzzyPath from "inquirer-fuzzy-path";
inquirer.registerPrompt("fuzzypath", inquirerFuzzyPath);

const argv = minimist(process.argv.slice(2));

const askInputExcelInfo = () => {
  const questions = [
    {
      name: "excelFilePath",
      type: "fuzzypath",
      rootPath: "input",
      excludeFilter: nodePath => nodePath === "input/.gitignore",
      itemType: "file",
      message: `Target Excel file path`,
      depthLimit: 1
    },
    {
      name: "excelSheetName",
      message: `Excel sheet name`,
      type: "input"
    }
  ];
  return inquirer.prompt(questions);
};
const getInputExcelInfo = async argv => {
  if (argv._.lenght > 2) {
    return {
      excelFilePath: argv._[0],
      excelSheetName: argv._[1]
    };
  }
  return askInputExcelInfo();
};

async function run(argv) {
  const rootPath = process.cwd();
  const staticPath = join(rootPath, "static");
  const inputPath = join(rootPath, "input");
  const outputPath = join(rootPath, "output");

  const { excelFilePath, excelSheetName } = await getInputExcelInfo(argv);
  const excelFilePathInfo = parse(excelFilePath);

  try {
    const dataSet = await getInput({
      jsonSchemaPath: join(staticPath, "input.json"),
      inputPath,
      excelFileName: excelFilePathInfo.base,
      excelSheetName
    });

    const list = handleCore(dataSet.list);

    await createOutput(list, {
      jsonSchemaPath: join(staticPath, "output.json"),
      outputPath,
      outputFileNameBase: excelFilePathInfo.name
    });

    console.log(chalk.green("Done!"));
  } catch (ex) {
    console.error(ex);
  }
}

run(argv);
