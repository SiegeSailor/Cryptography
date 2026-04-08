type TInquirerLike = {
  prompt: <T = unknown>(questions: unknown) => Promise<T>;
};

let cachedInquirer: TInquirerLike | null = null;

export async function getInquirer(): Promise<TInquirerLike> {
  if (cachedInquirer) {
    return cachedInquirer;
  }

  const moduleNamespace = (await Function(
    'return import("inquirer")',
  )()) as { default?: TInquirerLike };
  cachedInquirer = (moduleNamespace.default ?? moduleNamespace) as TInquirerLike;
  return cachedInquirer;
}