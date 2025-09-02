import {
  ApplicationCommand,
  ApplicationCommandOption,
  APIApplicationCommandOptionChoice,
} from "discord.js";

interface LocalCommand {
  description: string;
  options?: LocalCommandOption[];
}

interface LocalCommandOption {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: LocalCommandOptionChoice[];
}

interface LocalCommandOptionChoice {
  name: string;
  value: string | number;
}

export default function areCommandsDifferent(
  existingCommand: ApplicationCommand,
  localCommand: LocalCommand
): boolean {
  const areChoicesDifferent = (
    existingChoices: APIApplicationCommandOptionChoice[],
    localChoices: LocalCommandOptionChoice[]
  ): boolean => {
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices?.find(
        (choice) => choice.name === localChoice.name
      );

      if (!existingChoice) {
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        return true;
      }
    }
    return false;
  };

  const areOptionsDifferent = (
    existingOptions: ApplicationCommandOption[],
    localOptions: LocalCommandOption[]
  ): boolean => {
    for (const localOption of localOptions) {
      const existingOption = existingOptions?.find(
        (option) => option.name === localOption.name
      );

      if (!existingOption) {
        return true;
      }

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== (existingOption as any).required ||
        (localOption.choices?.length || 0) !==
          ((existingOption as any).choices?.length || 0) ||
        areChoicesDifferent(
          (existingOption as any).choices || [],
          localOption.choices || []
        )
      ) {
        return true;
      }
    }
    return false;
  };

  if (
    existingCommand.description !== localCommand.description ||
    existingCommand.options?.length !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(
      existingCommand.options || [],
      localCommand.options || []
    )
  ) {
    return true;
  }

  return false;
}
