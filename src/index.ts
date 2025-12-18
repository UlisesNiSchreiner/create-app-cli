#!/usr/bin/env node
import { Command } from "commander";

import { createCommand } from "./commands/create.js";

const program = new Command();

program
  .name("ulises-create-app")
  .description(
    "Scaffold an app from a GitHub template, initialize it, create a GitHub repo and push the first commit.",
  )
  .version("0.1.0");

program.addCommand(createCommand);

program.parse(process.argv);
